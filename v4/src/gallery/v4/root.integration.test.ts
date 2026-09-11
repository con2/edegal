import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadGalleryPage } from "@/gallery/load";
import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { ensureRootAlbum } from "./root";

/** A database like a production restore: the legacy root exists, no v4 album does. */
beforeAll(async () => {
  await pool.query(`truncate v4_photo, v4_album, v4_user cascade`);
  await pool.query(`truncate edegal_album cascade`);
  await pool.query(`
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id)
    values (1, '', '/', 'Larppikuvat.fi', 'Photos of larps', '<p>Welcome</p>', true, true, true, '', 'yearly', 1, 2, 1, 0, null, null)
  `);
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("ensureRootAlbum", () => {
  it("creates the v4 root from the legacy root, once", async () => {
    await ensureRootAlbum();
    await ensureRootAlbum();
    const roots = await db.orm.public.Album.where({ path: "/" }).all();
    expect(roots.map((r) => [r.title, r.layout])).toEqual([
      ["Larppikuvat.fi", "yearly"],
    ]);
  });

  it("serves the legacy body on the front page until the v4 root has one", async () => {
    const page = await loadGalleryPage("/", { kind: "anonymous" });
    expect(page.kind).toBe("ok");
    if (page.kind !== "ok") return;
    expect(page.album.source).toBe("v4");
    expect(page.album.body).toEqual({ kind: "html", text: "<p>Welcome</p>" });
  });
});
