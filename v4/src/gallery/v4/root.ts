import { legacyEnabled } from "@/config";
import { legacyAlbumByPath } from "@/legacy/sql";
import { db } from "@/prisma/db";

/**
 * Every site needs a v4 root album: it is where photographers create their first albums and
 * the front page merges legacy content into it. A database restored from a legacy dump has
 * only the legacy root, so the row is created on demand, titled like the legacy root. The body
 * stays empty and the front page falls back to the legacy root's body until someone edits it.
 */
export async function ensureRootAlbum(): Promise<void> {
  const existing = await db.orm.public.Album.where({ path: "/" })
    .select("id")
    .first();
  if (existing) return;
  const legacyRoot = legacyEnabled ? await legacyAlbumByPath("/") : null;
  await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: legacyRoot?.title ?? "Gallery",
  });
}
