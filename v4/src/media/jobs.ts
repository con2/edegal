import { invalidateAlbum } from "@/gallery/cache";
import { touchAlbum } from "@/gallery/v4/touch";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { generateScaledMedia } from "./pipeline";
import { mediaStorage } from "./storage";

export interface ClaimedJob {
  id: string;
  photoId: string;
}

const maxAttempts = 3;

/** Takes one pending job, marking it running; concurrent workers never claim the same job. */
export async function claimJob(): Promise<ClaimedJob | null> {
  const { rows } = await pool.query<{ id: string; photo_id: string }>(
    `update v4_media_job
     set status = 'running', started_at = now(), attempts = attempts + 1
     where id = (
       select id from v4_media_job where status = 'pending' order by created_at for update skip locked limit 1
     )
     returning id, photo_id`,
  );
  const row = rows[0];
  return row ? { id: row.id, photoId: row.photo_id } : null;
}

async function readAll(key: string): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of mediaStorage.getStream(key)) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function isLandscape(media: { width: number; height: number } | undefined): boolean {
  return !!media && media.width >= media.height;
}

/**
 * The first landscape photo with a thumbnail, else the first photo with a thumbnail. Used when an
 * album has no thumbnail or lost it.
 */
export async function pickAutoThumbnail(albumId: string): Promise<string | null> {
  const photos = await db.orm.public.Photo.where({ albumId })
    .include("media")
    .orderBy([(p) => p.ordering.asc(), (p) => p.takenAt.asc(), (p) => p.slug.asc()])
    .all();
  const candidates = photos.filter((p) => p.media.some((m) => m.role === "thumbnail"));
  const landscape = candidates.find((p) => isLandscape(p.media.find((m) => m.role === "original")));
  return (landscape ?? candidates[0])?.id ?? null;
}

/**
 * Generates the scaled variants for one photo and maintains the album's automatic thumbnail: the
 * first processed photo becomes the thumbnail, and a later landscape photo replaces an
 * automatically chosen portrait one.
 */
export async function processMediaJob(job: ClaimedJob): Promise<void> {
  try {
    const photo = await db.orm.public.Photo.where({ id: job.photoId })
      .include("media")
      .include("album", (a) => a.include("thumbnailPhoto", (t) => t.include("media")))
      .first();
    if (!photo) throw new Error(`photo ${job.photoId} not found`);
    const original = photo.media.find((m) => m.role === "original");
    if (!original) throw new Error(`photo ${job.photoId} has no original`);

    // The same base the original was actually stored under, not `photo.path`: they can differ
    // when upload time found the path-derived key already taken by an orphaned file (left behind
    // by a renamed-away album) and picked a disambiguated base instead. Using `photo.path` here
    // would put this photo's own derivatives at that unrelated file's key.
    const keyBase = photo.mediaKeyBase || photo.path;
    const produced = await generateScaledMedia(keyBase, await readAll(original.storageKey));
    const existing = new Set(photo.media.map((m) => `${m.role}/${m.format}`));
    const fresh = produced.filter((m) => !existing.has(`${m.role}/${m.format}`));
    if (fresh.length > 0) {
      await db.orm.public.Media.createAll(fresh.map((m) => ({ photoId: photo.id, ...m })));
    }

    const { album } = photo;
    const currentThumbnailOriginal = album.thumbnailPhoto?.media.find((m) => m.role === "original");
    const shouldTakeOver =
      album.thumbnailPhotoId === null ||
      (album.thumbnailIsAuto && !isLandscape(currentThumbnailOriginal) && isLandscape(original));
    if (shouldTakeOver && album.thumbnailPhotoId !== photo.id) {
      await db.orm.public.Album.where({ id: album.id }).update({ thumbnailPhotoId: photo.id, thumbnailIsAuto: true });
    }

    await db.orm.public.MediaJob.where({ id: job.id }).update({
      status: "done",
      finishedAt: new Date().toISOString(),
      error: "",
    });
    await touchAlbum(album.id, shouldTakeOver ? album.parentId : null);
    invalidateAlbum(album.id, album.parentId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const current = await db.orm.public.MediaJob.where({ id: job.id }).first();
    const retry = (current?.attempts ?? maxAttempts) < maxAttempts;
    await db.orm.public.MediaJob.where({ id: job.id }).update({
      status: retry ? "pending" : "failed",
      finishedAt: retry ? null : new Date().toISOString(),
      error: message,
    });
    console.error(`media job ${job.id} for photo ${job.photoId} failed (${retry ? "will retry" : "giving up"}): ${message}`);
  }
}

/** Counts shown to the uploader while the worker catches up. */
export async function albumJobCounts(albumId: string): Promise<{ processing: number; failed: number }> {
  const { rows } = await pool.query<{ processing: string; failed: string }>(
    `select
       count(*) filter (where j.status in ('pending', 'running')) as processing,
       count(*) filter (where j.status = 'failed') as failed
     from v4_media_job j join v4_photo p on p.id = j.photo_id
     where p.album_id = $1`,
    [albumId],
  );
  return { processing: Number(rows[0]?.processing ?? 0), failed: Number(rows[0]?.failed ?? 0) };
}

/** How long a job may stay `running` before its worker is presumed dead. */
export const strandedAfterMinutes = 15;

/**
 * Returns jobs whose worker died mid-job to the queue. A worker that stops gracefully finishes
 * its jobs first, so only a killed pod or a lost node leaves jobs `running` this long. A job that
 * has already used its attempts is marked failed instead of looping forever.
 */
export async function requeueStrandedJobs(): Promise<{ requeued: number; failed: number }> {
  const { rows } = await pool.query<{ status: "pending" | "failed" }>(
    `update v4_media_job
     set status = case when attempts < $2 then 'pending' else 'failed' end::v4_media_job_status,
         started_at = null,
         finished_at = case when attempts < $2 then null else now() end,
         error = case when attempts < $2 then error else 'worker died while processing' end
     where status = 'running' and started_at < now() - make_interval(mins => $1)
     returning status`,
    [strandedAfterMinutes, maxAttempts],
  );
  return {
    requeued: rows.filter((r) => r.status === "pending").length,
    failed: rows.filter((r) => r.status === "failed").length,
  };
}

/**
 * Removes finished jobs so the table stays small: done jobs after a week, failed ones after a
 * month (their error text is the only record of what went wrong). Returns the number deleted.
 */
export async function cleanupFinishedJobs(): Promise<number> {
  const { rowCount } = await pool.query(
    `delete from v4_media_job
     where (status = 'done' and finished_at < now() - interval '7 days')
        or (status = 'failed' and finished_at < now() - interval '30 days')`,
  );
  return rowCount ?? 0;
}
