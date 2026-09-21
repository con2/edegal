import { db } from "@/prisma/db";

import { effectiveVisibilities } from "./effective";

export interface RedirectSource {
  path: string;
  /** An external URL, or a gallery path. */
  target: string;
}

/**
 * Port of Django's Album.resolve_upstream_redirects over any set of redirecting ancestors: the
 * deepest one wins; an external target is returned as is, a local one gets the segments below
 * the ancestor re-attached.
 */
export function walkRedirects(
  path: string,
  sources: RedirectSource[],
): string | null {
  const segments = path.split("/").filter(Boolean);
  const byPath = new Map(sources.map((s) => [s.path, s.target]));
  for (let depth = segments.length - 1; depth >= 1; depth--) {
    const ancestorPath = "/" + segments.slice(0, depth).join("/");
    const target = byPath.get(ancestorPath);
    if (!target) continue;
    if (target.includes("://")) return target;
    // A local target must be an absolute gallery path; one without a leading slash (bad legacy
    // data) would build a relative Location that keeps re-resolving under the same prefix.
    if (!target.startsWith("/")) continue;
    const rest = segments.slice(depth).join("/");
    return `${target.replace(/\/+$/, "")}/${rest}`;
  }
  return null;
}

/**
 * Where a path that resolves to nothing should go: an exact record of a rename or move, else a
 * redirecting ancestor (a v4 album's redirect URL or a recorded move of an ancestor). Null when
 * the path is simply unknown.
 */
export async function resolveRedirect(path: string): Promise<string | null> {
  const exact = await db.orm.public.Redirect.where({ fromPath: path }).first();
  if (exact) return exact.toPath;

  const segments = path.split("/").filter(Boolean);
  const ancestorPaths = segments
    .slice(0, -1)
    .map((_, i) => "/" + segments.slice(0, i + 1).join("/"));
  if (ancestorPaths.length === 0) return null;

  const [albums, moves] = await Promise.all([
    db.orm.public.Album.where((a) => a.path.in(ancestorPaths))
      .select("path", "redirectUrl", "visibility")
      .all(),
    db.orm.public.Redirect.where((r) => r.fromPath.in(ancestorPaths))
      .select("fromPath", "toPath")
      .all(),
  ]);
  // Effective, not the album's own visibility: a public-looking album under a private parent must
  // not leak its redirect's existence and destination just because its own flag says "public".
  const effective = await effectiveVisibilities(albums.map((a) => a.path));
  // A redirect reveals the album exists and where it went; private albums keep that to themselves.
  const sources: RedirectSource[] = [
    ...albums
      .filter(
        (a) =>
          a.redirectUrl !== "" &&
          (effective.get(a.path) ?? a.visibility) !== "private",
      )
      .map((a) => ({ path: a.path, target: a.redirectUrl })),
    ...moves.map((m) => ({ path: m.fromPath, target: m.toPath })),
  ];
  return walkRedirects(path, sources);
}

/**
 * Records that everything at `oldPath` now lives at `newPath`, and re-points earlier records
 * that led to the old location so chains stay one hop. Runs inside the caller's transaction.
 */
export async function recordMove(
  tx: Pick<typeof db, "orm">,
  oldPath: string,
  newPath: string,
): Promise<void> {
  const [exact, below] = await Promise.all([
    tx.orm.public.Redirect.where({ toPath: oldPath })
      .select("fromPath", "toPath")
      .all(),
    tx.orm.public.Redirect.where((r) => r.toPath.like(`${oldPath}/%`))
      .select("fromPath", "toPath")
      .all(),
  ]);
  for (const r of [...exact, ...below])
    await tx.orm.public.Redirect.where({ fromPath: r.fromPath }).update({
      toPath: newPath + r.toPath.slice(oldPath.length),
    });
  await tx.orm.public.Redirect.where({ fromPath: newPath }).deleteAndCount();
  await tx.orm.public.Redirect.create({ fromPath: oldPath, toPath: newPath });
}

/** A path that becomes real again needs no redirect record. */
export async function clearRedirect(path: string): Promise<void> {
  await db.orm.public.Redirect.where({ fromPath: path }).deleteAndCount();
}
