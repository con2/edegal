import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { importFlickrAlbum } from "./importFlickr";

const albumUrl =
  "https://www.flickr.com/photos/someone/albums/72177720312345678";
const imageUrl = "https://live.staticflickr.com/65535/54321_abcdef_b.jpg";

const html = `<html><head>
<meta property="og:title" content="Korpkv&#228;det 14.3.2026 (LARP)">
<meta property="og:description" content="Explore this photo album by Someone on Flickr!">
<meta property="og:url" content="${albumUrl}">
<meta property="og:image" content="${imageUrl}">
</head></html>`;

/** Serves the album page and its cover; anything else is a 404. */
async function fakeFetch(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);
  if (url === albumUrl)
    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html" },
    });
  if (url === imageUrl) {
    const jpeg = await sharp({
      create: { width: 90, height: 60, channels: 3, background: "#808080" },
    })
      .jpeg()
      .toBuffer();
    return new Response(new Uint8Array(jpeg), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });
  }
  return new Response("not found", { status: 404 });
}

const photographer: Viewer & { kind: "user" } = {
  kind: "user",
  userId: "",
  name: "Importer",
  isPhotographer: true,
  isAdmin: false,
};
let parent: { id: string; path: string };

beforeAll(async () => {
  await pool.query(
    "truncate v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_redirect, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const user = await db.orm.public.User.create({
    sub: "flickr:1",
    displayName: "Importer",
  });
  photographer.userId = user.id;
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  parent = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "larps",
    path: "/larps",
    title: "Larps",
    ownerId: user.id,
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("importFlickrAlbum", () => {
  it("creates a redirecting album from the og tags with the cover as its photo", async () => {
    const result = await importFlickrAlbum(
      photographer,
      parent,
      { flickrUrl: albumUrl, title: "", visibility: "public" },
      fakeFetch as typeof fetch,
    );
    expect(result).toEqual({
      ok: true,
      path: "/larps/korpkvadet",
      coverImported: true,
    });

    const album = await db.orm.public.Album.where({ path: "/larps/korpkvadet" })
      .include("credits")
      .include("photos", (p) => p.include("media"))
      .first();
    expect(album).toMatchObject({
      title: "Korpkvädet",
      eventDate: "2026-03-14",
      body: "",
      redirectUrl: albumUrl,
      isDownloadable: false,
      ownerId: photographer.userId,
    });
    expect(album?.credits.map((c) => c.isCopyright)).toEqual([true]);
    expect(album?.photos).toHaveLength(1);
    expect(album?.photos[0]).toMatchObject({
      path: "/larps/korpkvadet/54321-abcdef-b",
    });
    expect(album?.photos[0].media.map((m) => m.role)).toEqual(["original"]);
    expect(
      await db.orm.public.MediaJob.where({
        photoId: album!.photos[0].id,
      }).first(),
    ).toMatchObject({
      status: "pending",
    });
  });

  it("refuses a second import to the same path", async () => {
    expect(
      await importFlickrAlbum(
        photographer,
        parent,
        { flickrUrl: albumUrl, title: "", visibility: "public" },
        fakeFetch as typeof fetch,
      ),
    ).toEqual({ ok: false, error: "pathTaken" });
  });

  it("uses the given title instead of Flickr's and survives a missing cover", async () => {
    const noCover = async (input: RequestInfo | URL) =>
      String(input) === imageUrl
        ? new Response("gone", { status: 410 })
        : fakeFetch(input);
    const result = await importFlickrAlbum(
      photographer,
      parent,
      { flickrUrl: albumUrl, title: "Run 3", visibility: "hidden" },
      noCover as typeof fetch,
    );
    expect(result).toEqual({
      ok: true,
      path: "/larps/run-3",
      coverImported: false,
    });
    const album = await db.orm.public.Album.where({ path: "/larps/run-3" })
      .include("photos")
      .first();
    expect(album).toMatchObject({ title: "Run 3", visibility: "hidden" });
    expect(album?.photos).toHaveLength(0);
  });

  it("reports unreachable pages and pages without album tags", async () => {
    expect(
      await importFlickrAlbum(
        photographer,
        parent,
        {
          flickrUrl: "https://www.flickr.com/photos/someone/albums/0",
          title: "",
          visibility: "public",
        },
        fakeFetch as typeof fetch,
      ),
    ).toEqual({ ok: false, error: "flickrUnreachable" });
    const plain = async () =>
      new Response("<html><head><title>x</title></head></html>", {
        status: 200,
      });
    expect(
      await importFlickrAlbum(
        photographer,
        parent,
        { flickrUrl: albumUrl, title: "", visibility: "public" },
        plain as typeof fetch,
      ),
    ).toEqual({ ok: false, error: "flickrNotAlbum" });
  });
});
