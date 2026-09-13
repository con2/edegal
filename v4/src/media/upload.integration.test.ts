import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { albumJobCounts, claimJob, cleanupFinishedJobs, processMediaJob, requeueStrandedJobs } from "./jobs";
import { mediaStorage } from "./storage";

vi.mock("@/gallery/viewer", () => ({
  getViewer: async () => ({ kind: "user", userId: process.env.TEST_USER_ID, name: "Admin", isPhotographer: true, isAdmin: true }),
}));

const { POST } = await import("@/app/api/albums/[albumId]/photos/route");

async function jpeg(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 200, g: 100, b: 50 } } })
    .jpeg()
    .toBuffer();
}

function request(albumId: string, name: string, body: Buffer, type = "image/jpeg") {
  return new Request(`http://test/api/albums/${albumId}/photos`, {
    method: "POST",
    headers: { "content-type": type, "x-file-name": encodeURIComponent(name), "content-length": String(body.byteLength) },
    body: new Uint8Array(body),
  });
}

let albumId: string;

beforeAll(async () => {
  await pool.query("truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade");
  const user = await db.orm.public.User.create({ sub: "test:1", displayName: "Tester" });
  process.env.TEST_USER_ID = user.id;
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  const album = await db.orm.public.Album.create({ parentId: root.id, slug: "uploads", path: "/uploads", title: "Uploads", ownerId: user.id });
  albumId = album.id;
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("photo upload and processing", () => {
  it("stores the original, queues a job, and the worker produces variants and the album thumbnail", async () => {
    const portrait = await POST(request(albumId, "IMG_0001.JPG", await jpeg(60, 90)), { params: Promise.resolve({ albumId }) });
    expect(portrait.status).toBe(201);
    const { photoId, path } = (await portrait.json()) as { photoId: string; path: string };
    expect(path).toBe("/uploads/img-0001");

    const photo = await db.orm.public.Photo.where({ id: photoId }).include("media").first();
    expect(photo?.ordering).toBe(0);
    expect(photo?.media.map((m) => m.role)).toEqual(["original"]);
    expect(await mediaStorage.stat(photo!.media[0].storageKey)).not.toBeNull();
    expect(await albumJobCounts(albumId)).toEqual({ processing: 1, failed: 0 });

    const job = await claimJob();
    expect(job?.photoId).toBe(photoId);
    await processMediaJob(job!);

    const processed = await db.orm.public.Photo.where({ id: photoId }).include("media").first();
    expect(processed?.media.map((m) => `${m.role}/${m.format}`).sort()).toEqual(
      ["original/jpeg", "preview/avif", "preview/jpeg", "thumbnail/jpeg", "thumbnail/webp"].sort(),
    );
    const album = await db.orm.public.Album.where({ id: albumId }).first();
    expect(album?.thumbnailPhotoId).toBe(photoId);
    expect(album?.thumbnailIsAuto).toBe(true);
    expect(await albumJobCounts(albumId)).toEqual({ processing: 0, failed: 0 });
  });

  it("replaces an automatic portrait thumbnail with the first landscape photo", async () => {
    const landscape = await POST(request(albumId, "IMG_0002.JPG", await jpeg(90, 60)), { params: Promise.resolve({ albumId }) });
    expect(landscape.status).toBe(201);
    const { photoId } = (await landscape.json()) as { photoId: string };
    await processMediaJob((await claimJob())!);
    const album = await db.orm.public.Album.where({ id: albumId }).first();
    expect(album?.thumbnailPhotoId).toBe(photoId);
    expect(await claimJob()).toBeNull();
  });

  // Without Content-Length the size is only known while reading, so the cap must apply mid-stream.
  it("rejects a chunked body that grows past the limit", async () => {
    const chunk = new Uint8Array(1024 * 1024);
    let sent = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent >= 101) return controller.close();
        sent += 1;
        controller.enqueue(chunk);
      },
    });
    const chunked = new Request(`http://test/api/albums/${albumId}/photos`, {
      method: "POST",
      headers: { "content-type": "image/jpeg", "x-file-name": "chunked.jpg" },
      body,
      // @ts-expect-error Node's fetch requires duplex for streaming bodies; the type omits it.
      duplex: "half",
    });
    expect((await POST(chunked, { params: Promise.resolve({ albumId }) })).status).toBe(413);
  });

  // Photos outrank albums in path resolution, so a photo named like a subalbum would hide it.
  it("refuses a photo whose path would shadow a subalbum", async () => {
    await db.orm.public.Album.create({ parentId: albumId, slug: "shadow", path: "/uploads/shadow", title: "Shadow" });
    expect((await POST(request(albumId, "shadow.jpg", await jpeg(10, 10)), { params: Promise.resolve({ albumId }) })).status).toBe(409);
    expect(await db.orm.public.Photo.where({ path: "/uploads/shadow" }).first()).toBeNull();
  });

  it("rejects duplicates, unsupported files and oversized declarations", async () => {
    expect((await POST(request(albumId, "img_0001.jpg", await jpeg(10, 10)), { params: Promise.resolve({ albumId }) })).status).toBe(409);
    expect((await POST(request(albumId, "notes.txt", Buffer.from("hello"), "text/plain"), { params: Promise.resolve({ albumId }) })).status).toBe(415);
    const big = new Request(`http://test/api/albums/${albumId}/photos`, {
      method: "POST",
      headers: { "content-type": "image/jpeg", "x-file-name": "big.jpg", "content-length": String(101 * 1024 * 1024) },
      body: new Uint8Array(Buffer.from("x")),
    });
    expect((await POST(big, { params: Promise.resolve({ albumId }) })).status).toBe(413);
  });

  it("returns stranded running jobs to the queue and fails ones out of attempts", async () => {
    const photo = await db.orm.public.Photo.where({ albumId }).first();
    const stale = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    // Attempts count the claim that stranded them, so 1 and 3 are one and three claims made.
    const [young, old, spent] = await db.orm.public.MediaJob.createAll([
      { photoId: photo!.id, status: "running", attempts: 1, startedAt: new Date().toISOString() },
      { photoId: photo!.id, status: "running", attempts: 1, startedAt: stale },
      { photoId: photo!.id, status: "running", attempts: 3, startedAt: stale },
    ]);
    expect(await requeueStrandedJobs()).toEqual({ requeued: 1, failed: 1 });
    const statusOf = async (id: string) => (await db.orm.public.MediaJob.where({ id }).first())!.status;
    expect(await statusOf(young.id)).toBe("running");
    expect(await statusOf(old.id)).toBe("pending");
    expect(await statusOf(spent.id)).toBe("failed");
    await db.orm.public.MediaJob.where((j) => j.id.in([young.id, old.id, spent.id])).deleteAndCount();
  });

  it("cleans up old finished jobs but keeps recent and failed-but-fresh ones", async () => {
    await pool.query(`update v4_media_job set finished_at = now() - interval '8 days' where status = 'done'`);
    const photo = await db.orm.public.Photo.where({ albumId }).first();
    await db.orm.public.MediaJob.create({ photoId: photo!.id, status: "failed", finishedAt: new Date().toISOString(), error: "boom" });
    expect(await cleanupFinishedJobs()).toBe(2);
    const remaining = await db.orm.public.MediaJob.select("status").all();
    expect(remaining.map((j) => j.status)).toEqual(["failed"]);
  });
});
