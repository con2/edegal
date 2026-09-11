import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { resolvePath } from "./resolve";
import { v4PublicPhotoCount, v4RandomPublicPhotoPath } from "./v4/provider";
import type { Viewer } from "./viewer";

const anonymous: Viewer = { kind: "anonymous" };
const staff: Viewer = {
  kind: "user",
  userId: "u-staff",
  name: "S",
  isPhotographer: true,
  isAdmin: false,
};

/**
 * Legacy fixtures are inserted with SQL because the Django tables are outside the Prisma contract.
 * Root album is at /, "shared" exists in both worlds to prove v4 wins.
 */
async function insertLegacyFixtures() {
  await pool.query(`
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id)
    values
      (1, '', '/', 'Legacy root', '', '', true, true, true, '', 'simple', 1, 10, 1, 0, null, null),
      (2, 'legacy-event', '/legacy-event', 'Legacy event', '', '<p>Hello <script>x()</script></p>', true, true, true, '', 'simple', 2, 7, 1, 1, '2019-06-22', 1),
      (3, 'hidden', '/legacy-event/hidden', 'Hidden legacy', '', '', true, false, true, '', 'simple', 3, 4, 1, 2, '2019-06-22', 2),
      (4, 'private', '/legacy-event/private', 'Private legacy', '', '', false, true, true, '', 'simple', 5, 6, 1, 2, '2019-06-22', 2),
      (5, 'shared', '/shared', 'Legacy shared', '', '', true, true, true, '', 'simple', 8, 9, 1, 1, '2018-01-01', 1),
      (6, 'old-name', '/old-name', 'Moved', '', '', true, true, true, '/legacy-event', 'simple', 11, 12, 2, 1, null, 1),
      (7, 'secret-move', '/secret-move', 'Secret move', '', '', false, true, true, '/legacy-event', 'simple', 13, 14, 3, 1, null, 1)
  `);
  await pool.query(`
    insert into edegal_termsandconditions (id, digest, text, is_public, url, user_id)
    values (1, 'd', E'Ask first.\nCredit always.', true, 'https://legacy.example/terms', null)
  `);
  await pool.query(
    `update edegal_album set terms_and_conditions_id = 1 where id = 2`,
  );
  await pool.query(`
    insert into edegal_picture (id, slug, "order", path, title, description, is_public, album_id, taken_at)
    values
      (1, 'pic-1', 10, '/legacy-event/pic-1', 'Pic 1', '', true, 2, '2019-06-22T12:00:00+03'),
      (2, 'pic-2', 20, '/legacy-event/pic-2', 'Pic 2', '', true, 2, null),
      (3, 'pic-3', 30, '/legacy-event/pic-3', 'No thumbnail', '', true, 2, null),
      (4, 'secret', 40, '/legacy-event/secret', 'Secret', '', false, 2, null)
  `);
  await pool.query(
    `update edegal_album set cover_picture_id = 1 where id in (2, 3, 4, 5)`,
  );
  await pool.query(`
    insert into edegal_mediaspec (id, max_width, max_height, quality, format, role, active) values
      (1, 900, 240, 60, 'jpeg', 'thumbnail', true), (2, 900, 240, 75, 'webp', 'thumbnail', true), (3, 2400, 1350, 85, 'jpeg', 'preview', true)
  `);
  await pool.query(`
    insert into edegal_media (id, width, height, src, picture_id, spec_id, format, role) values
      (1, 360, 240, 'previews/legacy-event/pic-1.thumbnail.jpeg', 1, 1, 'jpeg', 'thumbnail'),
      (2, 360, 240, 'previews/legacy-event/pic-1.thumbnail.webp', 1, 2, 'webp', 'thumbnail'),
      (3, 2025, 1350, 'previews/legacy-event/pic-1.preview.jpeg', 1, 3, 'jpeg', 'preview'),
      (4, 6000, 4000, 'pictures/legacy-event/pic-1.jpeg', 1, null, 'jpeg', 'original'),
      (5, 360, 240, 'previews/legacy-event/pic-2.thumbnail.jpeg', 2, 1, 'jpeg', 'thumbnail'),
      (6, 360, 240, 'previews/legacy-event/secret.thumbnail.jpeg', 4, 1, 'jpeg', 'thumbnail')
  `);
}

async function insertV4Fixtures() {
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
  const shared = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "shared",
    path: "/shared",
    title: "V4 shared",
    eventDate: "2026-01-01",
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
  const photo = await db.orm.public.Photo.create({
    albumId: shared.id,
    slug: "img-1",
    path: "/shared/img-1",
    title: "Img 1",
  });
  await db.orm.public.Media.createAll([
    {
      photoId: photo.id,
      role: "thumbnail",
      format: "jpeg",
      width: 360,
      height: 240,
      storageKey: "thumbnails/shared/img-1.jpeg",
    },
    {
      photoId: photo.id,
      role: "preview",
      format: "avif",
      width: 2025,
      height: 1350,
      storageKey: "previews/shared/img-1.avif",
    },
    {
      photoId: photo.id,
      role: "preview",
      format: "jpeg",
      width: 2025,
      height: 1350,
      storageKey: "previews/shared/img-1.jpeg",
    },
  ]);
  await db.orm.public.Album.where({ id: shared.id }).update({
    thumbnailPhotoId: photo.id,
  });
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await pool.query(
    `truncate edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_series, edegal_termsandconditions cascade`,
  );
  await insertLegacyFixtures();
  await insertV4Fixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("resolvePath", () => {
  it("prefers v4 content over legacy content at the same path", async () => {
    expect(await resolvePath("/shared")).toMatchObject({
      kind: "album",
      source: "v4",
    });
    expect(await resolvePath("/legacy-event")).toMatchObject({
      kind: "album",
      source: "legacy",
    });
    expect(await resolvePath("/legacy-event/pic-1")).toMatchObject({
      kind: "photo",
      source: "legacy",
    });
    expect(await resolvePath("/shared/img-1")).toMatchObject({
      kind: "photo",
      source: "v4",
    });
    expect(await resolvePath("/nope")).toBeNull();
  });
});

describe("visibility of redirects and random picks", () => {
  // A redirect discloses the album and its destination; a private one shows neither to visitors.
  it("follows a private legacy redirect only for staff", async () => {
    expect(await loadGalleryPage("/secret-move", anonymous)).toEqual({
      kind: "not-found",
    });
    expect(await loadGalleryPage("/secret-move", staff)).toEqual({
      kind: "redirect",
      to: "/legacy-event",
    });
    expect(await loadGalleryPage("/old-name", anonymous)).toEqual({
      kind: "redirect",
      to: "/legacy-event",
    });
  });

  it("counts and samples only photos in public v4 albums", async () => {
    expect(await v4PublicPhotoCount()).toBe(1);
    expect(await v4RandomPublicPhotoPath()).toBe("/shared/img-1");
  });
});

describe("loadGalleryPage", () => {
  it("merges legacy root subalbums into the v4 front page", async () => {
    const result = await loadGalleryPage("/", anonymous);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.album.title).toBe("V4 root");
    expect(result.album.subalbums.map((s) => s.path)).toEqual([
      "/shared",
      "/legacy-event",
    ]);
  });

  it("lists hidden and private children only for those allowed", async () => {
    const anon = await loadGalleryPage("/legacy-event", anonymous);
    const asStaff = await loadGalleryPage("/legacy-event", staff);
    if (anon.kind !== "ok" || asStaff.kind !== "ok")
      throw new Error("expected ok");
    expect(anon.album.subalbums.map((s) => s.path)).toEqual([]);
    expect(asStaff.album.subalbums.map((s) => s.path).sort()).toEqual([
      "/legacy-event/hidden",
      "/legacy-event/private",
    ]);
    expect(anon.album.photos.map((p) => p.path)).toEqual([
      "/legacy-event/pic-1",
      "/legacy-event/pic-2",
    ]);
    expect(asStaff.album.photos.map((p) => p.path)).toContain(
      "/legacy-event/secret",
    );
  });

  it("hides private albums entirely from anonymous visitors but not hidden ones", async () => {
    expect(
      (await loadGalleryPage("/legacy-event/private", anonymous)).kind,
    ).toBe("not-found");
    expect(
      (await loadGalleryPage("/legacy-event/hidden", anonymous)).kind,
    ).toBe("ok");
    expect((await loadGalleryPage("/secret", anonymous)).kind).toBe(
      "not-found",
    );
    expect((await loadGalleryPage("/legacy-event/private", staff)).kind).toBe(
      "ok",
    );
  });

  it("returns the whole album with the requested photo and media sets from media rows", async () => {
    const result = await loadGalleryPage("/legacy-event/pic-1", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.path).toBe("/legacy-event/pic-1");
    expect(new Date(result.photo!.takenAt!).toISOString()).toBe(
      "2019-06-22T09:00:00.000Z",
    );
    expect(result.photo?.thumbnail.alternates).toEqual([
      {
        src: "/media/previews/legacy-event/pic-1.thumbnail.webp",
        format: "webp",
      },
    ]);
    expect(result.photo?.original?.src).toBe(
      "/media/pictures/legacy-event/pic-1.jpeg",
    );
    expect(result.album.photos).toHaveLength(2);
    expect(result.album.body.text).toBe("<p>Hello </p>");
  });

  it("follows legacy album redirects and upstream redirects", async () => {
    expect(await loadGalleryPage("/old-name", anonymous)).toEqual({
      kind: "redirect",
      to: "/legacy-event",
    });
    expect(await loadGalleryPage("/old-name/pic-1", anonymous)).toEqual({
      kind: "redirect",
      to: "/legacy-event/pic-1",
    });
  });

  it("builds v4 media sets with the jpeg as fallback", async () => {
    const result = await loadGalleryPage("/shared/img-1", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.preview?.fallback.src).toBe(
      "/media/previews/shared/img-1.jpeg",
    );
    expect(result.photo?.preview?.alternates).toEqual([
      { src: "/media/previews/shared/img-1.avif", format: "avif" },
    ]);
    expect(result.album.breadcrumb).toEqual([{ path: "/", title: "V4 root" }]);
  });

  it("inherits v4 terms from the nearest ancestor and maps legacy terms as plain text", async () => {
    const v4 = await loadGalleryPage("/shared", anonymous);
    const legacy = await loadGalleryPage("/legacy-event", anonymous);
    if (v4.kind !== "ok" || legacy.kind !== "ok")
      throw new Error("expected ok");
    expect(v4.album.terms).toEqual({
      kind: "markdown",
      text: "**Credit** the photographer.",
      url: "",
    });
    expect(legacy.album.terms).toEqual({
      kind: "text",
      text: "Ask first.\nCredit always.",
      url: "https://legacy.example/terms",
    });
  });
});
