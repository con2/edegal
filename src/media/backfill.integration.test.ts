import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { mediaRoot } from "@/config";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { backfillMedia } from "./backfill";
import { claimJob, processMediaJob } from "./jobs";
import { mediaStorage } from "./storage";

async function jpeg(width: number, height: number, orientation?: number): Promise<Buffer> {
  const image = sharp({ create: { width, height, channels: 3, background: "#789" } }).jpeg();
  return (orientation ? image.withMetadata({ orientation }) : image).toBuffer();
}

let albumId: string;

/**
 * A photo the way the legacy migration left it: rows copied from the Django tables with stored
 * pixel dimensions, no file size, and the legacy file naming (thumbnails under previews/).
 */
async function legacyPhoto(slug: string, original: Buffer, originalSize: [number, number], scaledSize: [number, number]) {
  const photo = await db.orm.public.Photo.create({ albumId, slug, path: `/legacy/${slug}`, title: slug });
  const dir = `legacy/${slug}`;
  const files = {
    original: { key: `pictures/${dir}.jpeg`, format: "jpeg", data: original, size: originalSize },
    previewJpeg: { key: `previews/${dir}.preview.jpeg`, format: "jpeg", data: await jpeg(...scaledSize), size: scaledSize },
    thumbnailJpeg: { key: `previews/${dir}.thumbnail.jpeg`, format: "jpeg", data: await jpeg(...scaledSize), size: scaledSize },
    thumbnailWebp: { key: `previews/${dir}.thumbnail.webp`, format: "webp", data: await jpeg(...scaledSize), size: scaledSize },
  } as const;
  for (const f of Object.values(files)) await mediaStorage.put(f.key, f.data, `image/${f.format}`);
  await db.orm.public.Media.createAll(
    (["original", "previewJpeg", "thumbnailJpeg", "thumbnailWebp"] as const).map((name) => ({
      photoId: photo.id,
      role: name === "original" ? "original" : name.startsWith("preview") ? "preview" : "thumbnail",
      format: files[name].format,
      width: files[name].size[0],
      height: files[name].size[1],
      storageKey: files[name].key,
    })),
  );
  return { photo, files };
}

const mediaOf = async (photoId: string) =>
  (await db.orm.public.Media.where({ photoId }).orderBy((m) => m.storageKey.asc()).all()).map(
    ({ role, format, width, height, storageKey, byteSize }) => ({ role, format, width, height, storageKey, byteSize }),
  );

beforeAll(async () => {
  await pool.query("truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade");
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  albumId = (await db.orm.public.Album.create({ parentId: root.id, slug: "legacy", path: "/legacy", title: "Legacy" })).id;
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("legacy media backfill", () => {
  it("records sizes and displayed dimensions, queues regeneration only for tagged originals, and runs once", async () => {
    // Camera portrait shot: landscape pixels with orientation 6, previews rendered sideways.
    const tagged = await legacyPhoto("portrait", await jpeg(90, 60, 6), [90, 60], [30, 20]);
    const plain = await legacyPhoto("landscape", await jpeg(90, 60), [90, 60], [30, 20]);
    const lost = await legacyPhoto("lost", await jpeg(90, 60), [90, 60], [30, 20]);
    await mediaStorage.delete(lost.files.original.key);
    const before = await db.orm.public.Media.where({ photoId: tagged.photo.id }).all();
    const albumBefore = (await db.orm.public.Album.where({ id: albumId }).first())!.updatedAt;

    const dryRun = await backfillMedia({ apply: false });
    expect(dryRun).toMatchObject({
      rowsScanned: 12,
      sizesSet: 11,
      originalsInspected: 2,
      rotatedOriginals: { 6: 1 },
      dimensionsChanged: 1,
      jobsQueued: 1,
      missingFiles: 1,
      unreadableFiles: 0,
    });
    expect(await db.orm.public.Media.where({ photoId: tagged.photo.id }).all()).toEqual(before);
    expect(await claimJob()).toBeNull();

    const applied = await backfillMedia({ apply: true });
    expect(applied).toEqual(dryRun);

    const taggedOriginal = (await mediaOf(tagged.photo.id)).find((m) => m.role === "original")!;
    expect(taggedOriginal).toMatchObject({ width: 60, height: 90, byteSize: tagged.files.original.data.byteLength });
    const plainMedia = await mediaOf(plain.photo.id);
    expect(plainMedia.find((m) => m.role === "original")).toMatchObject({ width: 90, height: 60 });
    expect(plainMedia.every((m) => m.byteSize !== null)).toBe(true);
    // Only the lost file's row stays unsized; the other rows of that photo were on disk.
    const lostMedia = await mediaOf(lost.photo.id);
    expect(lostMedia.filter((m) => m.byteSize === null).map((m) => m.storageKey)).toEqual([lost.files.original.key]);
    expect((await db.orm.public.Album.where({ id: albumId }).first())!.updatedAt).not.toBe(albumBefore);

    // A second pass finds only the row whose file is still missing.
    expect(await backfillMedia({ apply: true })).toMatchObject({ rowsScanned: 1, missingFiles: 1, jobsQueued: 0 });

    // The worker replaces the sideways legacy previews with upright ones at v4 keys, drops the
    // webp variant v4 no longer renders, and leaves the legacy files themselves in place.
    const job = await claimJob();
    expect(job?.photoId).toBe(tagged.photo.id);
    await processMediaJob(job!);
    expect(await claimJob()).toBeNull();
    const regenerated = await mediaOf(tagged.photo.id);
    expect(regenerated.map((m) => `${m.role}/${m.format}`).sort()).toEqual(
      ["original/jpeg", "preview/avif", "preview/jpeg", "thumbnail/avif", "thumbnail/jpeg"].sort(),
    );
    for (const m of regenerated.filter((m) => m.role !== "original")) {
      expect(m.height).toBeGreaterThan(m.width);
      expect(m.storageKey).toBe(`${m.role === "preview" ? "previews" : "thumbnails"}/legacy/portrait.${m.format}`);
      expect(await mediaStorage.stat(m.storageKey)).toMatchObject({ size: m.byteSize });
    }
    for (const f of Object.values(tagged.files)) {
      expect(await readFile(join(mediaRoot, f.key))).toEqual(f.data);
    }
  });
});
