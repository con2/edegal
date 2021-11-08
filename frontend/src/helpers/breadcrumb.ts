import Album from '../models/Album';
import Breadcrumb from '../models/Breadcrumb';
import Picture from '../models/Picture';
import { TranslationFunction } from '../translations';

export function getFullBreadcrumb(album: Album, picture?: Picture, startAt = 0): Breadcrumb[] {
  const { path, title } = album;
  const breadcrumb = album.breadcrumb.slice(startAt).concat([{ path, title }]);

  if (picture) {
    const { path, title } = album;
    breadcrumb.push({ path, title });
  }

  return breadcrumb;
}

export const breadcrumbSeparator = ' » ';

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

export function getDocumentTitle(
  t: TranslationFunction<{ photographers: string; timeline: string }>,
  album: Album,
  picture?: Picture
): string {
  const fullBreadcrumb = getFullBreadcrumb(album, picture, 0);
  return fullBreadcrumb.map(crumb => getBreadcrumbTitle(crumb, t)).join(breadcrumbSeparator);
}
