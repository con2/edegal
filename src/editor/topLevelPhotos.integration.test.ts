import { beforeAll, describe, expect, it } from "vitest";

import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

import { moveTopLevelPhotosToPhotographerAlbums } from "./topLevelPhotos";

let rootId: string;
let creditedId: string;
let uncreditedId: string;
let termsId: string;
let photographerId: string;

async function addPhoto(albumId: string, albumPath: string, slug: string) {
  return db.orm.public.Photo.create({
    albumId,
    slug,
    path: `${albumPath}/${slug}`,
    title: slug,
  });
}

beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  rootId = root.id;
  const terms = await db.orm.public.Terms.create({
    title: "CC BY",
    text: "share",
  });
  termsId = terms.id;
  const photographer = await db.orm.public.Photographer.create({
    slug: "ansel",
    displayName: "Ansel Adams",
  });
  photographerId = photographer.id;

  const credited = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "larp",
    path: "/larp",
    title: "The Larp",
    body: "About the larp",
    termsId: terms.id,
    eventDate: "2026-05-01",
  });
  creditedId = credited.id;
  await db.orm.public.AlbumCredit.create({
    albumId: credited.id,
    photographerId: photographer.id,
    isCopyright: true,
  });
  const first = await addPhoto(credited.id, "/larp", "img-1");
  await addPhoto(credited.id, "/larp", "img-2");
  await db.orm.public.Album.where({ id: credited.id }).update({
    thumbnailPhotoId: first.id,
    thumbnailIsAuto: false,
  });

  const uncredited = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "orphan",
    path: "/orphan",
    title: "Orphan",
  });
  uncreditedId = uncredited.id;
  await addPhoto(uncredited.id, "/orphan", "img-1");

  const tidy = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "tidy",
    path: "/tidy",
    title: "Tidy",
  });
  const tidyChild = await db.orm.public.Album.create({
    parentId: tidy.id,
    slug: "ansel-adams",
    path: "/tidy/ansel-adams",
    title: "Ansel Adams",
  });
  await addPhoto(tidyChild.id, "/tidy/ansel-adams", "img-1");
});

describe("moveTopLevelPhotosToPhotographerAlbums", () => {
  it("dry run reports without writing", async () => {
    const lines: string[] = [];
    const tally = await moveTopLevelPhotosToPhotographerAlbums({
      apply: false,
      log: (l) => lines.push(l),
    });
    expect(tally).toEqual({
      albumsInspected: 2,
      albumsMoved: 1,
      photosMoved: 2,
      albumsWithoutCredits: 1,
      albumsWithPathTaken: 0,
    });
    expect(lines.some((l) => l.startsWith("warning: /orphan"))).toBe(true);
    expect(
      await db.orm.public.Album.where({ path: "/larp/ansel-adams" }).first(),
    ).toBeNull();
    expect(
      (await db.orm.public.Photo.where({ albumId: creditedId }).all()).length,
    ).toBe(2);
  });

  it("moves photos, credits and terms into a photographer album", async () => {
    const tally = await moveTopLevelPhotosToPhotographerAlbums({ apply: true });
    expect(tally.albumsMoved).toBe(1);

    const child = await db.orm.public.Album.where({ path: "/larp/ansel-adams" })
      .include("photos")
      .include("credits")
      .first();
    expect(child).not.toBeNull();
    expect(child!.parentId).toBe(creditedId);
    expect(child!.title).toBe("Ansel Adams");
    expect(child!.termsId).toBe(termsId);
    expect(child!.eventDate).toBe("2026-05-01");
    expect(child!.credits.map((c) => c.photographerId)).toEqual([
      photographerId,
    ]);
    expect(child!.photos.map((p) => p.path).sort()).toEqual([
      "/larp/ansel-adams/img-1",
      "/larp/ansel-adams/img-2",
    ]);
    // Derivatives keep the storage location the original was written under.
    expect(child!.photos.map((p) => p.mediaKeyBase).sort()).toEqual([
      "/larp/img-1",
      "/larp/img-2",
    ]);
    const chosen = child!.photos.find((p) => p.slug === "img-1")!;
    expect(child!.thumbnailPhotoId).toBe(chosen.id);
    expect(child!.thumbnailIsAuto).toBe(false);

    const parent = await db.orm.public.Album.where({ id: creditedId })
      .include("photos")
      .include("credits")
      .first();
    expect(parent!.photos).toEqual([]);
    expect(parent!.credits).toEqual([]);
    expect(parent!.termsId).toBeNull();
    expect(parent!.body).toBe("About the larp");
    expect(parent!.thumbnailPhotoId).toBe(chosen.id);

    const redirect = await db.orm.public.Redirect.where({
      fromPath: "/larp/img-2",
    }).first();
    expect(redirect?.toPath).toBe("/larp/ansel-adams/img-2");

    expect(
      (await db.orm.public.Photo.where({ albumId: uncreditedId }).all()).length,
    ).toBe(1);
  });

  it("is a no-op on a second run", async () => {
    const tally = await moveTopLevelPhotosToPhotographerAlbums({ apply: true });
    expect(tally.albumsMoved).toBe(0);
    expect(tally.albumsWithoutCredits).toBe(1);
    expect(
      (await db.orm.public.Album.where({ parentId: rootId }).all()).length,
    ).toBe(3);
  });

  it("warns when the photographer album already exists", async () => {
    const tidy = await db.orm.public.Album.where({ path: "/tidy" }).first();
    await db.orm.public.AlbumCredit.create({
      albumId: tidy!.id,
      photographerId,
    });
    await addPhoto(tidy!.id, "/tidy", "stray");
    const lines: string[] = [];
    const tally = await moveTopLevelPhotosToPhotographerAlbums({
      apply: true,
      log: (l) => lines.push(l),
    });
    expect(tally.albumsWithPathTaken).toBe(1);
    expect(tally.albumsMoved).toBe(0);
    expect(
      lines.some((l) => l.includes("/tidy/ansel-adams already exists")),
    ).toBe(true);
    expect(
      await db.orm.public.Photo.where({ path: "/tidy/stray" }).first(),
    ).not.toBeNull();
  });
});
