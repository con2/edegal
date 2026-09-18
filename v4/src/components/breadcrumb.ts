import type { ClientAlbumPage, Crumb, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

/** Separates crumbs in the page title and the breadcrumb bar. */
export const breadcrumbSeparator = " » ";

/**
 * The view-model's breadcrumb holds ancestors only; the visual breadcrumb appends the album and,
 * in the picture view, the picture. `startAt = 1` omits the gallery name shown in the app bar.
 */
export function fullBreadcrumb(
  album: ClientAlbumPage,
  photo: PhotoVM | null,
  startAt = 0,
): Crumb[] {
  const crumbs = album.breadcrumb.slice(startAt);
  crumbs.push({ path: album.path, title: album.title });
  // The timeline crumb's title is resolved from messages by crumbTitle, like /photographers.
  if (album.kind === "timeline")
    crumbs.push({ path: `${album.path}?timeline`, title: "" });
  if (photo) crumbs.push({ path: photo.path, title: photo.title });
  return crumbs;
}

export function crumbTitle(
  crumb: Crumb,
  messages: Translations["BreadcrumbBar"],
): string {
  if (crumb.path === "/photographers") return messages.photographers;
  if (crumb.path.endsWith("?timeline")) return messages.timeline;
  return crumb.title;
}

export function documentTitle(
  album: ClientAlbumPage,
  photo: PhotoVM | null,
  messages: Translations["BreadcrumbBar"],
): string {
  return fullBreadcrumb(album, photo, 0)
    .map((c) => crumbTitle(c, messages))
    .join(breadcrumbSeparator);
}
