import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { s3 } from "@/config";
import { storageFor } from "@/media/storage";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

vi.mock("@/gallery/viewer", () => ({ getViewer: async () => ({ kind: "anonymous" }) }));

const { GET } = await import("./route");

const storageKey = `thumbnails/media-route-test/${Date.now().toString(36)}.jpeg`;
const bytes = Buffer.from("s3 thumbnail bytes");

beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  const album = await db.orm.public.Album.create({ parentId: root.id, slug: "s3", path: "/s3", title: "S3" });
  const photo = await db.orm.public.Photo.create({ albumId: album.id, slug: "pic", path: "/s3/pic", title: "pic" });
  await storageFor("s3").put(storageKey, bytes, "image/jpeg");
  await db.orm.public.Media.create({ photoId: photo.id, role: "thumbnail", format: "jpeg", width: 10, height: 10, storageKey, backend: "s3" });
});

afterAll(async () => {
  await storageFor("s3").delete(storageKey);
  await db.close();
  await pool.end();
});

describe("GET /media/<key> for an S3 row", () => {
  it("redirects to a presigned URL on the public endpoint that serves the bytes", async () => {
    const response = await GET(new Request(`http://test/media/${storageKey}`), {
      params: Promise.resolve({ key: storageKey.split("/") }),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("cache-control")).toBe("private, max-age=3600");
    const location = response.headers.get("location")!;
    expect(location.startsWith(`${s3.publicEndpoint}/${s3.bucket}/`)).toBe(true);
    expect(new URL(location).searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    const fetched = await fetch(location);
    expect(fetched.status).toBe(200);
    expect(Buffer.from(await fetched.arrayBuffer())).toEqual(bytes);
  });
});
