import type { Visibility } from "@/gallery/types";
import { db } from "@/prisma/db";

import { findLinkCandidates } from "./photographers";

export interface PhotographerListRow {
  id: string;
  slug: string;
  displayName: string;
  visibility: Visibility;
  linkedUser: { id: string; displayName: string; email: string } | null;
  creditCount: number;
  /** Offered as a one-click link on the list when it is the profile's only match. */
  soleCandidate: { id: string; displayName: string; email: string } | null;
}

/** Every profile for the admin list, unlinked ones first so the migration backlog is visible. */
export async function listPhotographersForAdmin(): Promise<
  PhotographerListRow[]
> {
  const [photographers, users] = await Promise.all([
    db.orm.public.Photographer.select(
      "id",
      "slug",
      "displayName",
      "visibility",
      "email",
      "userId",
    )
      .include("credits", (c) => c.select("albumId"))
      .orderBy((p) => p.displayName.asc())
      .all(),
    db.orm.public.User.select("id", "displayName", "email").all(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));

  const rows = await Promise.all(
    photographers.map(async (p) => {
      const candidates = p.userId ? [] : await findLinkCandidates(p.email);
      return {
        id: p.id,
        slug: p.slug,
        displayName: p.displayName,
        visibility: p.visibility,
        linkedUser: p.userId ? (userById.get(p.userId) ?? null) : null,
        creditCount: p.credits.length,
        soleCandidate: candidates.length === 1 ? candidates[0] : null,
      };
    }),
  );

  return rows.sort((a, b) => {
    if (!!a.linkedUser !== !!b.linkedUser) return a.linkedUser ? 1 : -1;
    return a.displayName.localeCompare(b.displayName, "fi");
  });
}

export interface PhotographerEditValues {
  displayName: string;
  slug: string;
  visibility: Visibility;
  email: string;
  introduction: string;
  links: { title: string; href: string }[];
  defaultTermsId: string;
  userId: string;
}

export interface PhotographerEditOptions {
  terms: { id: string; title: string }[];
  /** Every user, with a note when one is already linked to a different profile. */
  users: { id: string; label: string; linkedElsewhere: string | null }[];
  candidates: { id: string; displayName: string; email: string }[];
  mergeTargets: { id: string; label: string }[];
}

export async function existingPhotographerEditValues(
  photographerId: string,
): Promise<PhotographerEditValues | null> {
  const photographer = await db.orm.public.Photographer.where({
    id: photographerId,
  })
    .include("links", (l) => l.orderBy((x) => x.ordering.asc()))
    .first();
  if (!photographer) return null;
  return {
    displayName: photographer.displayName,
    slug: photographer.slug,
    visibility: photographer.visibility,
    email: photographer.email,
    introduction: photographer.introduction,
    links: photographer.links.map(({ title, href }) => ({ title, href })),
    defaultTermsId: photographer.defaultTermsId ?? "",
    userId: photographer.userId ?? "",
  };
}

export async function photographerEditOptions(
  photographerId: string,
): Promise<PhotographerEditOptions> {
  const [terms, users, photographers, candidates] = await Promise.all([
    // Admins may set any terms as a profile's default, not only their own.
    db.orm.public.Terms.select("id", "title")
      .orderBy((t) => t.title.asc())
      .all(),
    db.orm.public.User.select("id", "displayName", "email")
      .orderBy((u) => u.displayName.asc())
      .all(),
    db.orm.public.Photographer.select("id", "slug", "displayName", "userId")
      .orderBy((p) => p.displayName.asc())
      .all(),
    db.orm.public.Photographer.where({ id: photographerId })
      .select("email")
      .first()
      .then((p) => (p ? findLinkCandidates(p.email) : [])),
  ]);
  const linkedElsewhereBy = new Map(
    photographers
      .filter((p) => p.userId && p.id !== photographerId)
      .map((p) => [p.userId as string, p.displayName]),
  );
  return {
    terms: terms.map(({ id, title }) => ({ id, title })),
    users: users.map((u) => ({
      id: u.id,
      label: u.displayName ? `${u.displayName} (${u.email})` : u.email,
      linkedElsewhere: linkedElsewhereBy.get(u.id) ?? null,
    })),
    candidates,
    mergeTargets: photographers
      .filter((p) => p.id !== photographerId)
      .map((p) => ({
        id: p.id,
        label: p.userId
          ? `${p.displayName} (/${p.slug})`
          : `${p.displayName} (/${p.slug}) — not linked`,
      })),
  };
}
