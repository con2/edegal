import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

import { inspectStoredOriginal, queueJobUnlessPending } from "./backfill";
import { storageKeyFor } from "./pipeline";
import { activeBackend, type MediaStorage, storageFor } from "./storage";

export interface MigrateOptions {
  /** Without this, every file is still inspected but nothing is written. */
  apply: boolean;
  /** Stop after this many photos; default all. */
  limit?: number;
  /** Photos in flight at once; default 4. */
  concurrency?: number;
  log?: (line: string) => void;
}

export interface MigrateTally {
  photosScanned: number;
  originalsCopied: number;
  /** Target object already in the bucket with the source's size (a resumed run). */
  alreadyPresent: number;
  /** Target object in the bucket with a different size; left alone for a human to look at. */
  conflicts: number;
  jobsQueued: number;
  /** Scaled files of photos that have no original row, copied as they are. */
  orphanScaledCopied: number;
  missingFiles: number;
  bytesCopied: number;
}

interface MediaRow {
  id: string;
  role: "original" | "preview" | "thumbnail";
  format: "jpeg" | "webp" | "avif" | "png";
  storage_key: string;
  width: number;
  height: number;
}

interface PendingPhoto {
  id: string;
  album_id: string;
  path: string;
  media: MediaRow[];
}

const batchSize = 200;

/**
 * Photos whose original is still on the filesystem, or which have no original row at all but
 * scaled rows there. A photo whose original is already on S3 but whose legacy previews are not is
 * waiting for its media job, not for this tool.
 */
async function pendingPhotos(afterId: string | null, limit: number): Promise<PendingPhoto[]> {
  const { rows } = await pool.query<PendingPhoto>(
    `select p.id, p.album_id, p.path,
            jsonb_agg(jsonb_build_object(
              'id', m.id, 'role', m.role, 'format', m.format, 'storage_key', m.storage_key,
              'width', m.width, 'height', m.height)) as media
     from v4_photo p join v4_media m on m.photo_id = p.id and m.backend = 'fs'
     where ($1::uuid is null or p.id > $1::uuid)
     group by p.id
     having bool_or(m.role = 'original')
        or not exists (select 1 from v4_media o where o.photo_id = p.id and o.role = 'original')
     order by p.id
     limit $2`,
    [afterId, limit],
  );
  return rows;
}

async function forEachConcurrently<T>(items: readonly T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]!);
  });
  await Promise.all(lanes);
}

type CopyOutcome = "copied" | "present" | "conflict" | "missing";

/**
 * Puts one filesystem file at its canonical S3 key unless an object of the same size is already
 * there. A same-size object is taken as the result of an interrupted earlier run; a different
 * size is a conflict nobody should overwrite blindly.
 */
async function copyToS3(
  fs: MediaStorage,
  s3: MediaStorage,
  sourceKey: string,
  targetKey: string,
  contentType: string,
  apply: boolean,
): Promise<{ outcome: CopyOutcome; size: number }> {
  const source = await fs.stat(sourceKey);
  if (!source) return { outcome: "missing", size: 0 };
  const target = await s3.stat(targetKey);
  if (target) return { outcome: target.size === source.size ? "present" : "conflict", size: source.size };
  if (apply) await s3.putStream(targetKey, await fs.getStream(sourceKey), contentType, source.size);
  return { outcome: "copied", size: source.size };
}

/**
 * Moves every photo's filesystem media to the S3 backend. Originals are copied to the key derived
 * from the photo's current path (the NFS layout, recorded in `mediaKeyBase`, is not carried over)
 * and their rows repointed; a media job then has the worker render fresh previews straight into
 * the bucket, so legacy previews are never copied. Only photos without an original get their
 * scaled files copied as they are. Rerunnable: photos already on S3 are not selected again, and a
 * target object of the right size is accepted as already copied.
 */
export async function migrateMediaToS3(options: MigrateOptions): Promise<MigrateTally> {
  if (activeBackend !== "s3") throw new Error("S3 is not the active media backend (set S3_BUCKET)");
  const { apply, limit = Infinity, concurrency = 4, log = () => {} } = options;
  const fs = storageFor("fs");
  const s3 = storageFor("s3");
  const tally: MigrateTally = {
    photosScanned: 0,
    originalsCopied: 0,
    alreadyPresent: 0,
    conflicts: 0,
    jobsQueued: 0,
    orphanScaledCopied: 0,
    missingFiles: 0,
    bytesCopied: 0,
  };
  const touchedAlbums = new Set<string>();

  const repoint = async (row: MediaRow, targetKey: string, extra: { width?: number; height?: number; byteSize: number }) => {
    await db.orm.public.Media.where({ id: row.id }).update({ backend: "s3", storageKey: targetKey, ...extra });
  };

  const migrateOriginal = async (photo: PendingPhoto, original: MediaRow): Promise<boolean> => {
    const targetKey = storageKeyFor(photo.path, "original", original.format);
    const { outcome, size } = await copyToS3(fs, s3, original.storage_key, targetKey, `image/${original.format}`, apply);
    switch (outcome) {
      case "missing":
        tally.missingFiles++;
        log(`missing: ${original.storage_key}`);
        return false;
      case "conflict":
        tally.conflicts++;
        log(`conflict: ${targetKey} exists with a different size than ${original.storage_key}`);
        return false;
      case "present":
        tally.alreadyPresent++;
        break;
      case "copied":
        tally.originalsCopied++;
        tally.bytesCopied += size;
        log(`${apply ? "copied" : "would copy"} ${original.storage_key} -> ${targetKey}`);
    }
    const info = await inspectStoredOriginal(fs, original.storage_key);
    if (info && (info.width !== original.width || info.height !== original.height)) {
      log(`dimensions ${original.width}x${original.height} -> ${info.width}x${info.height}: ${original.storage_key}`);
    }
    if (apply) {
      await repoint(original, targetKey, { width: info?.width, height: info?.height, byteSize: size });
    }
    if (!apply || (await queueJobUnlessPending(photo.id))) tally.jobsQueued++;
    return true;
  };

  const migrateOrphanScaled = async (photo: PendingPhoto, rows: MediaRow[]): Promise<boolean> => {
    let any = false;
    for (const row of rows) {
      const targetKey = storageKeyFor(photo.path, row.role, row.format);
      const { outcome, size } = await copyToS3(fs, s3, row.storage_key, targetKey, `image/${row.format}`, apply);
      if (outcome === "missing") {
        tally.missingFiles++;
        log(`missing: ${row.storage_key}`);
        continue;
      }
      if (outcome === "conflict") {
        tally.conflicts++;
        log(`conflict: ${targetKey} exists with a different size than ${row.storage_key}`);
        continue;
      }
      if (outcome === "copied") {
        tally.orphanScaledCopied++;
        tally.bytesCopied += size;
      } else {
        tally.alreadyPresent++;
      }
      if (apply) await repoint(row, targetKey, { byteSize: size });
      any = true;
    }
    return any;
  };

  const processPhoto = async (photo: PendingPhoto) => {
    tally.photosScanned++;
    const original = photo.media.find((m) => m.role === "original");
    const done = original
      ? await migrateOriginal(photo, original)
      : await migrateOrphanScaled(
          photo,
          photo.media.filter((m) => m.role !== "original"),
        );
    if (!done) return;
    if (apply) await db.orm.public.Photo.where({ id: photo.id }).update({ mediaKeyBase: photo.path });
    touchedAlbums.add(photo.album_id);
  };

  let afterId: string | null = null;
  while (tally.photosScanned < limit) {
    const batch = await pendingPhotos(afterId, Math.min(batchSize, limit - tally.photosScanned));
    if (batch.length === 0) break;
    await forEachConcurrently(batch, concurrency, processPhoto);
    afterId = batch[batch.length - 1]!.id;
    log(`scanned ${tally.photosScanned} photos`);
  }

  if (apply && touchedAlbums.size > 0) {
    await pool.query(`update v4_album set updated_at = now() where id = any($1::uuid[])`, [[...touchedAlbums]]);
  }
  return tally;
}
