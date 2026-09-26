import { z } from "zod";

import { addPhotoToAlbum } from "@/media/addPhoto";
import { mediaStorage } from "@/media/storage";

import { authorizeUpload, fail, maxUploadBytes } from "../shared";

const body = z.object({
  uploadKey: z.string().regex(/^uploads\/[^/]+\/[^/]+$/),
  filename: z.string().min(1).max(255),
});

/**
 * Second step of a direct upload: the file is in storage under `uploads/`, and the photo is added
 * from it exactly as from a proxied body. The size cap is enforced here since a presigned PUT
 * cannot enforce it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;
  const uploader = await authorizeUpload(albumId);
  if (uploader instanceof Response) return uploader;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "badRequest" }, { status: 400 });
  const { uploadKey, filename } = parsed.data;

  const stat = await mediaStorage.stat(uploadKey);
  if (!stat) return Response.json({ error: "badRequest" }, { status: 400 });
  if (stat.size > maxUploadBytes) {
    await mediaStorage.delete(uploadKey);
    return fail("tooLarge");
  }

  const added = await addPhotoToAlbum(
    uploader.album,
    uploader.userId,
    filename,
    { uploadKey },
  );
  if (!added.ok) return fail(added.error);
  return Response.json(
    { photoId: added.photo.id, path: added.photo.path },
    { status: 201 },
  );
}
