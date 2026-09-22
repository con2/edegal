import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { mediaStorage } from "@/media/storage";
import { db } from "@/prisma/db";

import {
  PathTakenError,
  assertPathFree,
  deleteAlbumSubtree,
  moveAlbumPath,
  sortPhotos,
  wouldCreateRedirectLoop,
} from "./albums";

let eventId: string;
let dayId: string;

beforeAll(async () => {
  await pool.query(
    "truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const event = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "event",
    path: "/event",
    title: "Event",
  });
  const day = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "day",
    path: "/event/day",
    title: "Day",
  });
  eventId = event.id;
  dayId = day.id;
  const names = ["IMG_9998", "IMG_9999", "IMG_1", "IMG_2"];
  const takenAt = [
    "2026-09-05T10:00:00Z",
    "2026-09-05T11:00:00Z",
    "2026-09-05T12:00:00Z",
    "2026-09-05T13:00:00Z",
  ];
  for (const [i, name] of names.entries()) {
    const photo = await db.orm.public.Photo.create({
      albumId: day.id,
      slug: name.toLowerCase().replace("_", "-"),
      path: `/event/day/${name.toLowerCase().replace("_", "-")}`,
      title: name,
      takenAt: takenAt[i],
    });
    const key = `pictures/event/day/${photo.slug}.jpeg`;
    await mediaStorage.put(key, Buffer.from("x"), "image/jpeg");
    await db.orm.public.Media.create({
      photoId: photo.id,
      role: "original",
      format: "jpeg",
      width: 1,
      height: 1,
      storageKey: key,
    });
  }
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

async function photoOrder(albumId: string) {
  const photos = await db.orm.public.Photo.where({ albumId })
    .orderBy([
      (p) => p.ordering.asc(),
      (p) => p.takenAt.asc(),
      (p) => p.slug.asc(),
    ])
    .select("slug")
    .all();
  return photos.map((p) => p.slug);
}

describe("album helpers", () => {
  it("refuses paths taken by other albums but allows an album's own path", async () => {
    await expect(assertPathFree("/event/day")).rejects.toBeInstanceOf(
      PathTakenError,
    );
    await expect(assertPathFree("/event/day", dayId)).resolves.toBeUndefined();
    await expect(assertPathFree("/brand-new")).resolves.toBeUndefined();
  });

  it("detects a redirect that would point back to the album itself, directly or via a chain", async () => {
    expect(await wouldCreateRedirectLoop("/event", "")).toBe(false);
    expect(await wouldCreateRedirectLoop("/event", "https://x.example/")).toBe(
      false,
    );
    expect(await wouldCreateRedirectLoop("/event", "/event")).toBe(true);
    // /event/day has no redirect of its own, so pointing at it is fine...
    expect(await wouldCreateRedirectLoop("/event", "/event/day")).toBe(false);
    // ...until /event/day itself redirects back to /event.
    await db.orm.public.Album.where({ id: dayId }).update({
      redirectUrl: "/event",
    });
    expect(await wouldCreateRedirectLoop("/event", "/event/day")).toBe(true);
    await db.orm.public.Album.where({ id: dayId }).update({ redirectUrl: "" });
  });

  it("sorts by filename number numerically and restores capture-time order", async () => {
    expect(await photoOrder(dayId)).toEqual([
      "img-9998",
      "img-9999",
      "img-1",
      "img-2",
    ]);
    await sortPhotos(dayId, "filename");
    expect(await photoOrder(dayId)).toEqual([
      "img-1",
      "img-2",
      "img-9998",
      "img-9999",
    ]);
    await sortPhotos(dayId, "takenAt");
    expect(await photoOrder(dayId)).toEqual([
      "img-9998",
      "img-9999",
      "img-1",
      "img-2",
    ]);
  });

  it("moves an album with its descendants and photos to a new path", async () => {
    await moveAlbumPath(eventId, "/event", "/tapahtuma");
    const paths = (await db.orm.public.Album.select("path").all())
      .map((a) => a.path)
      .sort();
    expect(paths).toEqual(["/", "/tapahtuma", "/tapahtuma/day"]);
    const photoPaths = (await db.orm.public.Photo.select("path").all()).map(
      (p) => p.path,
    );
    expect(photoPaths.every((p) => p.startsWith("/tapahtuma/day/"))).toBe(true);
    await moveAlbumPath(eventId, "/tapahtuma", "/event");
  });

  it("deletes a subtree including files", async () => {
    const key = "pictures/event/day/img-1.jpeg";
    expect(await mediaStorage.stat(key)).not.toBeNull();
    const counts = await deleteAlbumSubtree(eventId, "/event");
    expect(counts).toEqual({ albums: 2, photos: 4 });
    expect(await db.orm.public.Album.select("path").all()).toHaveLength(1);
    expect(await mediaStorage.stat(key)).toBeNull();
  });
});
