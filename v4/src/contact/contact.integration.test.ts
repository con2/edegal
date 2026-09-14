import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/legacy/pool";
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
 * v4: Root > "Con" credited to Alice (has email) and Bob (no email), a photo in it, and a hidden
 * "Secret" credited to Alice. Legacy: root > "Old" by Carol (has email) and "Older" by Dan (none).
 */
beforeAll(async () => {
  await pool.query(
    "truncate v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer, v4_user, edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_series, edegal_photographer cascade",
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

  await pool.query(`
    insert into edegal_photographer (id, slug, display_name, email, body, homepage_url, twitter_handle, instagram_handle, facebook_handle, flickr_handle, bluesky_handle, threads_handle)
    values (1, 'carol', 'Carol', 'carol@example.com', '', '', '', '', '', '', '', ''),
           (2, 'dan', 'Dan', '', '', '', '', '', '', '', '', '');
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id, photographer_id)
    values
      (1, '', '/', 'Legacy root', '', '', true, true, true, '', 'simple', 1, 6, 1, 0, null, null, null),
      (2, 'old', '/old', 'Old', '', '', true, true, true, '', 'simple', 2, 3, 1, 1, '2020-01-01', 1, 1),
      (3, 'older', '/older', 'Older', '', '', true, true, true, '', 'simple', 4, 5, 1, 1, '2019-01-01', 1, 2);
  `);
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

  it("finds the legacy photographer's address", async () => {
    expect(await contactRecipients("/old", anonymous)).toEqual({
      siteName: "Legacy root",
      to: ["carol@example.com"],
    });
    expect(await contactRecipients("/older", anonymous)).toBeNull();
    expect(await contactRecipients("/nowhere", anonymous)).toBeNull();
  });
});
