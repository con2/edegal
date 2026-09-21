import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { resolvePath } from "./resolve";
import { v4PublicPhotoCount, v4RandomPublicPhotoPath } from "./provider";
import type { Viewer } from "./viewer";

const anonymous: Viewer = { kind: "anonymous" };
const admin: Viewer = {
  kind: "user",
  userId: "u-admin",
  name: "A",
  isPhotographer: true,
  isAdmin: true,
};

/**
 * Root at /, with "event" (hidden and private children, three photos) and "shared" (one photo,
 * inherits the root's terms) below it, plus a moved album and a private redirect.
 */
async function insertFixtures() {
  const terms = await db.orm.public.Terms.create({
    title: "Root terms",
    text: "**Credit** the photographer.",
    url: "",
  });
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "V4 root",
    termsId: terms.id,
  });
  const event = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "event",
    path: "/event",
    title: "Event",
    body: "Hello",
    eventDate: "2019-06-22",
  });
  const visiblePhotographer = await db.orm.public.Photographer.create({
    slug: "visible",
    displayName: "Visible Photographer",
  });
  const privatePhotographer = await db.orm.public.Photographer.create({
    slug: "hidden-shooter",
    displayName: "Private Photographer",
    visibility: "private",
  });
  await db.orm.public.AlbumCredit.createAll([
    {
      albumId: event.id,
      photographerId: visiblePhotographer.id,
      isCopyright: true,
      ordering: 0,
    },
    {
      albumId: event.id,
      photographerId: privatePhotographer.id,
      isCopyright: true,
      ordering: 1,
    },
  ]);
  await db.orm.public.Album.create({
    parentId: event.id,
    slug: "hidden",
    path: "/event/hidden",
    title: "Hidden",
    visibility: "hidden",
  });
  await db.orm.public.Album.create({
    parentId: event.id,
    slug: "private",
    path: "/event/private",
    title: "Private",
    visibility: "private",
  });
  const secret = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "secret",
    path: "/secret",
    title: "V4 private",
    visibility: "private",
  });
  await db.orm.public.Photo.create({
    albumId: secret.id,
    slug: "hidden-1",
    path: "/secret/hidden-1",
    title: "Hidden 1",
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "old-name",
    path: "/old-name",
    title: "Moved",
    eventDate: "2020-01-01",
    redirectUrl: "/event",
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "secret-move",
    path: "/secret-move",
    title: "Secret move",
    eventDate: "2021-01-01",
    visibility: "private",
    redirectUrl: "/event",
  });

  const pic1 = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "pic-1",
    path: "/event/pic-1",
    title: "Pic 1",
    takenAt: "2019-06-22T09:00:00Z",
  });
  await db.orm.public.Media.createAll([
    {
      photoId: pic1.id,
      role: "thumbnail",
      format: "jpeg",
      width: 360,
      height: 240,
      storageKey: "previews/event/pic-1.thumbnail.jpeg",
    },
    {
      photoId: pic1.id,
      role: "thumbnail",
      format: "webp",
      width: 360,
      height: 240,
      storageKey: "previews/event/pic-1.thumbnail.webp",
    },
    {
      photoId: pic1.id,
      role: "preview",
      format: "jpeg",
      width: 2025,
      height: 1350,
      storageKey: "previews/event/pic-1.preview.jpeg",
    },
    {
      photoId: pic1.id,
      role: "original",
      format: "jpeg",
      width: 6000,
      height: 4000,
      storageKey: "pictures/event/pic-1.jpeg",
    },
  ]);
  const pic2 = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "pic-2",
    path: "/event/pic-2",
    title: "Pic 2",
  });
  await db.orm.public.Media.create({
    photoId: pic2.id,
    role: "thumbnail",
    format: "jpeg",
    width: 360,
    height: 240,
    storageKey: "previews/event/pic-2.thumbnail.jpeg",
  });
  const pic3 = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "pic-3",
    path: "/event/pic-3",
    title: "No thumbnail",
  });
  await db.orm.public.Media.create({
    photoId: pic3.id,
    role: "original",
    format: "jpeg",
    width: 6000,
    height: 4000,
    storageKey: "pictures/event/pic-3.jpeg",
  });
  await db.orm.public.Album.where({ id: event.id }).update({
    thumbnailPhotoId: pic1.id,
  });

  const shared = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "shared",
    path: "/shared",
    title: "V4 shared",
    eventDate: "2026-01-01",
  });
  const img1 = await db.orm.public.Photo.create({
    albumId: shared.id,
    slug: "img-1",
    path: "/shared/img-1",
    title: "Img 1",
  });
  await db.orm.public.Media.createAll([
    {
      photoId: img1.id,
      role: "thumbnail",
      format: "jpeg",
      width: 360,
      height: 240,
      storageKey: "thumbnails/shared/img-1.jpeg",
    },
    {
      photoId: img1.id,
      role: "preview",
      format: "avif",
      width: 2025,
      height: 1350,
      storageKey: "previews/shared/img-1.avif",
    },
    {
      photoId: img1.id,
      role: "preview",
      format: "jpeg",
      width: 2025,
      height: 1350,
      storageKey: "previews/shared/img-1.jpeg",
    },
  ]);
  await db.orm.public.Album.where({ id: shared.id }).update({
    thumbnailPhotoId: img1.id,
  });
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_redirect, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await insertFixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("resolvePath", () => {
  it("resolves an album and a photo, and returns null for an unknown path", async () => {
    expect(await resolvePath("/shared")).toMatchObject({ kind: "album" });
    expect(await resolvePath("/shared/img-1")).toMatchObject({
      kind: "photo",
    });
    expect(await resolvePath("/nope")).toBeNull();
  });
});

describe("visibility of redirects and random picks", () => {
  // A redirect discloses the album and its destination; a private one shows neither to visitors.
  it("follows a private redirect only for admins", async () => {
    expect(await loadGalleryPage("/secret-move", anonymous)).toEqual({
      kind: "not-found",
    });
    expect(await loadGalleryPage("/secret-move", admin)).toEqual({
      kind: "redirect",
      to: "/event",
    });
    expect(await loadGalleryPage("/old-name", anonymous)).toEqual({
      kind: "redirect",
      to: "/event",
    });
  });

  it("counts and samples only photos in public albums", async () => {
    expect(await v4PublicPhotoCount()).toBe(4);
    const path = await v4RandomPublicPhotoPath();
    expect([
      "/shared/img-1",
      "/event/pic-1",
      "/event/pic-2",
      "/event/pic-3",
    ]).toContain(path);
  });
});

describe("loadGalleryPage", () => {
  it("lists the root album's own subalbums, newest first", async () => {
    const result = await loadGalleryPage("/", anonymous);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.album.title).toBe("V4 root");
    expect(result.album.subalbums.map((s) => s.path)).toEqual([
      "/shared",
      "/old-name",
      "/event",
    ]);
  });

  it("lists hidden and private children only for those allowed", async () => {
    const anon = await loadGalleryPage("/event", anonymous);
    const asAdmin = await loadGalleryPage("/event", admin);
    if (anon.kind !== "ok" || asAdmin.kind !== "ok")
      throw new Error("expected ok");
    expect(anon.album.subalbums.map((s) => s.path)).toEqual([]);
    expect(asAdmin.album.subalbums.map((s) => s.path).sort()).toEqual([
      "/event/hidden",
      "/event/private",
    ]);
    expect(anon.album.photos.map((p) => p.path)).toEqual([
      "/event/pic-1",
      "/event/pic-2",
    ]);
  });

  it("hides private albums entirely from anonymous visitors but not hidden ones", async () => {
    expect((await loadGalleryPage("/event/private", anonymous)).kind).toBe(
      "not-found",
    );
    expect((await loadGalleryPage("/event/hidden", anonymous)).kind).toBe("ok");
    expect((await loadGalleryPage("/secret", anonymous)).kind).toBe(
      "not-found",
    );
    expect((await loadGalleryPage("/event/private", admin)).kind).toBe("ok");
  });

  it("returns the whole album with the requested photo and media sets from media rows", async () => {
    const result = await loadGalleryPage("/event/pic-1", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.path).toBe("/event/pic-1");
    expect(new Date(result.photo!.takenAt!).toISOString()).toBe(
      "2019-06-22T09:00:00.000Z",
    );
    expect(result.photo?.thumbnail.alternates).toEqual([
      {
        src: "/media/previews/event/pic-1.thumbnail.webp",
        storageKey: "previews/event/pic-1.thumbnail.webp",
        width: 360,
        height: 240,
        format: "webp",
        byteSize: null,
      },
    ]);
    expect(result.photo?.original?.src).toBe(
      "/media/pictures/event/pic-1.jpeg",
    );
    expect(result.album.photos).toHaveLength(2);
    expect(result.album.body).toBe("Hello");
  });

  it("does not link a credit to a private photographer's own page", async () => {
    const result = await loadGalleryPage("/event", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.credits.map((c) => [c.displayName, c.path])).toEqual([
      ["Visible Photographer", "/photographers/visible"],
      ["Private Photographer", null],
    ]);
  });

  it("follows album redirects and upstream redirects", async () => {
    expect(await loadGalleryPage("/old-name", anonymous)).toEqual({
      kind: "redirect",
      to: "/event",
    });
    expect(await loadGalleryPage("/old-name/pic-1", anonymous)).toEqual({
      kind: "redirect",
      to: "/event/pic-1",
    });
  });

  it("builds v4 media sets with the jpeg as fallback", async () => {
    const result = await loadGalleryPage("/shared/img-1", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.preview?.fallback.src).toBe(
      "/media/previews/shared/img-1.jpeg",
    );
    expect(result.photo?.preview?.alternates).toEqual([
      expect.objectContaining({
        src: "/media/previews/shared/img-1.avif",
        format: "avif",
      }),
    ]);
    expect(result.album.breadcrumb).toEqual([{ path: "/", title: "V4 root" }]);
  });

  it("inherits terms from the nearest ancestor", async () => {
    const result = await loadGalleryPage("/shared", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.terms).toEqual({
      text: "**Credit** the photographer.",
      url: "",
    });
  });
});
