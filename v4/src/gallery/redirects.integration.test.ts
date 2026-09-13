import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { moveAlbumPath } from "@/editor/albums";
import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { clearRedirect, resolveRedirect } from "./redirects";

const anonymous = { kind: "anonymous" } as const;
let con: { id: string };

/** Root > "con" > "sat" with one photo; "flickr" is a redirect-only album beside "con". */
beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_series, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_user cascade",
  );
  await pool.query(
    "truncate edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_series cascade",
  );
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  con = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "con",
    path: "/con",
    title: "Con",
  });
  const sat = await db.orm.public.Album.create({
    parentId: con.id,
    slug: "sat",
    path: "/con/sat",
    title: "Sat",
  });
  await db.orm.public.Photo.create({
    albumId: sat.id,
    slug: "dsc-1",
    path: "/con/sat/dsc-1",
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "flickr",
    path: "/flickr",
    title: "Flickr set",
    redirectUrl: "https://flickr.com/set",
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "secret",
    path: "/secret",
    title: "Secret",
    visibility: "private",
    redirectUrl: "https://example.com/secret",
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("redirects", () => {
  it("records a move for the album, its subalbums and photos", async () => {
    await moveAlbumPath(con.id, "/con", "/con-2026");
    const rows = await db.orm.public.Redirect.all();
    expect(rows.map((r) => [r.fromPath, r.toPath]).sort()).toEqual([
      ["/con", "/con-2026"],
      ["/con/sat", "/con-2026/sat"],
      ["/con/sat/dsc-1", "/con-2026/sat/dsc-1"],
    ]);
    expect(await loadGalleryPage("/con/sat/dsc-1", anonymous)).toEqual({
      kind: "redirect",
      to: "/con-2026/sat/dsc-1",
    });
  });

  it("follows a redirecting ancestor for paths that were never recorded", async () => {
    expect(await resolveRedirect("/con/sat/dsc-9")).toBe("/con-2026/sat/dsc-9");
  });

  it("keeps chains one hop long after a second move", async () => {
    await moveAlbumPath(con.id, "/con-2026", "/con-final");
    const first = await db.orm.public.Redirect.where({
      fromPath: "/con/sat/dsc-1",
    }).first();
    expect(first?.toPath).toBe("/con-final/sat/dsc-1");
    expect(await resolveRedirect("/con-2026/sat")).toBe("/con-final/sat");
  });

  it("forgets a redirect when its path becomes real again", async () => {
    await clearRedirect("/con");
    expect(await resolveRedirect("/con")).toBeNull();
  });

  it("redirects an album with an external redirect URL, unless it is private", async () => {
    expect(await loadGalleryPage("/flickr", anonymous)).toEqual({
      kind: "redirect",
      to: "https://flickr.com/set",
    });
    expect(await loadGalleryPage("/flickr/anything", anonymous)).toEqual({
      kind: "redirect",
      to: "https://flickr.com/set",
    });
    expect((await loadGalleryPage("/secret", anonymous)).kind).toBe(
      "not-found",
    );
    expect((await loadGalleryPage("/secret/x", anonymous)).kind).toBe(
      "not-found",
    );
  });

  it("shows a redirect-only album as an external link tile in its parent", async () => {
    const result = await loadGalleryPage("/", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    const tile = result.album.subalbums.find((s) => s.path === "/flickr");
    expect(tile?.externalUrl).toBe("https://flickr.com/set");
  });
});
