import { assertPathFree, PathTakenError } from "@/editor/albums";
import { invalidateAlbum } from "@/gallery/cache";
import { clearRedirect } from "@/gallery/redirects";
import { touchAlbum } from "@/gallery/v4/touch";
import { db } from "@/prisma/db";

import { filenameStem, slugifyFilename } from "./naming";
import { inspectUpload, maxInputPixels, storageKeyFor, storeOriginal, takenAtOf } from "./pipeline";

export type AddPhotoError = "unsupported" | "tooManyPixels" | "exists";

export type AddPhotoResult =
  | { ok: true; photo: { id: string; path: string } }
  | { ok: false; error: AddPhotoError };

/**
 * Stores one image as a new photo of the album and queues thumbnail/preview generation. Shared
 * by the upload endpoint and importers. Ordering stays 0 so photos sort by capture time.
 */
export async function addPhotoToAlbum(
  album: { id: string; path: string; parentId: string | null },
  createdById: string,
  filename: string,
  data: Buffer,
): Promise<AddPhotoResult> {
  const info = await inspectUpload(data);
  if (!info) return { ok: false, error: "unsupported" };
  if (info.width * info.height > maxInputPixels) return { ok: false, error: "tooManyPixels" };

  const slug = slugifyFilename(filename);
  const existing = await db.orm.public.Photo.where({ albumId: album.id, slug }).select("id").first();
  if (existing) return { ok: false, error: "exists" };

  const photoPath = `${album.path === "/" ? "" : album.path}/${slug}`;
  // A photo path must not shadow an album or legacy content: photos win in path resolution.
  try {
    await assertPathFree(photoPath);
  } catch (error) {
    if (error instanceof PathTakenError) return { ok: false, error: "exists" };
    throw error;
  }
  // Storage keys are derived from the path at upload time and never move; a renamed-away album
  // may have left files behind under the same key, so fall back to a unique key base.
  const keyTaken = await db.orm.public.Media.where({
    storageKey: storageKeyFor(photoPath, "original", "jpeg"),
  })
    .select("id")
    .first();
  const keyBase = keyTaken ? `${photoPath}-${Date.now().toString(36)}` : photoPath;

  const takenAt = await takenAtOf(data);
  const original = await storeOriginal(keyBase, data);

  const photo = await db.transaction(async (tx) => {
    const created = await tx.orm.public.Photo.create({
      albumId: album.id,
      slug,
      path: photoPath,
      title: filenameStem(filename),
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
  return { ok: true, photo: { id: photo.id, path: photo.path } };
}
