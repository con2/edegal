import { db } from "@/prisma/db";

export interface UserListRow {
  id: string;
  displayName: string;
  email: string;
  linkedPhotographer: { id: string; slug: string; displayName: string } | null;
}

/** Every account that has ever signed in through Kompassi OIDC, read-only: nothing here is edited. */
export async function listUsersForAdmin(): Promise<UserListRow[]> {
  const [users, photographers] = await Promise.all([
    db.orm.public.User.select("id", "displayName", "email").all(),
    db.orm.public.Photographer.select(
      "id",
      "slug",
      "displayName",
      "userId",
    ).all(),
  ]);
  const photographerByUserId = new Map(
    photographers
      .filter((p) => p.userId !== null)
      .map((p) => [p.userId as string, p]),
  );
  return users
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      linkedPhotographer: photographerByUserId.get(u.id) ?? null,
    }))
    .sort((a, b) =>
      (a.displayName || a.email).localeCompare(b.displayName || b.email, "fi"),
    );
}
