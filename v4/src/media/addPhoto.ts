import { assertPathFree, PathTakenError } from "@/editor/albums";
import { invalidateAlbum } from "@/gallery/cache";
import { clearRedirect } from "@/gallery/redirects";
import { touchAlbum } from "@/gallery/v4/touch";
import { db } from "@/prisma/db";

import { filenameStem, slugifyFilename } from "./naming";
import {
  inspectUpload,
  maxInputPixels,
  storageKeyFor,
  storeOriginal,
  takenAtOf,
} from "./pipeline";
import { mediaStorage } from "./storage";

export type AddPhotoError = "unsupported" | "tooManyPixels" | "exists";

export type AddPhotoResult =
  | { ok: true; photo: { id: string; path: string }; replaced: boolean }
  | { ok: false; error: AddPhotoError };

/**
 * Removes a photo's rendered media (rows and files) and any of its jobs, leaving the Photo row -
 * and its `mediaKeyBase` - in place, ready for a fresh original and job. Rows go first: a leftover
 * file is harmless, a row pointing at a deleted file is not (same reasoning as `deleteAlbumSubtree`).
 */
async function clearPhotoMedia(photoId: string): Promise<void> {
  const media = await db.orm.public.Media.where({ photoId })
    .select("storageKey")
    .all();
  await db.orm.public.Media.where({ photoId }).deleteAndCount();
  await db.orm.public.MediaJob.where({ photoId }).deleteAndCount();
  for (const m of media) await mediaStorage.delete(m.storageKey);
}

/**
 * Stores one image as a photo of the album and queues thumbnail/preview generation. Shared by the
 * upload endpoint and importers. Ordering stays 0 so photos sort by capture time.
 *
 * A file whose name matches an existing photo in the same album replaces it in place - same id,
 * path and storage key base, so permalinks and "used as album thumbnail" references keep working -
 * rather than being rejected. This is also how a failed or interrupted upload is retried: simply
 * uploading the same file again replaces whatever partial state was left behind.
 */
export async function addPhotoToAlbum(
  album: { id: string; path: string; parentId: string | null },
  createdById: string,
  filename: string,
  data: Buffer,
): Promise<AddPhotoResult> {
  const info = await inspectUpload(data);
  if (!info) return { ok: false, error: "unsupported" };
  if (info.width * info.height > maxInputPixels)
    return { ok: false, error: "tooManyPixels" };

  const slug = slugifyFilename(filename);
  const title = filenameStem(filename);
  const takenAt = await takenAtOf(data);

  const existing = await db.orm.public.Photo.where({
    albumId: album.id,
    slug,
  })
    .select("id", "path", "mediaKeyBase")
    .first();

  if (existing) {
    await clearPhotoMedia(existing.id);
    const keyBase = existing.mediaKeyBase || existing.path;
    const original = await storeOriginal(keyBase, data, info);
    await db.transaction(async (tx) => {
      await tx.orm.public.Photo.where({ id: existing.id }).update({
        title,
        takenAt,
        createdById,
      });
      await tx.orm.public.Media.create({ photoId: existing.id, ...original });
      await tx.orm.public.MediaJob.create({ photoId: existing.id });
    });
    await touchAlbum(album.id);
    invalidateAlbum("v4", album.id, album.parentId);
    return {
      ok: true,
      photo: { id: existing.id, path: existing.path },
      replaced: true,
    };
  }

  const photoPath = `${album.path === "/" ? "" : album.path}/${slug}`;
  // A photo path must not shadow an album or legacy content: photos win in path resolution.
  try {
    await assertPathFree(photoPath);
  } catch (error) {
    if (error instanceof PathTakenError) return { ok: false, error: "exists" };
    throw error;
  }
  // Storage keys are derived from this base, not from `path`, and never move; a renamed-away
  // album may have left files behind under the same key, so fall back to a unique base. A
  // replace above never needs this: it reuses its own existing key base, which nothing else was
  // ever assigned.
  const keyTaken = await db.orm.public.Media.where({
    storageKey: storageKeyFor(photoPath, "original", info.format),
  })
    .select("id")
    .first();
  const keyBase = keyTaken ? `${photoPath}-${Date.now().toString(36)}` : photoPath;

  const original = await storeOriginal(keyBase, data, info);

  const photo = await db.transaction(async (tx) => {
    const created = await tx.orm.public.Photo.create({
      albumId: album.id,
      slug,
      path: photoPath,
      mediaKeyBase: keyBase,
      title,
      takenAt,
      createdById,
    });
    await tx.orm.public.Media.create({ photoId: created.id, ...original });
    await tx.orm.public.MediaJob.create({ photoId: created.id });
    return created;
  });

  await clearRedirect(photoPath);
  await touchAlbum(album.id);
  invalidateAlbum("v4", album.id, album.parentId);
  return {
    ok: true,
    photo: { id: photo.id, path: photo.path },
    replaced: false,
  };
}
