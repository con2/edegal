import { assertPathFree, PathTakenError } from "@/editor/albums";
import { canUpload } from "@/gallery/access";
import { invalidateAlbum } from "@/gallery/cache";
import { touchAlbum } from "@/gallery/v4/touch";
import { getViewer } from "@/gallery/viewer";
import { slugifyFilename, uniqueSlug, filenameStem } from "@/media/naming";
import {
  inspectUpload,
  maxInputPixels,
  storeOriginal,
  storageKeyFor,
  takenAtOf,
} from "@/media/pipeline";
import { db } from "@/prisma/db";

export const maxUploadBytes = 100 * 1024 * 1024;

type UploadError =
  | "tooLarge"
  | "tooManyPixels"
  | "unsupported"
  | "exists"
  | "forbidden"
  | "notFound";

function fail(error: UploadError, status: number) {
  return Response.json({ error }, { status });
}

/**
 * Reads the body while counting, so a chunked or misdeclared request cannot buffer more than the
 * limit before being rejected. Returns null once the limit is exceeded.
 */
async function readBodyCapped(
  request: Request,
  limit: number,
): Promise<Buffer | null> {
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, total);
}

/**
 * Receives one original per request (raw body, filename in X-File-Name), stores it, creates the
 * photo and queues thumbnail/preview generation. Ordering stays 0 so photos sort by capture time.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;
  const viewer = await getViewer();
  const album = await db.orm.public.Album.where({ id: albumId }).first();
  if (!album) return fail("notFound", 404);
  if (
    viewer.kind !== "user" ||
    !canUpload(viewer, { source: "v4", ownerId: album.ownerId })
  ) {
    return fail("forbidden", 403);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxUploadBytes) return fail("tooLarge", 413);
  const data = await readBodyCapped(request, maxUploadBytes);
  if (!data) return fail("tooLarge", 413);
  const info = await inspectUpload(data);
  if (!info) return fail("unsupported", 415);
  if (info.width * info.height > maxInputPixels)
    return fail("tooManyPixels", 413);

  const filename = decodeURIComponent(
    request.headers.get("x-file-name") ?? "photo.jpg",
  );
  const slug = slugifyFilename(filename);
  const existing = await db.orm.public.Photo.where({ albumId: album.id, slug })
    .select("id")
    .first();
  if (existing) return fail("exists", 409);

  const photoPath = `${album.path === "/" ? "" : album.path}/${slug}`;
  // A photo path must not shadow an album or legacy content: photos win in path resolution.
  try {
    await assertPathFree(photoPath);
  } catch (error) {
    if (error instanceof PathTakenError) return fail("exists", 409);
    throw error;
  }
  // Storage keys are derived from the path at upload time and never move; a renamed-away album
  // may have left files behind under the same key, so fall back to a unique key base.
  const keyTaken = await db.orm.public.Media.where({
    storageKey: storageKeyFor(photoPath, "original", "jpeg"),
  })
    .select("id")
    .first();
  const keyBase = keyTaken
    ? `${photoPath}-${Date.now().toString(36)}`
    : photoPath;

  const takenAt = await takenAtOf(data);
  const original = await storeOriginal(keyBase, data);

  const photo = await db.transaction(async (tx) => {
    const created = await tx.orm.public.Photo.create({
      albumId: album.id,
      slug,
      path: photoPath,
      title: filenameStem(filename),
      takenAt,
      createdById: viewer.userId,
    });
    await tx.orm.public.Media.create({ photoId: created.id, ...original });
    await tx.orm.public.MediaJob.create({ photoId: created.id });
    return created;
  });

  await touchAlbum(album.id);
  invalidateAlbum("v4", album.id, album.parentId);
  return Response.json(
    { photoId: photo.id, path: photo.path },
    { status: 201 },
  );
}

// Re-exported for tests that need to build a unique slug list the same way the route would.
export { uniqueSlug };
