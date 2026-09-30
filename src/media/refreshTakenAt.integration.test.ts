import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { refreshTakenAt } from "./refreshTakenAt";
import { mediaStorage } from "./storage";

const exportedAt = "2026:09:30 17:16:43";
const capturedAt = "2026:09:19 10:16:54";
/** What the pre-fix parser stored for a photo exported at `exportedAt` from a Helsinki-time camera. */
const storedExportTime = "2026-09-30T14:16:43.000Z";
const captureInstant = "2026-09-19T07:16:54.000Z";

async function jpeg(exif?: Record<string, Record<string, string>>): Promise<Buffer> {
  const image = sharp({ create: { width: 90, height: 60, channels: 3, background: "#789" } }).jpeg();
  return (exif ? image.withExif(exif) : image).toBuffer();
}

let albumId: string;
let otherAlbumId: string;

async function storedPhoto(albumId: string, slug: string, original: Buffer, takenAt: string | null) {
  const key = `refresh/${slug}.jpeg`;
  await mediaStorage.put(key, original, "image/jpeg");
  const photo = await db.orm.public.Photo.create({ albumId, slug, path: `/refresh/${slug}`, title: slug, takenAt });
  await db.orm.public.Media.create({ photoId: photo.id, role: "original", format: "jpeg", width: 90, height: 60, storageKey: key });
  return { photo, key };
}

/** Normalized: the ORM returns timestamps in Postgres's text form. */
const takenAtOfPhoto = async (id: string) => {
  const { takenAt } = (await db.orm.public.Photo.where({ id }).first())!;
  return takenAt === null ? null : new Date(takenAt).toISOString();
};
const updatedAtOfAlbum = async (id: string) => (await db.orm.public.Album.where({ id }).first())!.updatedAt;

beforeAll(async () => {
  await pool.query("truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade");
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  albumId = (await db.orm.public.Album.create({ parentId: root.id, slug: "refresh", path: "/refresh", title: "Refresh" })).id;
  otherAlbumId = (await db.orm.public.Album.create({ parentId: root.id, slug: "other", path: "/other", title: "Other" })).id;
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("refreshTakenAt", () => {
  it("rewrites capture times that differ from the original, within the requested subtree only", async () => {
    const edited = await storedPhoto(albumId, "edited", await jpeg({ IFD0: { DateTime: exportedAt }, IFD2: { DateTimeOriginal: capturedAt, OffsetTimeOriginal: "+03:00" } }), storedExportTime);
    const correct = await storedPhoto(albumId, "correct", await jpeg({ IFD2: { DateTimeOriginal: capturedAt, OffsetTimeOriginal: "+03:00" } }), captureInstant);
    const noExif = await storedPhoto(albumId, "no-exif", await jpeg(), storedExportTime);
    const lost = await storedPhoto(albumId, "lost", await jpeg(), storedExportTime);
    await mediaStorage.delete(lost.key);
    const elsewhere = await storedPhoto(otherAlbumId, "elsewhere", await jpeg({ IFD0: { DateTime: exportedAt }, IFD2: { DateTimeOriginal: capturedAt, OffsetTimeOriginal: "+03:00" } }), storedExportTime);
    const albumBefore = await updatedAtOfAlbum(albumId);

    const dryRun = await refreshTakenAt({ apply: false, albumPath: "/refresh" });
    expect(dryRun).toEqual({ photosScanned: 4, changed: 2, unchanged: 1, missingFiles: 1, unreadableFiles: 0 });
    expect(await takenAtOfPhoto(edited.photo.id)).toBe(storedExportTime);
    expect(await updatedAtOfAlbum(albumId)).toBe(albumBefore);

    const applied = await refreshTakenAt({ apply: true, albumPath: "/refresh" });
    expect(applied).toEqual(dryRun);
    expect(await takenAtOfPhoto(edited.photo.id)).toBe(captureInstant);
    expect(await takenAtOfPhoto(correct.photo.id)).toBe(captureInstant);
    // A missing EXIF timestamp sorts last on purpose, so the stale export time is cleared.
    expect(await takenAtOfPhoto(noExif.photo.id)).toBeNull();
    expect(await takenAtOfPhoto(lost.photo.id)).toBe(storedExportTime);
    expect(await takenAtOfPhoto(elsewhere.photo.id)).toBe(storedExportTime);
    expect(await updatedAtOfAlbum(albumId)).not.toBe(albumBefore);

    expect(await refreshTakenAt({ apply: true, albumPath: "/refresh" })).toEqual({ photosScanned: 4, changed: 0, unchanged: 3, missingFiles: 1, unreadableFiles: 0 });

    expect(await refreshTakenAt({ apply: true })).toMatchObject({ photosScanned: 5, changed: 1 });
    expect(await takenAtOfPhoto(elsewhere.photo.id)).toBe(captureInstant);
  });
});
