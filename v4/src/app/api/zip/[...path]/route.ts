import { Readable } from "node:stream";

import { publicUrl } from "@/config";
import { albumReadme } from "@/downloads/readme";
import { createAlbumZip, zipEntries, zipFileName } from "@/downloads/zip";
import { canDownload } from "@/gallery/access";
import { loadGalleryPage } from "@/gallery/load";
import { normalizeGalleryPath } from "@/gallery/paths";
import { getViewer } from "@/gallery/viewer";
import { mediaStorage } from "@/media/storage";

/**
 * Streams an album's originals as a store-mode zip. Authorization is the same as for viewing the
 * album, so the zip contains exactly the photos this viewer sees.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized || normalized.timeline) return notFound();

  const result = await loadGalleryPage(normalized.path, await getViewer());
  if (result.kind !== "ok" || result.photo !== null) return notFound();
  const { album } = result;
  if (!canDownload(album) || zipEntries(album).length === 0) return notFound();

  const readme = albumReadme(album, `${publicUrl}${album.path}`);
  const zip = await createAlbumZip(album, readme, mediaStorage, request.signal);
  const fileName = zipFileName(album);
  return new Response(Readable.toWeb(zip) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}
