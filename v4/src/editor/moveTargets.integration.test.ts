import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { moveTargets } from "./albums";

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

let con: { id: string; path: string };
let sat: { id: string; path: string };

/**
 * Root (unowned, closed) > "Con" (owner) > "Saturday" (other), and "Open event" (other, open
 * for subalbums) beside Con.
 */
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
  con = await db.orm.public.Album.create({
    parentId: root.id,
    slug: "con",
    path: "/con",
    title: "Con",
    ownerId: ownerUser.id,
  });
  sat = await db.orm.public.Album.create({
    parentId: con.id,
    slug: "sat",
    path: "/con/sat",
    title: "Saturday",
    ownerId: otherUser.id,
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "open",
    path: "/open",
    title: "Open event",
    ownerId: otherUser.id,
    isOpenForSubalbums: true,
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

const paths = (targets: { path: string }[]) => targets.map((t) => t.path);

describe("moveTargets", () => {
  it("never offers the album itself or its descendants", async () => {
    expect(paths(await moveTargets(admin, con))).toEqual(["/", "/open"]);
  });

  it("offers a photographer their own albums and open ones, not the closed root", async () => {
    expect(paths(await moveTargets(owner, con))).toEqual(["/open"]);
    expect(paths(await moveTargets(other, sat))).toEqual(["/open"]);
  });
});
