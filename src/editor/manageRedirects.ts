import { db } from "@/prisma/db";

export interface RedirectListRow {
  fromPath: string;
  toPath: string;
  createdAt: string;
}

export async function listRedirectsForAdmin(): Promise<RedirectListRow[]> {
  return db.orm.public.Redirect.orderBy((r) => r.fromPath.asc()).all();
}

/**
 * An admin-authored mapping, replacing any existing one from the same path. Unlike `recordMove`
 * (see gallery/redirects.ts), this does not re-point other redirects that targeted `fromPath` -
 * it is a standalone mapping, not a record of content moving.
 */
export async function upsertRedirect(
  fromPath: string,
  toPath: string,
): Promise<void> {
  await db.orm.public.Redirect.upsert({
    create: { fromPath, toPath },
    update: { toPath },
    conflictOn: { fromPath },
  });
}

export async function deleteRedirect(fromPath: string): Promise<void> {
  await db.orm.public.Redirect.where({ fromPath }).deleteAndCount();
}
