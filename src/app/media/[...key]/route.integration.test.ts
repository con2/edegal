import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { storageFor } from "@/media/storage";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

let viewer: Viewer = { kind: "anonymous" };
vi.mock("@/gallery/viewer", () => ({ getViewer: async () => viewer }));

const { GET } = await import("./route");

const get = (key: string) =>
  GET(new Request(`http://test/media/${key}`), {
    params: Promise.resolve({ key: key.split("/") }),
  });

let ownerId: string;

beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const owner = await db.orm.public.User.create({ sub: "test:owner", displayName: "Owner" });
  ownerId = owner.id;
  const root = await db.orm.public.Album.create({ slug: "", path: "/", title: "Root" });
  const secret = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "secret",
    path: "/secret",
    title: "Secret",
    visibility: "private",
    ownerId,
  });
  // A public album inside the private one is still private to the rest of the site.
  const inner = await db.orm.public.Album.create({ parentId: secret.id, slug: "inner", path: "/secret/inner", title: "Inner", ownerId });
  const open = await db.orm.public.Album.create({ parentId: root.id, slug: "open", path: "/open", title: "Open" });
  for (const [album, slug] of [
    [inner, "hidden-pic"],
    [open, "public-pic"],
  ] as const) {
    const photo = await db.orm.public.Photo.create({ albumId: album.id, slug, path: `${album.path}/${slug}`, title: slug });
    const storageKey = `thumbnails${album.path}/${slug}.jpeg`;
    await storageFor("fs").put(storageKey, Buffer.from(`bytes of ${slug}`), "image/jpeg");
    await db.orm.public.Media.create({ photoId: photo.id, role: "thumbnail", format: "jpeg", width: 10, height: 10, storageKey });
  }
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("GET /media/<key>", () => {
  it("streams a public album's file to anyone", async () => {
    const response = await get("thumbnails/open/public-pic.jpeg");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(await response.text()).toBe("bytes of public-pic");
  });

  it("hides a file under a private album from anonymous viewers", async () => {
    expect((await get("thumbnails/secret/inner/hidden-pic.jpeg")).status).toBe(404);
  });

  it("streams it to the owner", async () => {
    viewer = { kind: "user", userId: ownerId, name: "Owner", isPhotographer: true, isAdmin: false };
    try {
      const response = await get("thumbnails/secret/inner/hidden-pic.jpeg");
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("bytes of hidden-pic");
    } finally {
      viewer = { kind: "anonymous" };
    }
  });

  it("404s for keys without a media row, including files that exist on disk", async () => {
    await storageFor("fs").put("thumbnails/open/orphan.jpeg", Buffer.from("orphan"), "image/jpeg");
    expect((await get("thumbnails/open/orphan.jpeg")).status).toBe(404);
    expect((await get("../etc/passwd")).status).toBe(404);
  });
});
