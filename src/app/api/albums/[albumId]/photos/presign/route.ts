import { randomUUID } from "node:crypto";

import { z } from "zod";

import { mediaStorage } from "@/media/storage";

import {
  authorizeUpload,
  fail,
  maxUploadBytes,
  uploadContentTypes,
} from "../shared";

const body = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z.number().int().nonnegative(),
});

/** The temp key keeps the filename for readability; the UUID keeps concurrent uploads apart. */
export function uploadKeyFor(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  return `uploads/${randomUUID()}/${base.replace(/[^\w.-]+/g, "_")}`;
}

/**
 * First step of a direct upload: the browser asks where to PUT the file. Storage without direct
 * uploads answers `proxy`, and the browser POSTs the file through the server instead.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;
  const uploader = await authorizeUpload(albumId);
  if (uploader instanceof Response) return uploader;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("unsupported");
  const { filename, contentType, size } = parsed.data;
  if (!uploadContentTypes.includes(contentType)) return fail("unsupported");
  if (size > maxUploadBytes) return fail("tooLarge");

  const uploadKey = uploadKeyFor(filename);
  const presigned = await mediaStorage.presignUpload(
    uploadKey,
    contentType,
    size,
  );
  if (!presigned) return Response.json({ mode: "proxy" });
  return Response.json({ mode: "direct", uploadKey, ...presigned });
}
