import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { thumbnailTargets } from "./albums";

const owner: Viewer = {
  kind: "user",
  userId: "",
  name: "Owner",
  isPhotographer: true,
  isAdmin: false,
};
const other: Viewer = {
  kind: "user",
  userId: "",
  name: "Other",
  isPhotographer: true,
  isAdmin: false,
};
const admin: Viewer = {
  kind: "user",
  userId: "",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
};

let leaf: { id: string; path: string; ownerId: string | null; title: string };

/** Root > "Con" (owned by owner) > "Saturday" (open album, owned by other). */
beforeAll(async () => {
  await pool.query(`truncate v4_photo, v4_album, v4_user cascade`);
  const [ownerUser, otherUser] = await db.orm.public.User.createAll([
    { sub: "1", displayName: "Owner" },
    { sub: "2", displayName: "Other" },
  ]);
  owner.userId = ownerUser.id;
  other.userId = otherUser.id;
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const con = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "con",
    path: "/con",
    title: "Con",
    ownerId: ownerUser.id,
  });
  leaf = await db.orm.public.Album.create({
    parentId: con.id,
    slug: "sat",
    path: "/con/sat",
    title: "Saturday",
    ownerId: otherUser.id,
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("thumbnailTargets", () => {
  it("offers the photographer of a subalbum only their own album", async () => {
    expect((await thumbnailTargets(other, leaf)).map((t) => t.title)).toEqual([
      "Saturday",
    ]);
  });

  it("offers the parent's owner the parent but not the subalbum", async () => {
    expect(await thumbnailTargets(owner, leaf)).toEqual([
      { albumId: expect.any(String), title: "Con", isOwnAlbum: false },
    ]);
  });

  // The root has no tile anywhere, so it is never offered even to admins.
  it("offers admins every album below the root, nearest first", async () => {
    expect((await thumbnailTargets(admin, leaf)).map((t) => t.title)).toEqual([
      "Saturday",
      "Con",
    ]);
  });
});
