import { slugifyDash } from "@con2/components/helpers";

import type { Viewer } from "@/gallery/viewer";
import { recordMove } from "@/gallery/redirects";
import { touchAlbum } from "@/gallery/touch";
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
  // Never derive anything from the email address; it is private.
  const displayName = user.displayName || "photographer";
  const taken = new Set(
    (await db.orm.public.Photographer.select("slug").all()).map((p) => p.slug),
  );
  return db.orm.public.Photographer.create({
    slug: uniqueSlug(slugifyDash(displayName) || "photographer", taken),
    displayName,
    email: user.email,
    userId: user.id,
  });
}

export class UserAlreadyLinkedError extends Error {}
export class DifferentUsersError extends Error {}

/** Connects, or with `userId: null` disconnects, a profile and a v4 account. Admin-only. */
export async function linkPhotographerToUser(
  photographerId: string,
  userId: string | null,
): Promise<void> {
  if (userId) {
    const owner = await db.orm.public.Photographer.where({ userId })
      .select("id")
      .first();
    if (owner && owner.id !== photographerId)
      throw new UserAlreadyLinkedError();
  }
  await db.orm.public.Photographer.where({ id: photographerId }).update({
    userId,
  });
}

/**
 * Users not yet linked to any profile whose email matches this one - offered as suggestions on
 * the admin edit form, never linked automatically.
 */
export async function findLinkCandidates(
  email: string,
): Promise<{ id: string; displayName: string; email: string }[]> {
  if (!email) return [];
  const linked = await db.orm.public.Photographer.where((p) =>
    p.userId.isNotNull(),
  )
    .select("userId")
    .all();
  const linkedUserIds = new Set(linked.map((p) => p.userId));
  const users = await db.orm.public.User.select(
    "id",
    "displayName",
    "email",
  ).all();
  return users.filter(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && !linkedUserIds.has(u.id),
  );
}

export interface MergeResult {
  affectedAlbumIds: string[];
  winnerSlug: string;
  loserSlug: string;
}

/**
 * Folds `loserId` into `winnerId`: credits and links move over (a credit on an album both hold
 * keeps the winner's own row), empty scalar fields are filled in from the loser, the loser's
 * slug starts redirecting to the winner's, and the loser row is deleted. Refuses when both are
 * already linked to different accounts - the admin unlinks one first.
 */
export async function mergePhotographers(
  winnerId: string,
  loserId: string,
): Promise<MergeResult> {
  if (winnerId === loserId)
    throw new Error("cannot merge a photographer into itself");
  const [winner, loser] = await Promise.all([
    db.orm.public.Photographer.where({ id: winnerId }).first(),
    db.orm.public.Photographer.where({ id: loserId }).first(),
  ]);
  if (!winner || !loser) throw new Error("photographer not found");
  if (winner.userId && loser.userId && winner.userId !== loser.userId)
    throw new DifferentUsersError();

  const affectedAlbumIds = new Set<string>();

  await db.transaction(async (tx) => {
    const [winnerCredits, loserCredits] = await Promise.all([
      tx.orm.public.AlbumCredit.where({ photographerId: winnerId }).all(),
      tx.orm.public.AlbumCredit.where({ photographerId: loserId }).all(),
    ]);
    const winnerCreditByAlbumId = new Map(
      winnerCredits.map((c) => [c.albumId, c]),
    );
    for (const credit of loserCredits) {
      affectedAlbumIds.add(credit.albumId);
      const existing = winnerCreditByAlbumId.get(credit.albumId);
      // The composite primary key includes photographerId, so a "move" is delete-and-create
      // rather than an update.
      await tx.orm.public.AlbumCredit.where({
        albumId: credit.albumId,
        photographerId: loserId,
      }).delete();
      if (existing) {
        await tx.orm.public.AlbumCredit.where({
          albumId: credit.albumId,
          photographerId: winnerId,
        }).update({ isCopyright: existing.isCopyright || credit.isCopyright });
      } else {
        await tx.orm.public.AlbumCredit.create({
          albumId: credit.albumId,
          photographerId: winnerId,
          isCopyright: credit.isCopyright,
          description: credit.description,
          ordering: credit.ordering,
        });
      }
    }

    const [winnerLinks, loserLinks] = await Promise.all([
      tx.orm.public.PhotographerLink.where({ photographerId: winnerId }).all(),
      tx.orm.public.PhotographerLink.where({ photographerId: loserId }).all(),
    ]);
    const winnerHrefs = new Set(winnerLinks.map((l) => l.href));
    let nextOrdering =
      winnerLinks.length > 0
        ? Math.max(...winnerLinks.map((l) => l.ordering)) + 1
        : 0;
    for (const link of loserLinks) {
      if (winnerHrefs.has(link.href)) continue;
      await tx.orm.public.PhotographerLink.create({
        photographerId: winnerId,
        href: link.href,
        title: link.title,
        ordering: nextOrdering++,
      });
    }

    // userId is unique, so the loser's must be cleared before the winner can take it - setting
    // both rows to the same value, even across two statements in one transaction, would violate
    // the constraint immediately rather than at commit.
    if (loser.userId && loser.userId !== winner.userId) {
      await tx.orm.public.Photographer.where({ id: loserId }).update({
        userId: null,
      });
    }

    await tx.orm.public.Photographer.where({ id: winnerId }).update({
      email: winner.email || loser.email,
      introduction: winner.introduction || loser.introduction,
      defaultTermsId: winner.defaultTermsId ?? loser.defaultTermsId,
      coverPhotoId: winner.coverPhotoId ?? loser.coverPhotoId,
      userId: winner.userId ?? loser.userId ?? null,
    });

    await recordMove(
      tx,
      `/photographers/${loser.slug}`,
      `/photographers/${winner.slug}`,
    );

    // Cascades the loser's remaining PhotographerLink rows (duplicates skipped above); its
    // AlbumCredit rows are already gone, which the Restrict foreign key would otherwise refuse.
    await tx.orm.public.Photographer.where({ id: loserId }).delete();
  });

  for (const albumId of affectedAlbumIds) await touchAlbum(albumId);

  return {
    affectedAlbumIds: [...affectedAlbumIds],
    winnerSlug: winner.slug,
    loserSlug: loser.slug,
  };
}
