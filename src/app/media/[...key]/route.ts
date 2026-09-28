import { Readable } from "node:stream";

import { canView } from "@/gallery/access";
import { effectiveVisibilities } from "@/gallery/effectiveVisibility";
import { readerFor } from "@/gallery/reader";
import { getViewer } from "@/gallery/viewer";
import { storageFor } from "@/media/storage";

const contentTypes: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  gif: "image/gif",
  zip: "application/zip",
};

function notFound() {
  return new Response("Not found", { status: 404 });
}

/**
 * The stable, authorized address of a media file: `/media/<storage key>`. A file is served only
 * to viewers who may see its album. Filesystem files stream from here; S3 files redirect to a
 * presigned URL. Open Graph images and the v3 API point here because a presigned URL expires
 * while their consumers still cache it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const storageKey = key.map(decodeURIComponent).join("/");
  if (storageKey.split("/").some((segment) => segment === "..")) {
    return notFound();
  }
  const viewer = await getViewer();
  const reader = readerFor(viewer);
  const media = await reader.db.orm.public.Media.where({ storageKey })
    .include("photo", (p) => p.include("album"))
    .first();
  if (!media) return notFound();
  const { album } = media.photo;
  const visibility = (
    await effectiveVisibilities([album.path], reader)
  ).get(album.path);
  if (!visibility || !canView(viewer, { visibility, ownerId: album.ownerId })) {
    return notFound();
  }

  const storage = storageFor(media.backend);
  if (media.backend === "s3") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: storage.url(storageKey),
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const stat = await storage.stat(storageKey);
  if (!stat) return notFound();
  const extension = storageKey.split(".").pop()?.toLowerCase() ?? "";
  const stream = Readable.toWeb(
    await storage.getStream(storageKey),
  ) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Content-Length": String(stat.size),
      "Last-Modified": stat.mtime.toUTCString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
