const pathPattern = /^\/[a-z0-9/-]*$/;

/** Ancestor paths of `path`, root first, excluding `path` itself. `/a/b` → `["/", "/a"]`. */
export function pathPrefixes(path: string): string[] {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  return [
    "/",
    ...segments
      .slice(0, -1)
      .map((_, i) => "/" + segments.slice(0, i + 1).join("/")),
  ];
}

export interface NormalizedPath {
  path: string;
  /** True when the URL carried the legacy `/timeline` suffix. */
  timeline: boolean;
}

/**
 * Turns catch-all segments into a canonical gallery path. Returns null for anything outside the
 * legacy path charset so bots probing for `.php` never reach the database.
 */
export function normalizeGalleryPath(
  segments: string[] | undefined,
): NormalizedPath | null {
  const joined = "/" + (segments ?? []).map(decodeURIComponentSafe).join("/");
  const path = joined
    .replace(/\/+/g, "/")
    .replace(/(.)\/$/, "$1")
    .toLowerCase();
  if (!pathPattern.test(path)) return null;
  if (path.endsWith("/timeline") && path !== "/timeline") {
    return { path: path.slice(0, -"/timeline".length), timeline: true };
  }
  return { path, timeline: false };
}

function decodeURIComponentSafe(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** True when `path` is `ancestorPath` itself or lies below it; the root "/" contains everything. */
export function isAncestorOrSelf(ancestorPath: string, path: string): boolean {
  if (ancestorPath === path || ancestorPath === "/") return true;
  return path.startsWith(`${ancestorPath}/`);
}
