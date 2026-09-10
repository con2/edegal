import type { Readable } from "node:stream";
import yazl from "yazl";

import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { MediaStorage } from "@/media/storage";

import { zipEntryName } from "./names";

export { zipEntryName, zipFileName } from "./names";

/** Photos that can go into the zip: those with an original file. */
export function zipEntries(album: ClientAlbumPage): PhotoVM[] {
  return album.photos.filter((photo) => photo.original !== null);
}

/**
 * Streams a store-mode zip (JPEGs do not compress) with README.txt first and one entry per
 * photo, reading originals through the storage abstraction. Originals missing from storage are
 * skipped rather than truncating the archive. Aborting the signal stops reading.
 */
export async function createAlbumZip(
  album: ClientAlbumPage,
  readme: string,
  storage: MediaStorage,
  signal?: AbortSignal,
): Promise<Readable> {
  const zip = new yazl.ZipFile();
  const sources: Readable[] = [];
  zip.addBuffer(Buffer.from(readme, "utf8"), "README.txt", { compress: false });
  let missing = 0;
  for (const photo of zipEntries(album)) {
    const key = photo.original!.storageKey;
    const stat = await storage.stat(key);
    if (!stat) {
      missing++;
      continue;
    }
    const source = storage.getStream(key);
    sources.push(source);
    zip.addReadStream(source, zipEntryName(photo), {
      compress: false,
      size: stat.size,
    });
  }
  if (missing > 0) {
    console.warn(
      `album zip ${album.path}: ${missing} original(s) missing from storage, skipped`,
    );
  }
  zip.end();
  // yazl's typings expose the output as a generic NodeJS stream; it is a Readable at runtime.
  const output = zip.outputStream as unknown as Readable;
  signal?.addEventListener("abort", () => {
    for (const source of sources) source.destroy();
    output.destroy();
  });
  return output;
}
