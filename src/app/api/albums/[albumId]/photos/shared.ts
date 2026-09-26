import { canUpload } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";

export const maxUploadBytes = 100 * 1024 * 1024;

export const uploadContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export type UploadError =
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

export function fail(error: UploadError) {
  return Response.json({ error }, { status: statusOf[error] });
}

export interface Uploader {
  album: {
    id: string;
    path: string;
    parentId: string | null;
    ownerId: string | null;
  };
  userId: string;
}

/** The album and the user allowed to upload into it, or the error response to send instead. */
export async function authorizeUpload(
  albumId: string,
): Promise<Uploader | Response> {
  const viewer = await getViewer();
  const album = await db.orm.public.Album.where({ id: albumId }).first();
  if (!album) return fail("notFound");
  if (viewer.kind !== "user" || !canUpload(viewer, { ownerId: album.ownerId }))
    return fail("forbidden");
  return { album, userId: viewer.userId };
}
