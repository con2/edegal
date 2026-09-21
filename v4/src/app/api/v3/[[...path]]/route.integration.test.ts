import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

// Avoids pulling in next-auth (and its own "next/server" resolution, which fails outside a real
// Next.js runtime) just to resolve an always-anonymous viewer for this route.
vi.mock("@/gallery/viewer", () => ({
  getViewer: async () => ({ kind: "anonymous" as const }),
}));

const { GET } = await import("./route");

function request(path: string): Request {
  return new Request(`http://test/api/v3${path}`);
}

function params(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

let eventPath: string;
let subalbumPath: string;

beforeAll(async () => {
  await pool.query(
    `truncate v4_redirect, v4_media, v4_photo, v4_album cascade`,
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
  eventPath = event.path;
  const sub = await db.orm.public.Album.create({
    parentId: event.id,
    slug: "sub",
    path: "/event/sub",
    title: "Sub",
  });
  subalbumPath = sub.path;
  const photo = await db.orm.public.Photo.create({
    albumId: sub.id,
    slug: "photo",
    path: "/event/sub/photo",
    title: "Photo",
  });
  await db.orm.public.Media.createAll([
    {
      photoId: photo.id,
      role: "thumbnail",
      format: "jpeg",
      width: 360,
      height: 240,
      storageKey: "thumbnails/event/sub/photo.jpeg",
    },
    {
      photoId: photo.id,
      role: "preview",
      format: "jpeg",
      width: 2000,
      height: 1333,
      storageKey: "previews/event/sub/photo.jpeg",
    },
  ]);
  await db.orm.public.Album.where({ id: sub.id }).update({
    thumbnailPhotoId: photo.id,
  });
  await db.orm.public.Redirect.create({
    fromPath: "/old-event",
    toPath: "/event",
  });
  await db.orm.public.Redirect.create({
    fromPath: "/moved-away",
    toPath: "https://example.com/elsewhere",
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("GET /api/v3/[[...path]]", () => {
  it("returns an album's subalbums with both thumbnail and preview media", async () => {
    const response = await GET(request("/event"), params(["event"]));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      path: eventPath,
      title: "Event",
      subalbums: [
        {
          path: subalbumPath,
          title: "Sub",
          thumbnail: {
            src: "/media/thumbnails/event/sub/photo.jpeg",
            width: 360,
            height: 240,
          },
          preview: {
            src: "/media/previews/event/sub/photo.jpeg",
            width: 2000,
            height: 1333,
          },
        },
      ],
    });
  });

  it("reports an internal redirect as a 200 body with redirect_url, like legacy's own v3 API", async () => {
    const response = await GET(request("/old-event"), params(["old-event"]));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      path: "/old-event",
      title: "",
      subalbums: [],
      redirect_url: "/event",
    });
  });

  it("passes an external redirect target through verbatim, unprefixed", async () => {
    const response = await GET(request("/moved-away"), params(["moved-away"]));
    expect(response.status).toBe(200);
    expect((await response.json()).redirect_url).toBe(
      "https://example.com/elsewhere",
    );
  });

  it("404s a path nothing resolves to", async () => {
    const response = await GET(request("/nope"), params(["nope"]));
    expect(response.status).toBe(404);
  });
});
