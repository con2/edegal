import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadGalleryPage } from "@/gallery/load";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { ensureRootAlbum } from "./root";

beforeAll(async () => {
  await pool.query(`truncate v4_photo, v4_album, v4_user cascade`);
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("ensureRootAlbum", () => {
  it("creates a default v4 root, once", async () => {
    await ensureRootAlbum();
    await ensureRootAlbum();
    const roots = await db.orm.public.Album.where({ path: "/" }).all();
    expect(roots.map((r) => [r.title, r.layout])).toEqual([
      ["Gallery", "simple"],
    ]);
  });

  it("serves the front page from the v4 root", async () => {
    const page = await loadGalleryPage("/", { kind: "anonymous" });
    expect(page.kind).toBe("ok");
    if (page.kind !== "ok") return;
    expect(page.album.body).toBe("");
  });
});
