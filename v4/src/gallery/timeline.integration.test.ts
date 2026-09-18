import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { loadTimelinePage } from "./timeline";
import type { Viewer } from "./viewer";

const anonymous: Viewer = { kind: "anonymous" };
const staff: Viewer = {
  kind: "user",
  userId: "u-staff",
  name: "Staff",
  isPhotographer: true,
  isAdmin: false,
};
const admin: Viewer = {
  kind: "user",
  userId: "u-admin",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
};
let ownerA: Viewer;
let ownerB: Viewer;

async function thumbnail(photoId: string, storageKey: string) {
  await db.orm.public.Media.create({
    photoId,
    role: "thumbnail",
    format: "jpeg",
    width: 360,
    height: 240,
    storageKey,
  });
}

/**
 * v4: /event (owner A) > /event/day-1 > /event/day-1/stage, plus /event/hidden (hidden, owner A)
 * and /event/private (private, owner B) - a different owner than the timeline's own root album, to
 * prove visibility is recomputed per descendant rather than inherited from the root.
 */
async function insertV4Fixtures() {
  const userA = await db.orm.public.User.create({
    sub: "owner-a",
    displayName: "Owner A",
  });
  const userB = await db.orm.public.User.create({
    sub: "owner-b",
    displayName: "Owner B",
  });
  ownerA = {
    kind: "user",
    userId: userA.id,
    name: "Owner A",
    isPhotographer: true,
    isAdmin: false,
  };
  ownerB = {
    kind: "user",
    userId: userB.id,
    name: "Owner B",
    isPhotographer: true,
    isAdmin: false,
  };

  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "V4 root",
  });
  const event = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "event",
    path: "/event",
    title: "Event",
    ownerId: userA.id,
  });
  const dayOne = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "day-1",
    path: "/event/day-1",
    title: "Day 1",
    ownerId: userA.id,
  });
  const stage = await db.orm.public.Album.create({
    parentId: dayOne.id,
    slug: "stage",
    path: "/event/day-1/stage",
    title: "Stage",
    ownerId: userA.id,
  });
  const hidden = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "hidden",
    path: "/event/hidden",
    title: "Hidden",
    visibility: "hidden",
    ownerId: userA.id,
  });
  const priv = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "private",
    path: "/event/private",
    title: "Private",
    visibility: "private",
    ownerId: userB.id,
  });

  const p0 = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "p0",
    path: "/event/p0",
    title: "P0",
    takenAt: "2024-01-01T00:00:00Z",
  });
  await thumbnail(p0.id, "thumbnails/event/p0.jpeg");

  const pNull = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "p-null",
    path: "/event/p-null",
    title: "No capture time",
    takenAt: null,
  });
  await thumbnail(pNull.id, "thumbnails/event/p-null.jpeg");

  // Uploaded but not processed yet: has an original, no thumbnail. Must never appear anywhere.
  const pProcessing = await db.orm.public.Photo.create({
    albumId: event.id,
    slug: "p-processing",
    path: "/event/p-processing",
    title: "Processing",
    takenAt: "2024-01-01T00:30:00Z",
  });
  await db.orm.public.Media.create({
    photoId: pProcessing.id,
    role: "original",
    format: "jpeg",
    width: 1200,
    height: 800,
    storageKey: "pictures/event/p-processing.jpeg",
  });

  const p1 = await db.orm.public.Photo.create({
    albumId: dayOne.id,
    slug: "p1",
    path: "/event/day-1/p1",
    title: "P1",
    takenAt: "2024-01-02T00:00:00Z",
  });
  await thumbnail(p1.id, "thumbnails/event/day-1/p1.jpeg");

  const p2 = await db.orm.public.Photo.create({
    albumId: stage.id,
    slug: "p2",
    path: "/event/day-1/stage/p2",
    title: "P2",
    takenAt: "2024-01-03T00:00:00Z",
  });
  await thumbnail(p2.id, "thumbnails/event/day-1/stage/p2.jpeg");

  const pHidden = await db.orm.public.Photo.create({
    albumId: hidden.id,
    slug: "p-hidden",
    path: "/event/hidden/p-hidden",
    title: "Hidden photo",
    takenAt: "2024-01-01T12:00:00Z",
  });
  await thumbnail(pHidden.id, "thumbnails/event/hidden/p-hidden.jpeg");

  const pPrivate = await db.orm.public.Photo.create({
    albumId: priv.id,
    slug: "p-private",
    path: "/event/private/p-private",
    title: "Private photo",
    takenAt: "2024-01-01T18:00:00Z",
  });
  await thumbnail(pPrivate.id, "thumbnails/event/private/p-private.jpeg");
}

/**
 * legacy: /legacy-event (public) > /legacy-event/day-1 > /legacy-event/day-1/stage, plus
 * /legacy-event/hidden (is_visible = false) - a public picture inside it must still be excluded
 * from an anonymous timeline, unlike legacy's own backend, which only checks the picture's own
 * `is_public`.
 */
async function insertLegacyFixtures() {
  await pool.query(`
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id)
    values
      (1, '', '/', 'Legacy root', '', '', true, true, true, '', 'simple', 1, 10, 1, 0, null, null),
      (2, 'legacy-event', '/legacy-event', 'Legacy event', '', '', true, true, true, '', 'simple', 2, 9, 1, 1, null, 1),
      (3, 'day-1', '/legacy-event/day-1', 'Day 1', '', '', true, true, true, '', 'simple', 3, 6, 1, 2, null, 2),
      (4, 'stage', '/legacy-event/day-1/stage', 'Stage', '', '', true, true, true, '', 'simple', 4, 5, 1, 3, null, 3),
      (5, 'hidden', '/legacy-event/hidden', 'Hidden', '', '', true, false, true, '', 'simple', 7, 8, 1, 2, null, 2)
  `);
  await pool.query(`
    insert into edegal_picture (id, slug, "order", path, title, description, is_public, album_id, taken_at)
    values
      (1, 'pic-1', 0, '/legacy-event/pic-1', 'Pic 1', '', true, 2, '2024-02-01T00:00:00+00'),
      (2, 'secret', 1, '/legacy-event/secret', 'Secret', '', false, 2, '2024-02-01T06:00:00+00'),
      (3, 'pic-null', 2, '/legacy-event/pic-null', 'No capture time', '', true, 2, null),
      (4, 'pic-no-thumb', 3, '/legacy-event/pic-no-thumb', 'Not processed', '', true, 2, '2024-02-01T03:00:00+00'),
      (5, 'pic-hidden', 0, '/legacy-event/hidden/pic-hidden', 'Hidden picture', '', true, 5, '2024-02-01T12:00:00+00'),
      (6, 'pic-2', 0, '/legacy-event/day-1/pic-2', 'Pic 2', '', true, 3, '2024-02-02T00:00:00+00'),
      (7, 'pic-3', 0, '/legacy-event/day-1/stage/pic-3', 'Pic 3', '', true, 4, '2024-02-03T00:00:00+00')
  `);
  await pool.query(`
    insert into edegal_mediaspec (id, max_width, max_height, quality, format, role, active)
    values (1, 900, 240, 60, 'jpeg', 'thumbnail', true)
  `);
  await pool.query(`
    insert into edegal_media (id, width, height, src, picture_id, spec_id, format, role)
    values
      (1, 360, 240, 'previews/legacy-event/pic-1.thumbnail.jpeg', 1, 1, 'jpeg', 'thumbnail'),
      (2, 360, 240, 'previews/legacy-event/secret.thumbnail.jpeg', 2, 1, 'jpeg', 'thumbnail'),
      (3, 360, 240, 'previews/legacy-event/hidden/pic-hidden.thumbnail.jpeg', 5, 1, 'jpeg', 'thumbnail'),
      (4, 360, 240, 'previews/legacy-event/day-1/pic-2.thumbnail.jpeg', 6, 1, 'jpeg', 'thumbnail'),
      (5, 360, 240, 'previews/legacy-event/day-1/stage/pic-3.thumbnail.jpeg', 7, 1, 'jpeg', 'thumbnail')
  `);
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await pool.query(
    `truncate edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_series, edegal_termsandconditions cascade`,
  );
  await insertV4Fixtures();
  await insertLegacyFixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("loadTimelinePage (v4)", () => {
  it("flattens every descendant, sorted by capture time, dropping photos with no capture time or no thumbnail", async () => {
    const result = await loadTimelinePage("/event", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.kind).toBe("timeline");
    expect(result.album.subalbums).toEqual([]);
    expect(result.album.photos.map((p) => p.path)).toEqual([
      "/event/p0",
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
  });

  it("recomputes visibility per descendant instead of inheriting the root album's owner", async () => {
    const [asOwnerA, asOwnerB, asAdmin] = await Promise.all([
      loadTimelinePage("/event", ownerA),
      loadTimelinePage("/event", ownerB),
      loadTimelinePage("/event", admin),
    ]);
    if (
      asOwnerA.kind !== "ok" ||
      asOwnerB.kind !== "ok" ||
      asAdmin.kind !== "ok"
    )
      throw new Error("expected ok");
    // Owner A owns /event (the timeline root) and /event/hidden, but not /event/private.
    expect(asOwnerA.album.photos.map((p) => p.path)).toEqual([
      "/event/p0",
      "/event/hidden/p-hidden",
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
    // Owner B owns only /event/private, not the timeline's own root album.
    expect(asOwnerB.album.photos.map((p) => p.path)).toEqual([
      "/event/p0",
      "/event/private/p-private",
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
    expect(asAdmin.album.photos.map((p) => p.path)).toEqual([
      "/event/p0",
      "/event/hidden/p-hidden",
      "/event/private/p-private",
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
  });

  it("scopes the timeline to the requested photo's own album and selects it there", async () => {
    // /event/day-1 has a deeper descendant (/event/day-1/stage) of its own, so this proves the
    // timeline is rooted at the photo's containing album, not at whatever album /event/p0 lives in.
    const result = await loadTimelinePage("/event/day-1/p1", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.path).toBe("/event/day-1/p1");
    expect(result.album.photos.map((p) => p.path)).toEqual([
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
  });

  it("falls back to the normal album page for a photo the timeline dropped", async () => {
    const result = await loadTimelinePage("/event/p-null", anonymous);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.kind).toBe("album");
    expect(result.photo?.path).toBe("/event/p-null");
  });

  it("never runs a timeline at the site root", async () => {
    expect(await loadTimelinePage("/", anonymous)).toEqual(
      await loadGalleryPage("/", anonymous),
    );
  });
});

describe("loadTimelinePage (legacy)", () => {
  it("flattens a legacy subtree via its nested-set columns, dropping a null-taken_at and a thumbnail-less picture", async () => {
    const result = await loadTimelinePage("/legacy-event", staff);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.photos.map((p) => p.path)).not.toContain(
      "/legacy-event/pic-null",
    );
    expect(result.album.photos.map((p) => p.path)).not.toContain(
      "/legacy-event/pic-no-thumb",
    );
  });

  it("hides a public picture inside a hidden descendant album from visitors but shows it to staff", async () => {
    const anon = await loadTimelinePage("/legacy-event", anonymous);
    const asStaff = await loadTimelinePage("/legacy-event", staff);
    if (anon.kind !== "ok" || asStaff.kind !== "ok")
      throw new Error("expected ok");
    expect(anon.album.photos.map((p) => p.path)).toEqual([
      "/legacy-event/pic-1",
      "/legacy-event/day-1/pic-2",
      "/legacy-event/day-1/stage/pic-3",
    ]);
    expect(asStaff.album.photos.map((p) => p.path)).toEqual([
      "/legacy-event/pic-1",
      "/legacy-event/secret",
      "/legacy-event/hidden/pic-hidden",
      "/legacy-event/day-1/pic-2",
      "/legacy-event/day-1/stage/pic-3",
    ]);
  });
});
