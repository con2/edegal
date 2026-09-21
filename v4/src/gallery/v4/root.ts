import { db } from "@/prisma/db";

/**
 * Every site needs a v4 root album: it is where photographers create their first albums and
 * where the front page's listing lives. The row is created on demand if missing.
 */
export async function ensureRootAlbum(): Promise<void> {
  const existing = await db.orm.public.Album.where({ path: "/" })
    .select("id")
    .first();
  if (existing) return;
  await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Gallery",
    layout: "simple",
  });
}
