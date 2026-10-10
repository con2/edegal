import { Readable } from "node:stream";
import yazl from "yazl";

import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import { type MediaStorage, storageFor } from "@/media/storage";

import { zipEntryName } from "./names";

export { zipEntryName, zipFileName } from "./names";

/** Photos that can go into the zip: those with an original file. */
export function zipEntries(album: ClientAlbumPage): PhotoVM[] {
  return album.photos.filter((photo) => photo.original !== null);
}

/** Concurrent `stat` calls while sizing the archive; each is a short round trip to storage. */
const statConcurrency = 8;

interface SizedEntry {
  photo: PhotoVM;
  storage: MediaStorage;
  key: string;
  size: number;
}

/**
 * Streams a store-mode zip (JPEGs do not compress) with README.txt first and one entry per
 * photo, reading originals through the storage abstraction. Originals missing from storage are
 * skipped rather than truncating the archive. Aborting the signal stops reading.
 */
export async function createAlbumZip(
  album: ClientAlbumPage,
  readme: string,
  signal?: AbortSignal,
): Promise<Readable> {
  const zip = new yazl.ZipFile();
  zip.addBuffer(Buffer.from(readme, "utf8"), "README.txt", { compress: false });

  const { entries, missing } = await sizeEntries(zipEntries(album));
  if (missing > 0) {
    console.warn(
      `album zip ${album.path}: ${missing} original(s) missing from storage, skipped`,
    );
  }

  // Each original is fetched only when yazl reaches its entry. Opening them all up front would
  // hold one storage connection per photo before the first byte goes out, and the S3 client's
  // connection pool (50 sockets) then deadlocks on albums larger than that.
  const opened = new Set<Readable>();
  for (const { photo, storage, key, size } of entries) {
    const source = Readable.from(
      (async function* () {
        const stream = await storage.getStream(key);
        opened.add(stream);
        try {
          yield* stream;
        } finally {
          opened.delete(stream);
        }
      })(),
      { objectMode: false },
    );
    zip.addReadStream(source, zipEntryName(photo), { compress: false, size });
  }
  zip.end();

  // yazl's typings expose the output as a generic NodeJS stream; it is a Readable at runtime.
  const output = zip.outputStream as unknown as Readable;
  signal?.addEventListener("abort", () => {
    for (const stream of opened) stream.destroy();
    output.destroy();
  });
  return output;
}

async function sizeEntries(
  photos: PhotoVM[],
): Promise<{ entries: SizedEntry[]; missing: number }> {
  const entries: SizedEntry[] = [];
  let missing = 0;
  for (let i = 0; i < photos.length; i += statConcurrency) {
    const batch = await Promise.all(
      photos.slice(i, i + statConcurrency).map(async (photo) => {
        const { storageKey: key, backend } = photo.original!;
        const storage = storageFor(backend);
        const stat = await storage.stat(key);
        return stat ? { photo, storage, key, size: stat.size } : null;
      }),
    );
    for (const entry of batch) {
      if (entry) entries.push(entry);
      else missing++;
    }
  }
  return { entries, missing };
}
