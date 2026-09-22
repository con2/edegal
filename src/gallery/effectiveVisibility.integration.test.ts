import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { loadPhotographerPageBySlug } from "./photographers";
import { touchSubtree } from "./touch";
import { publicPhotoCount } from "./random";

const anonymous = { kind: "anonymous" } as const;
const admin: Viewer & { kind: "user" } = {
  kind: "user",
  userId: "",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
};

async function jpegMedia(photoId: string, base: string) {
  await db.orm.public.Media.createAll([
    {
      photoId,
      role: "original",
      format: "jpeg",
      width: 1200,
      height: 800,
      storageKey: `pictures${base}.jpeg`,
    },
    {
      photoId,
      role: "thumbnail",
      format: "jpeg",
      width: 360,
      height: 240,
      storageKey: `thumbnails${base}.jpeg`,
    },
  ]);
}

/**
 * root > embargo (hidden) > run (public, credited to Alice, in series "camp", one photo);
 * root > vault (private) > open (public); root > free (public, credited to Alice).
 */
beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_series, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const user = await db.orm.public.User.create({
    sub: "alice",
    displayName: "Alice",
  });
  admin.userId = user.id;
  const alice = await db.orm.public.Photographer.create({
    userId: user.id,
    slug: "alice",
    displayName: "Alice",
  });
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const series = await db.orm.public.Series.create({
    slug: "camp",
    path: "/camp",
    title: "Camp",
  });
  const embargo = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "embargo",
    path: "/embargo",
    title: "Embargo",
    visibility: "hidden",
  });
  const run = await db.orm.public.Album.create({
    parentId: embargo.id,
    slug: "run",
    path: "/embargo/run",
    title: "Run",
    seriesId: series.id,
    eventDate: "2026-05-01",
  });
  const vault = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "vault",
    path: "/vault",
    title: "Vault",
    visibility: "private",
  });
  await db.orm.public.Album.create({
    parentId: vault.id,
    slug: "open",
    path: "/vault/open",
    title: "Open",
  });
  const free = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "free",
    path: "/free",
    title: "Free",
    eventDate: "2026-04-01",
  });
  for (const [album, name] of [
    [run, "run"],
    [free, "free"],
  ] as const) {
    const photo = await db.orm.public.Photo.create({
      albumId: album.id,
      slug: "p",
      path: `${album.path}/p`,
      title: "P",
    });
    await jpegMedia(photo.id, `${album.path}/p`);
    await db.orm.public.Album.where({ id: album.id }).update({
      thumbnailPhotoId: photo.id,
    });
    await db.orm.public.AlbumCredit.create({
      albumId: album.id,
      photographerId: alice.id,
      isCopyright: true,
      description: name,
    });
  }
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

async function page(path: string, viewer: typeof anonymous | typeof admin) {
  const result = await loadGalleryPage(path, viewer);
  if (result.kind !== "ok") throw new Error(`${path}: ${result.kind}`);
  return result.album;
}

describe("effective visibility", () => {
  it("lists a public child inside its hidden parent but marks it hidden site-wide", async () => {
    const embargo = await page("/embargo", anonymous);
    expect(embargo.subalbums.map((s) => s.path)).toEqual(["/embargo/run"]);
    const run = await page("/embargo/run", anonymous);
    expect(run.visibility).toBe("public");
    expect(run.effectiveVisibility).toBe("hidden");
  });

  it("keeps embargoed albums off photographer pages until the parent is public", async () => {
    const alice = await loadPhotographerPageBySlug("alice");
    const forVisitors = (await import("./visibility")).applyVisibility(
      alice!,
      anonymous,
    );
    expect(forVisitors?.subalbums.map((s) => s.path)).toEqual(["/free"]);
    // Admins still see it, marked hidden.
    const forAdmin = (await import("./visibility")).applyVisibility(
      alice!,
      admin,
    );
    expect(forAdmin?.subalbums.map((s) => [s.path, s.visibility])).toEqual([
      ["/embargo/run", "hidden"],
      ["/free", "public"],
    ]);
  });

  it("keeps embargoed members out of series listings for visitors", async () => {
    const camp = await page("/camp", anonymous);
    expect(camp.subalbums).toEqual([]);
    const asAdmin = await page("/camp", admin);
    expect(asAdmin.subalbums.map((s) => s.path)).toEqual(["/embargo/run"]);
  });

  it("does not sample embargoed photos for /random", async () => {
    expect(await publicPhotoCount()).toBe(1);
  });

  it("closes a public album under a private parent to visitors", async () => {
    expect((await loadGalleryPage("/vault/open", anonymous)).kind).toBe(
      "not-found",
    );
    expect((await page("/vault/open", admin)).effectiveVisibility).toBe(
      "private",
    );
  });

  it("releases everything when the parent turns public and its subtree is touched", async () => {
    await db.orm.public.Album.where({ path: "/embargo" }).update({
      visibility: "public",
    });
    await touchSubtree("/embargo");
    expect((await page("/embargo/run", anonymous)).effectiveVisibility).toBe(
      "public",
    );
    const camp = await page("/camp", anonymous);
    expect(camp.subalbums.map((s) => s.path)).toEqual(["/embargo/run"]);
    expect(await publicPhotoCount()).toBe(2);
  });
});
