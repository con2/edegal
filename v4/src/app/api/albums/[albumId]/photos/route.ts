import { canUpload } from "@/gallery/access";
import { invalidateAlbum } from "@/gallery/cache";
import { touchAlbum } from "@/gallery/v4/touch";
import { getViewer } from "@/gallery/viewer";
import { slugifyFilename, uniqueSlug, filenameStem } from "@/media/naming";
import {
  inspectUpload,
  storeOriginal,
  storageKeyFor,
  takenAtOf,
} from "@/media/pipeline";
import { db } from "@/prisma/db";

export const maxUploadBytes = 100 * 1024 * 1024;

type UploadError =
  "tooLarge" | "unsupported" | "exists" | "forbidden" | "notFound";

function fail(error: UploadError, status: number) {
  return Response.json({ error }, { status });
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
  const data = Buffer.from(await request.arrayBuffer());
  if (data.byteLength > maxUploadBytes) return fail("tooLarge", 413);
  if (!(await inspectUpload(data))) return fail("unsupported", 415);

  const filename = decodeURIComponent(
    request.headers.get("x-file-name") ?? "photo.jpg",
  );
  const slug = slugifyFilename(filename);
  const existing = await db.orm.public.Photo.where({ albumId: album.id, slug })
    .select("id")
    .first();
  if (existing) return fail("exists", 409);

  const photoPath = `${album.path === "/" ? "" : album.path}/${slug}`;
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
