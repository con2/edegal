import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { presentAlbumPage } from "./load";
import {
  loadPhotographerPageBySlug,
  loadPhotographersIndex,
} from "./photographers";

const anonymousViewer = { kind: "anonymous" } as const;

async function insertFixtures() {
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
  await db.orm.public.Photographer.where({ id: photographer.id }).update({
    coverPhotoId: photo.id,
  });

  // Public with no cover photo: nothing to guess from, so the index must show an empty tile
  // rather than excluding them.
  await db.orm.public.Photographer.create({
    slug: "emptypublic",
    displayName: "Empty Public",
  });

  await db.orm.public.Photographer.create({
    slug: "hiddenone",
    displayName: "Hidden One",
    visibility: "hidden",
  });

  const privateOwner = await db.orm.public.User.create({
    sub: "kompassi:private-owner",
    displayName: "Private Owner",
  });
  await db.orm.public.Photographer.create({
    slug: "privateone",
    displayName: "Private One",
    visibility: "private",
    userId: privateOwner.id,
  });
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
  await insertFixtures();
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("loadPhotographersIndex", () => {
  // "Hidden One" and "Private One" are excluded by their own visibility.
  it("tiles every public photographer once, sorted by name, with an empty tile for one with no cover photo", async () => {
    const index = await loadPhotographersIndex();
    expect(index.kind).toBe("photographers");
    expect(index.body).toBe("");
    expect(index.subalbums.map((s) => [s.path, s.title])).toEqual([
      ["/photographers/emptypublic", "Empty Public"],
      ["/photographers/shared", "Shared Shooter"],
    ]);
    const emptyTile = index.subalbums.find(
      (s) => s.path === "/photographers/emptypublic",
    );
    expect(emptyTile?.thumbnail).toBeNull();
  });
});

describe("loadPhotographerPageBySlug", () => {
  it("renders a photographer's own albums, introduction, and credited cover", async () => {
    const page = await loadPhotographerPageBySlug("shared");
    expect(page?.kind).toBe("photographer");
    expect(page?.body).toBe("New intro");
    expect(page?.cover?.media.fallback.src).toContain("img-1.jpeg");
    expect(page?.cover?.path).toBe("/con-2026/shared/img-1");
    expect(page?.cover?.credits).toEqual([
      { displayName: "Shared Shooter", path: "/photographers/shared" },
    ]);
    expect(page?.credits[0]?.links.map((l) => l.href)).toEqual([
      "https://shared.example",
    ]);
    expect(page?.subalbums.map((s) => [s.path, s.title])).toEqual([
      ["/con-2026/shared", "Con 2026 » Friday"],
    ]);
  });

  it("shows no cover when the chosen photo is in a non-public album", async () => {
    const album = await db.orm.public.Album.where({
      path: "/con-2026/shared",
    }).first();
    await db.orm.public.Album.where({ id: album!.id }).update({
      visibility: "private",
    });
    try {
      expect((await loadPhotographerPageBySlug("shared"))?.cover).toBeNull();
      const tile = (await loadPhotographersIndex()).subalbums.find(
        (s) => s.path === "/photographers/shared",
      );
      expect(tile?.thumbnail).toBeNull();
    } finally {
      await db.orm.public.Album.where({ id: album!.id }).update({
        visibility: "public",
      });
    }
  });

  it("returns null for slugs no photographer has", async () => {
    expect(await loadPhotographerPageBySlug("nobody")).toBeNull();
  });

  it("carries a hidden profile's own visibility and owner, still reachable by slug", async () => {
    const page = await loadPhotographerPageBySlug("hiddenone");
    expect(page?.visibility).toBe("hidden");
    expect(page?.effectiveVisibility).toBe("hidden");
  });

  it("carries a private profile's visibility and owner so presentAlbumPage 404s it for anyone else", async () => {
    const page = await loadPhotographerPageBySlug("privateone");
    expect(page?.visibility).toBe("private");
    const owner = await db.orm.public.User.where({
      sub: "kompassi:private-owner",
    }).first();

    expect(
      presentAlbumPage(
        page!,
        anonymousViewer,
        "/photographers/privateone",
        null,
      ).kind,
    ).toBe("not-found");
    expect(
      presentAlbumPage(
        page!,
        {
          kind: "user",
          userId: owner!.id,
          name: "",
          isPhotographer: true,
          isAdmin: false,
        },
        "/photographers/privateone",
        null,
      ).kind,
    ).toBe("ok");
    expect(
      presentAlbumPage(
        page!,
        {
          kind: "user",
          userId: "someone-else",
          name: "",
          isPhotographer: true,
          isAdmin: false,
        },
        "/photographers/privateone",
        null,
      ).kind,
    ).toBe("not-found");
  });
});
