import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import yauzl from "yauzl";
import { describe, expect, it } from "vitest";

import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import { LocalMediaStorage } from "@/media/storage";

import { createAlbumZip } from "./zip";

interface Entry {
  fileName: string;
  compressionMethod: number;
  content: Buffer;
}

function readZip(buffer: Buffer): Promise<Entry[]> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (error, zipfile) => {
      if (error) return reject(error);
      const entries: Entry[] = [];
      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        zipfile.openReadStream(entry, (streamError, stream) => {
          if (streamError) return reject(streamError);
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            entries.push({
              fileName: entry.fileName,
              compressionMethod: entry.compressionMethod,
              content: Buffer.concat(chunks),
            });
            zipfile.readEntry();
          });
        });
      });
      zipfile.on("end", () => resolve(entries));
      zipfile.on("error", reject);
    });
  });
}

async function collect(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function photo(slug: string, key: string): PhotoVM {
  const variant = {
    src: `/media/${key}`,
    storageKey: key,
    width: 10,
    height: 10,
    format: "jpeg" as const,
    byteSize: null,
  };
  return {
    id: slug,
    path: `/event/${slug}`,
    title: slug,
    visibility: "public",
    takenAt: null,
    thumbnail: { fallback: variant, alternates: [] },
    preview: null,
    original: variant,
  };
}

describe("createAlbumZip", () => {
  it("streams README.txt and each original as stored entries in album order", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "v4-zip-"));
    await mkdir(path.join(root, "pictures/event"), { recursive: true });
    await writeFile(path.join(root, "pictures/event/pic-1.jpeg"), "first");
    await writeFile(path.join(root, "pictures/event/pic-2.jpeg"), "second");
    const storage = new LocalMediaStorage(root);

    const album = {
      path: "/event",
      title: "Event",
      photos: [
        photo("pic-1", "pictures/event/pic-1.jpeg"),
        photo("pic-2", "pictures/event/pic-2.jpeg"),
        { ...photo("no-original", "x"), original: null },
      ],
    } as unknown as ClientAlbumPage;

    const entries = await readZip(
      await collect(
        await createAlbumZip(album, "Event\nhttps://x/event\n", storage),
      ),
    );
    expect(entries.map((e) => e.fileName)).toEqual([
      "README.txt",
      "pic-1.jpg",
      "pic-2.jpg",
    ]);
    expect(entries.every((e) => e.compressionMethod === 0)).toBe(true);
    expect(entries[0].content.toString()).toBe("Event\nhttps://x/event\n");
    expect(entries[2].content.toString()).toBe("second");
  });
});
