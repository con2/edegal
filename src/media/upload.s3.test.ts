import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { s3 } from "@/config";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { claimJob, cleanupStaleUploads, processMediaJob } from "./jobs";
import { mediaStorage, storageFor } from "./storage";
import { getUrlExpirySeconds, presignGetUrl, startOfUtcDay } from "./storage/presign";

vi.mock("@/gallery/viewer", () => ({
  getViewer: async () => ({ kind: "user", userId: process.env.TEST_USER_ID, name: "Admin", isPhotographer: true, isAdmin: true }),
}));

const { POST: proxyPost } = await import("@/app/api/albums/[albumId]/photos/route");
const { POST: presign } = await import("@/app/api/albums/[albumId]/photos/presign/route");
const { POST: complete } = await import("@/app/api/albums/[albumId]/photos/complete/route");

/** Every key this run creates carries the run id, so parallel or aborted runs never collide. */
const run = randomUUID().slice(0, 8);
const albumSlug = `s3-test-${run}`;
const created = new Set<string>();

function track<T extends string>(key: T): T {
  created.add(key);
  return key;
}

async function jpeg(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 20, g: 120, b: 200 } } })
    .jpeg()
    .toBuffer();
}

async function readAll(stream: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const json = (url: string, body: unknown) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

let albumId: string;
const params = () => ({ params: Promise.resolve({ albumId }) });

async function trackPhotoMedia(photoId: string) {
  const media = await db.orm.public.Media.where({ photoId }).select("storageKey").all();
  for (const m of media) track(m.storageKey);
}

beforeAll(async () => {
  expect(mediaStorage.backend).toBe("s3");
  await pool.query("truncate v4_redirect, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade");
  const user = await db.orm.public.User.create({ sub: "test:1", displayName: "Tester" });
  process.env.TEST_USER_ID = user.id;
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  const album = await db.orm.public.Album.create({ parentId: root.id, slug: albumSlug, path: `/${albumSlug}`, title: "S3", ownerId: user.id });
  albumId = album.id;
});

afterAll(async () => {
  for (const key of created) await mediaStorage.delete(key);
  await db.close();
  await pool.end();
});

describe("S3 media storage", () => {
  it("puts, stats, streams whole and ranged, copies, lists and deletes", async () => {
    const key = track(`test-storage/${run}/a.bin`);
    const data = Buffer.from("0123456789abcdef");
    await mediaStorage.put(key, data, "application/octet-stream");
    expect(await mediaStorage.stat(key)).toMatchObject({ size: data.byteLength });
    expect(await readAll(await mediaStorage.getStream(key))).toEqual(data);
    expect(await readAll(await mediaStorage.getStream(key, { end: 3 }))).toEqual(Buffer.from("0123"));

    const copy = track(`test-storage/${run}/b.bin`);
    await mediaStorage.copy(key, copy, "application/octet-stream");
    expect(await readAll(await mediaStorage.getStream(copy))).toEqual(data);

    const listed: string[] = [];
    for await (const object of mediaStorage.listPrefix(`test-storage/${run}/`)) listed.push(object.key);
    expect(listed.sort()).toEqual([key, copy]);

    await mediaStorage.delete(key);
    expect(await mediaStorage.stat(key)).toBeNull();
    await mediaStorage.delete(key); // idempotent
  });

  it("serves url() through a real GET, today's and yesterday's signing date alike", async () => {
    const key = track(`test-storage/${run}/kuva ä.jpeg`);
    const data = await jpeg(8, 8);
    await mediaStorage.put(key, data, "image/jpeg");

    const today = await fetch(mediaStorage.url(key));
    expect(today.status).toBe(200);
    expect(Buffer.from(await today.arrayBuffer())).toEqual(data);
    expect(mediaStorage.url(key)).toBe(mediaStorage.url(key));

    const download = await fetch(mediaStorage.url(key, { downloadName: "Ääkkös kuva.jpg" }));
    expect(download.status).toBe(200);
    expect(download.headers.get("content-disposition")).toContain("attachment");

    // Quantized signing dates only work if the store accepts an X-Amz-Date in the past. Garage does.
    const yesterday = new Date(startOfUtcDay().getTime() - 24 * 60 * 60 * 1000);
    const url = presignGetUrl(
      { endpoint: s3.publicEndpoint, bucket: s3.bucket, forcePathStyle: s3.forcePathStyle },
      { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey, region: s3.region },
      key,
      { signingDate: yesterday, expiresIn: getUrlExpirySeconds },
    );
    expect((await fetch(url)).status).toBe(200);
  });

  it("presigns a PUT the browser can use and signs its content type", async () => {
    const key = track(`uploads/${run}/direct.jpeg`);
    const presigned = await mediaStorage.presignUpload(key, "image/jpeg", 100);
    expect(presigned).not.toBeNull();
    const data = await jpeg(4, 4);
    const put = await fetch(presigned!.url, { method: "PUT", headers: presigned!.headers, body: new Uint8Array(data) });
    expect(put.status).toBe(200);
    expect(await mediaStorage.stat(key)).toMatchObject({ size: data.byteLength });
    const wrongType = await fetch(presigned!.url, { method: "PUT", headers: { "Content-Type": "text/plain" }, body: "x" });
    expect(wrongType.status).toBe(403);
  });
});

describe("direct upload flow", () => {
  it("presign, PUT, complete: creates the photo in S3 with a job, and the worker renders into the bucket", async () => {
    const data = await jpeg(90, 60);
    const ask = await presign(
      json(`http://test/api/albums/${albumId}/photos/presign`, { filename: "IMG_0001.JPG", contentType: "image/jpeg", size: data.byteLength }),
      params(),
    );
    expect(ask.status).toBe(200);
    const target = (await ask.json()) as { mode: string; uploadKey: string; url: string; headers: Record<string, string> };
    expect(target.mode).toBe("direct");
    expect(target.uploadKey).toMatch(/^uploads\/[0-9a-f-]{36}\/IMG_0001\.JPG$/);
    track(target.uploadKey);
    expect((await fetch(target.url, { method: "PUT", headers: target.headers, body: new Uint8Array(data) })).status).toBe(200);

    const done = await complete(
      json(`http://test/api/albums/${albumId}/photos/complete`, { uploadKey: target.uploadKey, filename: "IMG_0001.JPG" }),
      params(),
    );
    expect(done.status).toBe(201);
    const { photoId, path } = (await done.json()) as { photoId: string; path: string };
    expect(path).toBe(`/${albumSlug}/img-0001`);
    await trackPhotoMedia(photoId);

    const photo = await db.orm.public.Photo.where({ id: photoId }).include("media").first();
    expect(photo!.media).toHaveLength(1);
    const original = photo!.media[0];
    expect(original).toMatchObject({ role: "original", backend: "s3", storageKey: `pictures/${albumSlug}/img-0001.jpeg`, byteSize: data.byteLength, width: 90, height: 60 });
    expect(await readAll(await storageFor("s3").getStream(original.storageKey))).toEqual(data);
    // The temp object is gone once the photo exists at its canonical key.
    expect(await mediaStorage.stat(target.uploadKey)).toBeNull();

    const job = await claimJob();
    expect(job?.photoId).toBe(photoId);
    await processMediaJob(job!);
    const processed = await db.orm.public.Photo.where({ id: photoId }).include("media").first();
    await trackPhotoMedia(photoId);
    const variants = processed!.media.filter((m) => m.role !== "original");
    expect(variants.map((m) => `${m.role}/${m.format}`).sort()).toEqual(["preview/avif", "preview/jpeg", "thumbnail/avif", "thumbnail/jpeg"]);
    for (const m of variants) {
      expect(m.backend).toBe("s3");
      expect(await mediaStorage.stat(m.storageKey)).toMatchObject({ size: m.byteSize });
    }
    expect((await db.orm.public.MediaJob.where({ id: job!.id }).first())?.status).toBe("done");
  });

  it("refuses a complete call for a missing object", async () => {
    const response = await complete(
      json(`http://test/api/albums/${albumId}/photos/complete`, { uploadKey: `uploads/${randomUUID()}/nope.jpg`, filename: "nope.jpg" }),
      params(),
    );
    expect(response.status).toBe(400);
  });

  it("replaces a same-named photo from a direct upload, dropping the old rendered files", async () => {
    const before = await db.orm.public.Photo.where({ path: `/${albumSlug}/img-0001` }).include("media").first();
    const oldKeys = before!.media.map((m) => m.storageKey);
    const data = await jpeg(30, 40);
    const ask = await presign(
      json(`http://test/api/albums/${albumId}/photos/presign`, { filename: "img_0001.jpg", contentType: "image/jpeg", size: data.byteLength }),
      params(),
    );
    const target = (await ask.json()) as { uploadKey: string; url: string; headers: Record<string, string> };
    track(target.uploadKey);
    await fetch(target.url, { method: "PUT", headers: target.headers, body: new Uint8Array(data) });
    const done = await complete(
      json(`http://test/api/albums/${albumId}/photos/complete`, { uploadKey: target.uploadKey, filename: "img_0001.jpg" }),
      params(),
    );
    expect(done.status).toBe(201);
    expect(((await done.json()) as { photoId: string }).photoId).toBe(before!.id);
    const after = await db.orm.public.Photo.where({ id: before!.id }).include("media").first();
    expect(after!.media.map((m) => m.role)).toEqual(["original"]);
    expect(after!.media[0]).toMatchObject({ backend: "s3", width: 30, height: 40 });
    for (const key of oldKeys) {
      if (key === after!.media[0].storageKey) continue;
      expect(await mediaStorage.stat(key)).toBeNull();
    }
    await processMediaJob((await claimJob())!);
    await trackPhotoMedia(before!.id);
  });

  it("stores a proxied POST body in S3 too", async () => {
    const data = await jpeg(20, 10);
    const response = await proxyPost(
      new Request(`http://test/api/albums/${albumId}/photos`, {
        method: "POST",
        headers: { "content-type": "image/jpeg", "x-file-name": "proxied.jpg", "content-length": String(data.byteLength) },
        body: new Uint8Array(data),
      }),
      params(),
    );
    expect(response.status).toBe(201);
    const { photoId } = (await response.json()) as { photoId: string };
    await trackPhotoMedia(photoId);
    const photo = await db.orm.public.Photo.where({ id: photoId }).include("media").first();
    expect(photo!.media[0]).toMatchObject({ backend: "s3", storageKey: `pictures/${albumSlug}/proxied.jpeg` });
    expect(await mediaStorage.stat(photo!.media[0].storageKey)).toMatchObject({ size: data.byteLength });
    await db.orm.public.MediaJob.where({ photoId }).deleteAndCount();
  });

  it("removes abandoned direct uploads older than the cutoff", async () => {
    const abandoned = track(`uploads/${run}/abandoned.jpeg`);
    await mediaStorage.put(abandoned, await jpeg(2, 2), "image/jpeg");
    expect(await cleanupStaleUploads(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe(0);
    expect(await mediaStorage.stat(abandoned)).not.toBeNull();
    expect(await cleanupStaleUploads(new Date(Date.now() + 60 * 60 * 1000))).toBeGreaterThanOrEqual(1);
    expect(await mediaStorage.stat(abandoned)).toBeNull();
  });
});
