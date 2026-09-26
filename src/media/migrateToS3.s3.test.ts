import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { mediaRoot } from "@/config";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { claimJob, processMediaJob } from "./jobs";
import { migrateMediaToS3 } from "./migrateToS3";
import { storageFor } from "./storage";

const fs = storageFor("fs");
const s3 = storageFor("s3");
/** Keys never collide with other suites sharing the bucket. */
const albumPath = `/migrate-test-${Date.now().toString(36)}`;
const written = new Set<string>();

async function jpeg(width: number, height: number, orientation?: number): Promise<Buffer> {
  const image = sharp({ create: { width, height, channels: 3, background: "#789" } }).jpeg();
  return (orientation ? image.withMetadata({ orientation }) : image).toBuffer();
}

let albumId: string;

interface LegacyFile {
  key: string;
  format: "jpeg" | "webp";
  data: Buffer;
  size: [number, number];
}

/**
 * A photo the way the legacy migration left it on the filesystem: rows with stored pixel
 * dimensions, legacy file naming, and files under the key base recorded at upload time.
 */
async function legacyPhoto(
  slug: string,
  options: { original: Buffer | null; keyBase: string | null; dir: string },
) {
  const path = `${albumPath}/${slug}`;
  const photo = await db.orm.public.Photo.create({
    albumId,
    slug,
    path,
    title: slug,
    mediaKeyBase: options.keyBase ?? "",
  });
  const scaled = await jpeg(30, 20);
  const files: Record<string, LegacyFile> = {
    previewJpeg: { key: `previews${options.dir}.preview.jpeg`, format: "jpeg", data: scaled, size: [30, 20] },
    thumbnailWebp: { key: `previews${options.dir}.thumbnail.webp`, format: "webp", data: scaled, size: [30, 20] },
  };
  if (options.original) {
    files.original = { key: `pictures${options.dir}.jpeg`, format: "jpeg", data: options.original, size: [90, 60] };
  }
  for (const f of Object.values(files)) await fs.put(f.key, f.data, `image/${f.format}`);
  await db.orm.public.Media.createAll(
    Object.entries(files).map(([name, f]) => ({
      photoId: photo.id,
      role: name === "original" ? "original" : name.startsWith("preview") ? "preview" : "thumbnail",
      format: f.format,
      width: f.size[0],
      height: f.size[1],
      storageKey: f.key,
    })),
  );
  return { photo, files };
}

const mediaOf = async (photoId: string) =>
  (await db.orm.public.Media.where({ photoId }).orderBy((m) => m.storageKey.asc()).all()).map(
    ({ role, format, width, height, storageKey, backend, byteSize }) => ({ role, format, width, height, storageKey, backend, byteSize }),
  );

beforeAll(async () => {
  await pool.query(
    "truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  albumId = (
    await db.orm.public.Album.create({ parentId: root.id, slug: albumPath.slice(1), path: albumPath, title: "Migrate" })
  ).id;
});

afterAll(async () => {
  for (const key of written) await s3.delete(key);
  await db.close();
  await pool.end();
});

describe("migrateMediaToS3", () => {
  it("copies originals to canonical keys, repoints rows, and lets the worker render previews into the bucket", async () => {
    // Camera portrait shot recorded landscape by the legacy site; key base equals the path.
    const tagged = await legacyPhoto("portrait", { original: await jpeg(90, 60, 6), keyBase: null, dir: `${albumPath}/portrait` });
    // Moved after upload: files still live under the old path, recorded in the key base.
    const moved = await legacyPhoto("moved", { original: await jpeg(90, 60), keyBase: "/old-place/moved", dir: "/old-place/moved" });
    // Scaled rows only: the legacy site lost the original.
    const orphan = await legacyPhoto("orphan", { original: null, keyBase: null, dir: `${albumPath}/orphan` });
    const lost = await legacyPhoto("lost", { original: await jpeg(90, 60), keyBase: null, dir: `${albumPath}/lost` });
    await fs.delete(lost.files.original.key);
    for (const slug of ["portrait", "moved"]) written.add(`pictures${albumPath}/${slug}.jpeg`);
    for (const slug of ["portrait", "moved", "orphan"]) {
      for (const role of ["previews", "thumbnails"]) for (const f of ["jpeg", "avif", "webp"]) written.add(`${role}${albumPath}/${slug}.${f}`);
    }
    const albumBefore = (await db.orm.public.Album.where({ id: albumId }).first())!.updatedAt;

    const dryRun = await migrateMediaToS3({ apply: false });
    expect(dryRun).toEqual({
      photosScanned: 4,
      originalsCopied: 2,
      alreadyPresent: 0,
      conflicts: 0,
      jobsQueued: 2,
      orphanScaledCopied: 2,
      missingFiles: 1,
      bytesCopied:
        tagged.files.original.data.byteLength +
        moved.files.original.data.byteLength +
        orphan.files.previewJpeg.data.byteLength +
        orphan.files.thumbnailWebp.data.byteLength,
    });
    expect((await mediaOf(tagged.photo.id)).every((m) => m.backend === "fs")).toBe(true);
    expect(await s3.stat(`pictures${albumPath}/portrait.jpeg`)).toBeNull();
    expect(await claimJob()).toBeNull();

    const applied = await migrateMediaToS3({ apply: true });
    expect(applied).toEqual(dryRun);

    const taggedMedia = await mediaOf(tagged.photo.id);
    expect(taggedMedia.find((m) => m.role === "original")).toEqual({
      role: "original",
      format: "jpeg",
      width: 60,
      height: 90,
      storageKey: `pictures${albumPath}/portrait.jpeg`,
      backend: "s3",
      byteSize: tagged.files.original.data.byteLength,
    });
    // Legacy previews are neither copied nor repointed: the job replaces them.
    expect(taggedMedia.filter((m) => m.role !== "original").every((m) => m.backend === "fs")).toBe(true);
    expect(await s3.stat(`pictures${albumPath}/portrait.jpeg`)).toMatchObject({ size: tagged.files.original.data.byteLength });

    // The moved photo lands at its current path, not the old key base.
    expect((await mediaOf(moved.photo.id)).find((m) => m.role === "original")).toMatchObject({
      storageKey: `pictures${albumPath}/moved.jpeg`,
      backend: "s3",
      width: 90,
      height: 60,
    });
    for (const id of [tagged.photo.id, moved.photo.id, orphan.photo.id]) {
      const photo = (await db.orm.public.Photo.where({ id }).first())!;
      expect(photo.mediaKeyBase).toBe(photo.path);
    }
    expect((await db.orm.public.Photo.where({ id: lost.photo.id }).first())!.mediaKeyBase).toBe("");

    const orphanMedia = await mediaOf(orphan.photo.id);
    expect(orphanMedia.map((m) => [m.role, m.storageKey, m.backend])).toEqual([
      ["preview", `previews${albumPath}/orphan.jpeg`, "s3"],
      ["thumbnail", `thumbnails${albumPath}/orphan.webp`, "s3"],
    ]);
    expect(await s3.stat(`thumbnails${albumPath}/orphan.webp`)).toMatchObject({ size: orphan.files.thumbnailWebp.data.byteLength });

    const lostMedia = await mediaOf(lost.photo.id);
    expect(lostMedia.every((m) => m.backend === "fs")).toBe(true);
    expect((await db.orm.public.Album.where({ id: albumId }).first())!.updatedAt).not.toBe(albumBefore);

    // A second run sees only the photo whose file is missing: the others' originals are on S3 and
    // their legacy previews wait for the job, not for this tool.
    expect(await migrateMediaToS3({ apply: true })).toMatchObject({
      photosScanned: 1,
      originalsCopied: 0,
      alreadyPresent: 0,
      orphanScaledCopied: 0,
      missingFiles: 1,
      jobsQueued: 0,
    });

    // The worker reads the S3 original and writes upright previews into the bucket.
    const jobs = [await claimJob(), await claimJob()];
    expect(jobs.map((j) => j?.photoId).sort()).toEqual([tagged.photo.id, moved.photo.id].sort());
    for (const job of jobs) await processMediaJob(job!);
    expect(await claimJob()).toBeNull();
    const regenerated = await mediaOf(tagged.photo.id);
    expect(regenerated.map((m) => `${m.role}/${m.format}`).sort()).toEqual(
      ["original/jpeg", "preview/avif", "preview/jpeg", "thumbnail/avif", "thumbnail/jpeg"].sort(),
    );
    for (const m of regenerated) {
      expect(m.backend).toBe("s3");
      expect(await s3.stat(m.storageKey)).toMatchObject({ size: m.byteSize });
      if (m.role !== "original") expect(m.height).toBeGreaterThan(m.width);
    }
    for (const f of Object.values({ ...tagged.files, ...moved.files, ...orphan.files })) {
      expect(await readFile(join(mediaRoot, f.key))).toEqual(f.data);
    }
  });

  it("refuses to overwrite a target object of a different size", async () => {
    const conflicting = await legacyPhoto("conflict", { original: await jpeg(90, 60), keyBase: null, dir: `${albumPath}/conflict` });
    const target = `pictures${albumPath}/conflict.jpeg`;
    written.add(target);
    await s3.put(target, Buffer.from("something else"), "image/jpeg");
    expect(await migrateMediaToS3({ apply: true, limit: 100 })).toMatchObject({ conflicts: 1, originalsCopied: 0 });
    expect((await mediaOf(conflicting.photo.id)).find((m) => m.role === "original")!.backend).toBe("fs");
  });
});
