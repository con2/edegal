import { mostRestrictive } from "@/gallery/access";
import { pathPrefixes } from "@/gallery/paths";
import type { Visibility } from "@/gallery/types";
import { db } from "@/prisma/db";

/** Effective visibility of each v4 album path, from one query over the paths and their ancestors. */
export async function effectiveVisibilities(
  paths: string[],
): Promise<Map<string, Visibility>> {
  const wanted = new Set<string>();
  for (const path of paths) {
    wanted.add(path);
    for (const prefix of pathPrefixes(path)) wanted.add(prefix);
  }
  const rows =
    wanted.size > 0
      ? await db.orm.public.Album.where((a) => a.path.in([...wanted]))
          .select("path", "visibility")
          .all()
      : [];
  const own = new Map(rows.map((a) => [a.path, a.visibility]));
  return new Map(
    paths.map((path) => [
      path,
      mostRestrictive(
        [path, ...pathPrefixes(path)].flatMap((p) => {
          const v = own.get(p);
          return v ? [v] : [];
        }),
      ),
    ]),
  );
}

/** SQL fragment: true when no ancestor of album `alias` is non-public. */
export function v4AncestorsPublicSql(alias: string): string {
  return `not exists (select 1 from v4_album anc where anc.visibility <> 'public' and ${alias}.path like anc.path || '/%')`;
}
