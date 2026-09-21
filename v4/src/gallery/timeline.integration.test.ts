import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { loadTimelinePage } from "./timeline";
import type { Viewer } from "./viewer";

const anonymous: Viewer = { kind: "anonymous" };
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
    isDownloadable: true,
  });
  const dayOne = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "day-1",
    path: "/event/day-1",
    title: "Day 1",
    ownerId: userA.id,
    isDownloadable: false,
  });
  const photographerA = await db.orm.public.Photographer.create({
    userId: userA.id,
    slug: "photographer-a",
    displayName: "Photographer A",
    email: "a@example.com",
  });
  const photographerB = await db.orm.public.Photographer.create({
    userId: userB.id,
    slug: "photographer-b",
    displayName: "Photographer B",
  });
  await db.orm.public.AlbumCredit.create({
    albumId: event.id,
    photographerId: photographerA.id,
    isCopyright: true,
    description: "",
  });
  await db.orm.public.AlbumCredit.create({
    albumId: dayOne.id,
    photographerId: photographerB.id,
    isCopyright: true,
    description: "",
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

beforeAll(async () => {
  await pool.query(
    `truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await insertV4Fixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("loadTimelinePage (v4)", () => {
  it("flattens every descendant, sorted by capture time, dropping photos with no capture time or no thumbnail", async () => {
    const result = await loadTimelinePage("/event", anonymous, "");
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
      loadTimelinePage("/event", ownerA, ""),
      loadTimelinePage("/event", ownerB, ""),
      loadTimelinePage("/event", admin, ""),
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
    const result = await loadTimelinePage("/event/day-1/p1", anonymous, "");
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.photo?.path).toBe("/event/day-1/p1");
    expect(result.album.photos.map((p) => p.path)).toEqual([
      "/event/day-1/p1",
      "/event/day-1/stage/p2",
    ]);
  });

  it("falls back to the normal album page for a photo the timeline dropped", async () => {
    const result = await loadTimelinePage("/event/p-null", anonymous, "");
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.kind).toBe("album");
    expect(result.photo?.path).toBe("/event/p-null");
  });

  it("never runs a timeline at the site root", async () => {
    expect(await loadTimelinePage("/", anonymous, "")).toEqual(
      await loadGalleryPage("/", anonymous),
    );
  });

  it("shows a hidden album's own timeline its own direct photos even to anonymous visitors", async () => {
    // /event/hidden is hidden, not private: its own page is reachable, and (like the normal
    // album page) its own photos are shown once you're on it - only its *listing* is gated.
    const result = await loadTimelinePage("/event/hidden", anonymous, "");
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.photos.map((p) => p.path)).toEqual([
      "/event/hidden/p-hidden",
    ]);
  });

  it("carries each photo's own containing album's credits, contact and download settings", async () => {
    const result = await loadTimelinePage("/event", anonymous, "");
    if (result.kind !== "ok") throw new Error("expected ok");
    const p0 = result.album.photos.find((p) => p.path === "/event/p0");
    const p1 = result.album.photos.find((p) => p.path === "/event/day-1/p1");
    expect(p0?.credits?.map((c) => c.displayName)).toEqual(["Photographer A"]);
    expect(p0?.contactable).toBe(true);
    expect(p0?.isDownloadable).toBe(true);
    expect(p1?.credits?.map((c) => c.displayName)).toEqual(["Photographer B"]);
    expect(p1?.contactable).toBe(false);
    expect(p1?.isDownloadable).toBe(false);
  });

  it("reconstructs an ancestor's timeline from a deeper photo via an explicit ?timeline=<root>", async () => {
    const result = await loadTimelinePage(
      "/event/day-1/stage/p2",
      anonymous,
      "/event",
    );
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.album.path).toBe("/event");
    expect(result.photo?.path).toBe("/event/day-1/stage/p2");
    expect(result.album.photos.map((p) => p.path)).toContain("/event/p0");
  });

  it("never runs a timeline at the site root even when named explicitly", async () => {
    const path = "/event/day-1/stage/p2";
    expect(await loadTimelinePage(path, anonymous, "/")).toEqual(
      await loadGalleryPage(path, anonymous),
    );
  });

  it("falls back to the normal page when ?timeline names a root that does not contain the path", async () => {
    const path = "/event/day-1/p1";
    expect(await loadTimelinePage(path, anonymous, "/event/private")).toEqual(
      await loadGalleryPage(path, anonymous),
    );
  });
});
