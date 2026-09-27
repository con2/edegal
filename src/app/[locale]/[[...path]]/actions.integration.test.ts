import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

vi.mock("@/gallery/viewer", () => ({
  getViewer: async () => ({
    kind: "user",
    userId: process.env.TEST_USER_ID,
    name: "Guest",
    isPhotographer: true,
    isAdmin: false,
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

const { createAlbum } = await import("./actions");
const { newAlbumDefaults } = await import("@/editor/formData");

let eventId: string;
let guestId: string;

beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade",
  );
  const owner = await db.orm.public.User.create({
    sub: "test:owner",
    displayName: "Owner",
  });
  const guest = await db.orm.public.User.create({
    sub: "test:guest",
    displayName: "Guest",
  });
  guestId = guest.id;
  process.env.TEST_USER_ID = guest.id;
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
    ownerId: owner.id,
    isOpenForSubalbums: true,
  });
  eventId = event.id;
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

function albumForm(title: string, credits: string): FormData {
  const form = new FormData();
  form.set("title", title);
  form.set("eventDate", "2026-09-27");
  form.set("visibility", "public");
  form.set("credits", credits);
  return form;
}

async function creditsOf(path: string) {
  const album = await db.orm.public.Album.where({ path })
    .include("credits")
    .first();
  return album!.credits.map((c) => c.photographerId);
}

describe("createAlbum under another photographer's open event", () => {
  it("saves an empty credit list when the creator left it empty", async () => {
    await expect(
      createAlbum("fi", eventId, albumForm("First", "[]")),
    ).rejects.toThrow("redirect:/event/first?success=albumSaved");
    expect(await creditsOf("/event/first")).toEqual([]);
  });

  it("saves the credits the form sent", async () => {
    const photographer = await db.orm.public.Photographer.create({
      slug: "guest",
      displayName: "Guest",
      userId: guestId,
    });
    const credits = JSON.stringify([
      { photographerId: photographer.id, isCopyright: true, description: "" },
    ]);
    await expect(
      createAlbum("fi", eventId, albumForm("Second", credits)),
    ).rejects.toThrow("redirect:/event/second?success=albumSaved");
    expect(await creditsOf("/event/second")).toEqual([photographer.id]);
  });
});

describe("newAlbumDefaults", () => {
  it("creates the profile of a first-time photographer so the form can credit them", async () => {
    const newcomer = await db.orm.public.User.create({
      sub: "test:newcomer",
      displayName: "New Comer",
    });
    const defaults = await newAlbumDefaults({
      kind: "user",
      userId: newcomer.id,
      name: "New Comer",
      isPhotographer: true,
      isAdmin: false,
    });
    const profile = await db.orm.public.Photographer.where({
      userId: newcomer.id,
    }).first();
    expect(profile?.slug).toBe("new-comer");
    expect(defaults.credits).toEqual([
      { photographerId: profile!.id, isCopyright: true, description: "" },
    ]);
  });
});
