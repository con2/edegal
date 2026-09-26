import { assertPathFree, PathTakenError } from "@/editor/albums";
import { invalidateAlbum } from "@/gallery/cache";
import { clearRedirect } from "@/gallery/redirects";
import { touchAlbum } from "@/gallery/touch";
import { db } from "@/prisma/db";

import { filenameStem, slugifyFilename } from "./naming";
import {
  inspectUpload,
  maxInputPixels,
  type OriginalSource,
  storageKeyFor,
  storeOriginal,
  takenAtOf,
  type UploadInfo,
} from "./pipeline";
import { mediaStorage, storageFor } from "./storage";

/** The bytes to add: in memory (proxy upload, importers) or already in storage under `uploads/`. */
export type PhotoSource = Buffer | { uploadKey: string };

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
    .select("storageKey", "backend")
    .all();
  await db.orm.public.Media.where({ photoId }).deleteAndCount();
  await db.orm.public.MediaJob.where({ photoId }).deleteAndCount();
  for (const m of media) await storageFor(m.backend).delete(m.storageKey);
}

/**
 * A JPEG's dimensions and EXIF sit in its first segments, so this prefix is enough for almost
 * every camera file; sharp throws on a prefix that stops short, and the whole object is read then.
 */
const headerBytes = 256 * 1024;

async function readObject(key: string, end?: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of await mediaStorage.getStream(key, end === undefined ? undefined : { end })) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

interface Inspected {
  info: UploadInfo;
  takenAt: string | null;
  original: OriginalSource;
}

/** Decodes what is needed to add the photo, reading a stored object only as far as necessary. */
async function inspect(source: PhotoSource): Promise<Inspected | AddPhotoError> {
  if (Buffer.isBuffer(source)) {
    const info = await inspectUpload(source);
    if (!info) return "unsupported";
    if (info.width * info.height > maxInputPixels) return "tooManyPixels";
    return { info, takenAt: await takenAtOf(source), original: source };
  }
  const stat = await mediaStorage.stat(source.uploadKey);
  if (!stat) return "unsupported";
  const decode = async (data: Buffer) => {
    const info = await inspectUpload(data);
    return info ? { info, takenAt: await takenAtOf(data) } : null;
  };
  const decoded =
    (await decode(await readObject(source.uploadKey, headerBytes - 1)).catch(() => null)) ??
    (await decode(await readObject(source.uploadKey)).catch(() => null));
  if (!decoded) return "unsupported";
  if (decoded.info.width * decoded.info.height > maxInputPixels) return "tooManyPixels";
  return { ...decoded, original: { uploadKey: source.uploadKey, byteSize: stat.size } };
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
  source: PhotoSource,
): Promise<AddPhotoResult> {
  try {
    return await addInspected(album, createdById, filename, await inspect(source));
  } finally {
    // The temp object has either been copied to its canonical key or is unusable; either way
    // it is not wanted under `uploads/` any more.
    if (!Buffer.isBuffer(source)) await mediaStorage.delete(source.uploadKey);
  }
}

async function addInspected(
  album: { id: string; path: string; parentId: string | null },
  createdById: string,
  filename: string,
  inspected: Inspected | AddPhotoError,
): Promise<AddPhotoResult> {
  if (typeof inspected === "string") return { ok: false, error: inspected };
  const { info, takenAt, original: data } = inspected;

  const slug = slugifyFilename(filename);
  const title = filenameStem(filename);

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
    invalidateAlbum(album.id, album.parentId);
    return {
      ok: true,
      photo: { id: existing.id, path: existing.path },
      replaced: true,
    };
  }

  const photoPath = `${album.path === "/" ? "" : album.path}/${slug}`;
  // A photo path must not shadow an album: photos win in path resolution.
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
  invalidateAlbum(album.id, album.parentId);
  return {
    ok: true,
    photo: { id: photo.id, path: photo.path },
    replaced: false,
  };
}
