import Album from '../models/Album';
import Breadcrumb from '../models/Breadcrumb';
import Picture from '../models/Picture';
import { TranslationFunction } from '../translations';

/**
 * Transforms album.breadcrumb for visual use.
 */
export function getFullBreadcrumb(album: Album, picture?: Picture, startAt = 0): Breadcrumb[] {
  // startAt=1: Breadcrumb bar omits name of gallery because it is in app bar.
  // startAt=0= Page title includes name of gallery.
  const breadcrumb = album.breadcrumb.slice(startAt);

  // album.breadcrumb does not include current album but it is desired in visual breadcrumbs
  const { path, title } = album;
  breadcrumb.push({ path, title });

  // when in picture view, include picture title in breadcrumb
  if (picture) {
    const { path, title } = picture;
    breadcrumb.push({ path, title });
  }

  return breadcrumb;
}

/// Separates breadcrumbs in page title and breadcrumb bar
export const breadcrumbSeparator = ' » ';

/**
 * Some breadcrumb elements are translated in a special fashion.
 */
export function getBreadcrumbTitle(
  breadcrumb: Breadcrumb,
  t: TranslationFunction<{ photographers: string; timeline: string }>
) {
  if (breadcrumb.path === '/photographers') {
    return t(r => r.photographers);
  } else if (breadcrumb.path.endsWith('/timeline')) {
    return t(r => r.timeline);
  } else {
    return breadcrumb.title;
  }
}

/**
 * Renders a string suitable for use in `document.title`.
 */
export function getDocumentTitle(
  t: TranslationFunction<{ photographers: string; timeline: string }>,
  album: Album,
  picture?: Picture
): string {
  const fullBreadcrumb = getFullBreadcrumb(album, picture, 0);
  return fullBreadcrumb.map(crumb => getBreadcrumbTitle(crumb, t)).join(breadcrumbSeparator);
}
