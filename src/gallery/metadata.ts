import type { Metadata } from "next";

import { documentTitle } from "@/components/breadcrumb";
import { getTranslations } from "@/translations";

import { copyrightStatement } from "./credit";
import type { ClientAlbumPage, GalleryPageResult } from "./types";

/**
 * The Open Graph image of an album page with no photo of its own selected: a subalbum's thumbnail
 * where there is one. The front page gets none: its first tile is merely the newest event, an
 * arbitrary choice for the site as a whole.
 */
function albumImage(album: ClientAlbumPage) {
  if (album.path === "/") return undefined;
  if (album.kind === "photographer") return album.cover?.media.fallback;
  if (album.kind === "photographers") return undefined;
  return album.subalbums[0]?.thumbnail?.fallback;
}

export function galleryMetadata(
  locale: string,
  result: GalleryPageResult,
): Metadata {
  if (result.kind !== "ok") return {};
  const t = getTranslations(locale);
  const { album, photo } = result;
  // The page's own photo, else the album or timeline's first (chronologically first, for a
  // timeline) - the same one its Open Graph image falls back to below. `null` for photographer,
  // series and photographers-index pages, which carry no photos of their own at this level.
  const representative = photo ?? album.photos[0] ?? null;
  const image =
    photo?.preview?.fallback ??
    photo?.thumbnail.fallback ??
    albumImage(album) ??
    representative?.preview?.fallback ??
    representative?.thumbnail.fallback;
  return {
    title: documentTitle(album, photo, t.BreadcrumbBar),
    // An album's own description, when the photographer wrote one, beats the fallbacks below.
    // The copyright statement (also shown at the foot of the picture view) says who actually
    // made the photo, and reads better in a link preview than the album title alone, which tends
    // to cut off a long photographer name.
    description:
      album.description ||
      copyrightStatement(representative, album) ||
      album.title,
    robots:
      album.effectiveVisibility === "public" && album.kind !== "timeline"
        ? undefined
        : { index: false, follow: false },
    openGraph: image
      ? {
          images: [
            { url: image.src, width: image.width, height: image.height },
          ],
        }
      : undefined,
  };
}
