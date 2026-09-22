import { Readable } from "node:stream";

import { mediaStorage } from "@/media/storage";

const contentTypes: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  gif: "image/gif",
  zip: "application/zip",
};

/**
 * Serves media from MEDIA_ROOT. In production the same path prefix is routed to nginx before it
 * reaches Next.js; this handler covers development and acts as a fallback.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const storageKey = key.map(decodeURIComponent).join("/");
  if (storageKey.split("/").some((segment) => segment === "..")) {
    return new Response("Not found", { status: 404 });
  }
  const stat = await mediaStorage.stat(storageKey);
  if (!stat) return new Response("Not found", { status: 404 });
  const extension = storageKey.split(".").pop()?.toLowerCase() ?? "";
  const stream = Readable.toWeb(mediaStorage.getStream(storageKey)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Content-Length": String(stat.size),
      "Last-Modified": stat.mtime.toUTCString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
