import { canUpload } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { addPhotoToAlbum } from "@/media/addPhoto";
import { uniqueSlug } from "@/media/naming";
import { db } from "@/prisma/db";

export const maxUploadBytes = 100 * 1024 * 1024;

type UploadError =
  | "tooLarge"
  | "tooManyPixels"
  | "unsupported"
  | "exists"
  | "forbidden"
  | "notFound";

const statusOf: Record<UploadError, number> = {
  tooLarge: 413,
  tooManyPixels: 413,
  unsupported: 415,
  exists: 409,
  forbidden: 403,
  notFound: 404,
};

function fail(error: UploadError) {
  return Response.json({ error }, { status: statusOf[error] });
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

/** Receives one original per request: raw body, filename in X-File-Name. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;
  const viewer = await getViewer();
  const album = await db.orm.public.Album.where({ id: albumId }).first();
  if (!album) return fail("notFound");
  if (
    viewer.kind !== "user" ||
    !canUpload(viewer, { source: "v4", ownerId: album.ownerId })
  ) {
    return fail("forbidden");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxUploadBytes) return fail("tooLarge");
  const data = await readBodyCapped(request, maxUploadBytes);
  if (!data) return fail("tooLarge");

  const filename = decodeURIComponent(
    request.headers.get("x-file-name") ?? "photo.jpg",
  );
  const added = await addPhotoToAlbum(album, viewer.userId, filename, data);
  if (!added.ok) return fail(added.error);
  return Response.json(
    { photoId: added.photo.id, path: added.photo.path },
    { status: 201 },
  );
}

// Re-exported for tests that need to build a unique slug list the same way the route would.
export { uniqueSlug };
