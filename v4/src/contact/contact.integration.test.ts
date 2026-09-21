import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { contactRecipients } from "./contact";

const anonymous: Viewer = { kind: "anonymous" };
const admin: Viewer = {
  kind: "user",
  userId: "",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
};

/**
 * Root > "Con" credited to Alice (has email) and Bob (no email), a photo in it, and a hidden
 * "Secret" credited to Alice.
 */
beforeAll(async () => {
  await pool.query(
    "truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer, v4_user cascade",
  );
  const user = await db.orm.public.User.create({
    sub: "c:1",
    displayName: "Admin",
  });
  admin.userId = user.id;
  const [alice, bob] = await db.orm.public.Photographer.createAll([
    { slug: "alice", displayName: "Alice", email: "alice@example.com" },
    { slug: "bob", displayName: "Bob", email: "" },
  ]);
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Test Gallery",
  });
  const con = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "con",
    path: "/con",
    title: "Con",
  });
  await db.orm.public.AlbumCredit.createAll([
    {
      albumId: con.id,
      photographerId: alice.id,
      isCopyright: true,
      ordering: 0,
    },
    { albumId: con.id, photographerId: bob.id, isCopyright: true, ordering: 1 },
  ]);
  const photo = await db.orm.public.Photo.create({
    albumId: con.id,
    slug: "p1",
    path: "/con/p1",
    title: "P1",
  });
  await db.orm.public.Media.create({
    photoId: photo.id,
    role: "thumbnail",
    format: "jpeg",
    width: 360,
    height: 240,
    storageKey: "thumbnails/con/p1.jpeg",
    byteSize: 1,
  });
  const bobOnly = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "bob",
    path: "/bob",
    title: "Bob only",
  });
  await db.orm.public.AlbumCredit.create({
    albumId: bobOnly.id,
    photographerId: bob.id,
    isCopyright: true,
    ordering: 0,
  });
  const secret = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "secret",
    path: "/secret",
    title: "Secret",
    visibility: "private",
  });
  await db.orm.public.AlbumCredit.create({
    albumId: secret.id,
    photographerId: alice.id,
    isCopyright: true,
    ordering: 0,
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("contactRecipients", () => {
  it("addresses the copyright holders who gave an address, for the album and its photos", async () => {
    expect(await contactRecipients("/con", anonymous)).toEqual({
      siteName: "Test Gallery",
      to: ["alice@example.com"],
    });
    expect(await contactRecipients("/con/p1", anonymous)).toEqual({
      siteName: "Test Gallery",
      to: ["alice@example.com"],
    });
  });

  it("has nobody to write to when no holder gave an address", async () => {
    expect(await contactRecipients("/bob", anonymous)).toBeNull();
  });

  it("does not reveal albums the viewer may not see", async () => {
    expect(await contactRecipients("/secret", anonymous)).toBeNull();
    expect(await contactRecipients("/secret", admin)).toEqual({
      siteName: "Test Gallery",
      to: ["alice@example.com"],
    });
  });

  it("has nobody to write to for an unknown path", async () => {
    expect(await contactRecipients("/nowhere", anonymous)).toBeNull();
  });
});
