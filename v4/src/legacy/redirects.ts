import { legacyAlbumsForRedirectWalk } from "./sql";

/**
 * Port of Django's Album.resolve_upstream_redirects: when a path has no album, walk its ancestors
 * from the deepest up. An ancestor with an external redirect wins outright; one with a local
 * redirect has the remaining segments re-attached to its target.
 */
export async function resolveLegacyUpstreamRedirect(
  path: string,
): Promise<string | null> {
  const segments = path.split("/").filter(Boolean);
  const ancestorPaths = segments
    .slice(0, -1)
    .map((_, i) => "/" + segments.slice(0, i + 1).join("/"));
  const redirects = await legacyAlbumsForRedirectWalk(ancestorPaths);
  if (redirects.length === 0) return null;
  const byPath = new Map(redirects.map((r) => [r.path, r]));

  for (let depth = ancestorPaths.length - 1; depth >= 0; depth--) {
    const ancestor = byPath.get(ancestorPaths[depth]);
    if (!ancestor) continue;
    if (ancestor.redirect_url.includes("://")) return ancestor.redirect_url;
    if (ancestor.redirect_url.startsWith("/")) {
      const rest = segments.slice(depth + 1).join("/");
      return `${ancestor.redirect_url.replace(/\/+$/, "")}/${rest}`;
    }
  }
  return null;
}
