import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import {
  loadPhotographerPageBySlug,
  loadPhotographersIndex,
} from "./photographers";

/**
 * Legacy photographer "shared" also exists in v4 to prove the two are merged into one page.
 * Legacy photographer "nocover" has albums but no cover picture, so it earns no tile.
 */
async function insertLegacyFixtures() {
  await pool.query(`
    insert into edegal_photographer (id, slug, display_name, homepage_url, twitter_handle, instagram_handle, facebook_handle, flickr_handle, bluesky_handle, threads_handle, email, body, cover_picture_id)
    values
      (1, 'legacy-only', 'Legacy Only', 'https://legacy.example', 'legacyonly', '', '', '', '', '', '', '<p>Hi <script>x()</script></p>', null),
      (2, 'shared', 'Shared Shooter', '', '', '', '', '', '', '', '', '<p>Old intro</p>', null),
      (3, 'nocover', 'No Cover', '', '', '', '', '', '', '', '', '', null)
  `);
  await pool.query(`
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id, photographer_id)
    values
      (1, '', '/', 'Legacy root', '', '', true, true, true, '', 'simple', 1, 8, 1, 0, null, null, null),
      (2, 'con-2019', '/con-2019', 'Con 2019', '', '', true, true, true, '', 'simple', 2, 7, 1, 1, '2019-06-22', 1, null),
      (3, 'legacy-only', '/con-2019/legacy-only', 'Legacy Only - Saturday', '', '', true, true, true, '', 'simple', 3, 4, 1, 2, '2019-06-22', 2, 1),
      (4, 'shared', '/con-2019/shared', 'Shared Shooter: Sunday', '', '', true, true, true, '', 'simple', 5, 6, 1, 2, '2019-06-23', 2, 2),
      (5, 'nocover', '/nocover', 'No Cover', '', '', true, true, true, '', 'simple', 9, 10, 2, 1, '2019-06-23', 1, 3)
  `);
  await pool.query(`
    insert into edegal_picture (id, slug, "order", path, title, description, is_public, album_id, taken_at)
    values
      (1, 'pic-1', 10, '/con-2019/legacy-only/pic-1', 'Pic 1', '', true, 3, null),
      (2, 'pic-2', 10, '/con-2019/shared/pic-2', 'Pic 2', '', true, 4, null)
  `);
  await pool.query(`
    insert into edegal_mediaspec (id, max_width, max_height, quality, format, role, active) values
      (1, 900, 240, 60, 'jpeg', 'thumbnail', true)
  `);
  await pool.query(`
    insert into edegal_media (id, width, height, src, picture_id, spec_id, format, role) values
      (1, 360, 240, 'previews/con-2019/legacy-only/pic-1.thumbnail.jpeg', 1, 1, 'jpeg', 'thumbnail'),
      (2, 360, 240, 'previews/con-2019/shared/pic-2.thumbnail.jpeg', 2, 1, 'jpeg', 'thumbnail')
  `);
  await pool.query(`update edegal_album set cover_picture_id = 1 where id = 3`);
  await pool.query(`update edegal_album set cover_picture_id = 2 where id = 4`);
  await pool.query(
    `update edegal_photographer set cover_picture_id = 1 where id = 1`,
  );
  await pool.query(
    `update edegal_photographer set cover_picture_id = 2 where id = 2`,
  );
}

async function insertV4Fixtures() {
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "V4 root",
  });
  const event = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "con-2026",
    path: "/con-2026",
    title: "Con 2026",
    eventDate: "2026-08-01",
  });
  const album = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "shared",
    path: "/con-2026/shared",
    title: "Shared Shooter » Friday",
    eventDate: "2026-08-01",
  });
  const photo = await db.orm.public.Photo.create({
    albumId: album.id,
    slug: "img-1",
    path: "/con-2026/shared/img-1",
    title: "Img 1",
  });
  await db.orm.public.Media.create({
    photoId: photo.id,
    role: "thumbnail",
    format: "jpeg",
    width: 360,
    height: 240,
    storageKey: "thumbnails/con-2026/shared/img-1.jpeg",
  });
  await db.orm.public.Album.where({ id: album.id }).update({
    thumbnailPhotoId: photo.id,
  });
  const photographer = await db.orm.public.Photographer.create({
    slug: "shared",
    displayName: "Shared Shooter",
    introduction: "New intro",
  });
  await db.orm.public.PhotographerLink.create({
    photographerId: photographer.id,
    href: "https://shared.example",
    title: "Homepage",
  });
  await db.orm.public.AlbumCredit.create({
    albumId: album.id,
    photographerId: photographer.id,
    isCopyright: true,
  });
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await pool.query(
    `truncate edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_photographer cascade`,
  );
  await insertLegacyFixtures();
  await insertV4Fixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("loadPhotographersIndex", () => {
  it("tiles every photographer with a cover once, sorted by name", async () => {
    const index = await loadPhotographersIndex();
    expect(index.kind).toBe("photographers");
    expect(index.subalbums.map((s) => [s.path, s.title])).toEqual([
      ["/photographers/legacy-only", "Legacy Only"],
      ["/photographers/shared", "Shared Shooter"],
    ]);
  });
});

describe("loadPhotographerPageBySlug", () => {
  it("renders a legacy photographer with sanitized intro, cover and context titles", async () => {
    const page = await loadPhotographerPageBySlug("legacy-only");
    expect(page).not.toBeNull();
    expect(page?.kind).toBe("photographer");
    expect(page?.body).toEqual({ kind: "html", text: "<p>Hi </p>" });
    expect(page?.cover?.fallback.src).toContain("pic-1.thumbnail.jpeg");
    expect(page?.credits[0]?.links.map((l) => l.href)).toEqual([
      "https://legacy.example",
      "https://twitter.com/legacyonly",
    ]);
    expect(page?.subalbums.map((s) => s.title)).toEqual([
      "Con 2019 » Saturday",
    ]);
  });

  it("merges v4 and legacy albums of one slug, v4 first", async () => {
    const page = await loadPhotographerPageBySlug("shared");
    expect(page?.source).toBe("v4");
    expect(page?.body).toEqual({ kind: "markdown", text: "New intro" });
    expect(page?.cover?.fallback.src).toContain("pic-2.thumbnail.jpeg");
    expect(page?.subalbums.map((s) => [s.path, s.title])).toEqual([
      ["/con-2026/shared", "Con 2026 » Friday"],
      ["/con-2019/shared", "Con 2019 » Sunday"],
    ]);
  });

  it("returns null for slugs no photographer has", async () => {
    expect(await loadPhotographerPageBySlug("nobody")).toBeNull();
  });
});
