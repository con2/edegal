import { slugifyDash } from "@con2/components/helpers";

import type { Viewer } from "@/gallery/viewer";
import { uniqueSlug } from "@/media/naming";
import { db } from "@/prisma/db";

/** The signed-in user's Photographer row, created on first use so they can be credited. */
export async function ensurePhotographer(viewer: Viewer & { kind: "user" }) {
  const existing = await db.orm.public.Photographer.where({
    userId: viewer.userId,
  }).first();
  if (existing) return existing;
  const user = await db.orm.public.User.where({ id: viewer.userId }).first();
  if (!user) throw new Error("user not found");
  const taken = new Set(
    (await db.orm.public.Photographer.select("slug").all()).map((p) => p.slug),
  );
  return db.orm.public.Photographer.create({
    slug: uniqueSlug(slugifyDash(user.username) || "photographer", taken),
    displayName: user.displayName || user.username,
    email: user.email,
    userId: user.id,
  });
}
