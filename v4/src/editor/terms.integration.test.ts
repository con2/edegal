import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Viewer } from "@/gallery/viewer";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { usableTermsId } from "./albums";

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

let own: string;
let shared: string;
let foreign: string;

beforeAll(async () => {
  await pool.query(`truncate v4_terms, v4_user cascade`);
  const [ownerUser, otherUser] = await db.orm.public.User.createAll([
    { sub: "1", displayName: "Owner" },
    { sub: "2", displayName: "Other" },
  ]);
  owner.userId = ownerUser.id;
  other.userId = otherUser.id;
  own = (
    await db.orm.public.Terms.create({
      title: "Own",
      text: "x",
      url: "",
      ownerId: ownerUser.id,
    })
  ).id;
  shared = (
    await db.orm.public.Terms.create({ title: "Shared", text: "x", url: "" })
  ).id;
  foreign = (
    await db.orm.public.Terms.create({
      title: "Foreign",
      text: "x",
      url: "",
      ownerId: otherUser.id,
    })
  ).id;
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("usableTermsId", () => {
  it("accepts the user's own and shared terms, and nothing for an empty choice", async () => {
    expect(await usableTermsId(owner, own)).toBe(own);
    expect(await usableTermsId(owner, shared)).toBe(shared);
    expect(await usableTermsId(owner, "")).toBeNull();
  });

  // The form never offers these, so reaching here means a forged request.
  it("rejects another user's terms and unknown ids, but lets admins use any", async () => {
    await expect(usableTermsId(owner, foreign)).rejects.toThrow();
    await expect(
      usableTermsId(owner, "00000000-0000-7000-8000-000000000000"),
    ).rejects.toThrow();
    expect(await usableTermsId(admin, foreign)).toBe(foreign);
  });
});
