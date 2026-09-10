import sanitizeHtml from "sanitize-html";

import { legacyAdminUrl } from "@/config";
import type {
  AlbumPageVM,
  CreditVM,
  Crumb,
  PhotoVM,
  SubalbumVM,
  Visibility,
} from "@/gallery/types";
import { pathPrefixes } from "@/gallery/paths";
import { titleInPhotographerContext } from "@/gallery/titles";

import { buildLegacyMediaSet, legacyOriginal } from "./media";
import type {
  LegacyAncestorRow,
  LegacyPhotographerRow,
  LegacySubalbumRow,
} from "./rows";
import {
  legacyAlbumById,
  legacyAncestors,
  legacyPhotographerAlbums,
  legacyPhotographerById,
  legacyPhotographerTiles,
  legacyPictures,
  legacySeriesAlbums,
  legacySeriesById,
  legacySubalbums,
} from "./sql";

export function legacyVisibility(
  isPublic: boolean,
  isVisible: boolean,
): Visibility {
  if (!isPublic) return "private";
  return isVisible ? "public" : "hidden";
}

const socialLinks: [
  keyof LegacyPhotographerRow,
  string,
  (handle: string) => string,
][] = [
  ["homepage_url", "Homepage", (url) => url],
  ["twitter_handle", "Twitter", (h) => `https://twitter.com/${h}`],
  ["instagram_handle", "Instagram", (h) => `https://www.instagram.com/${h}`],
  ["threads_handle", "Threads", (h) => `https://www.threads.net/@${h}`],
  ["facebook_handle", "Facebook", (h) => `https://www.facebook.com/${h}`],
  ["flickr_handle", "Flickr", (h) => `https://www.flickr.com/photos/${h}`],
  ["bluesky_handle", "Bluesky", (h) => `https://bsky.app/profile/${h}`],
];

export function toCredit(
  photographer: LegacyPhotographerRow,
  isCopyright: boolean,
  description: string,
): CreditVM {
  return {
    displayName: photographer.display_name,
    path: `/photographers/${photographer.slug}`,
    isCopyright,
    description,
    links: socialLinks
      .filter(([field]) => photographer[field])
      .map(([field, title, href]) => ({
        title,
        href: href(String(photographer[field])),
      })),
  };
}

/** Legacy bodies are prose-editor HTML; strip anything the editor would not have produced. */
function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
  });
}

function toSubalbum(row: LegacySubalbumRow): SubalbumVM | null {
  const thumbnail = buildLegacyMediaSet(row.cover_media, "thumbnail");
  // Django lists only albums whose cover picture has a thumbnail.
  if (!thumbnail) return null;
  return {
    path: row.path,
    title: row.title,
    date: row.date,
    visibility: legacyVisibility(row.is_public, row.is_visible),
    thumbnail,
    externalUrl: row.redirect_url.includes("://") ? row.redirect_url : null,
    ownerId: null,
  };
}

function toSubalbums(rows: LegacySubalbumRow[]): SubalbumVM[] {
  return rows.map(toSubalbum).filter((s): s is SubalbumVM => s !== null);
}

/**
 * Ancestors are exactly the path prefixes. A series the album (or an ancestor) belongs to is
 * spliced in after the root crumb, as Django does.
 */
function buildBreadcrumb(
  ancestors: LegacyAncestorRow[],
  series: Crumb | null,
): Crumb[] {
  const crumbs: Crumb[] = ancestors.map(({ path, title }) => ({ path, title }));
  if (series) crumbs.splice(1, 0, series);
  return crumbs;
}

export async function loadLegacyAlbum(
  albumId: number,
): Promise<AlbumPageVM | null> {
  const album = await legacyAlbumById(albumId);
  if (!album) return null;

  const [ancestors, subalbums, pictures] = await Promise.all([
    legacyAncestors(pathPrefixes(album.path)),
    legacySubalbums(album.id),
    legacyPictures(album.id),
  ]);

  const seriesId =
    album.series_id ?? ancestors.find((a) => a.series_id)?.series_id ?? null;
  let series: Crumb | null = album.series_path
    ? { path: album.series_path, title: album.series_title ?? "" }
    : null;
  if (!series && seriesId) {
    const row = await legacySeriesById(seriesId);
    series = row ? { path: row.path, title: row.title } : null;
  }

  const photos = pictures.flatMap((p): PhotoVM[] => {
    const thumbnail = buildLegacyMediaSet(p.media, "thumbnail");
    if (!thumbnail) return [];
    return [
      {
        id: String(p.id),
        path: p.path,
        title: p.title,
        visibility: p.is_public ? "public" : "private",
        takenAt: p.taken_at,
        thumbnail,
        preview: buildLegacyMediaSet(p.media, "preview"),
        original: legacyOriginal(p.media),
      },
    ];
  });

  const credits: CreditVM[] = [];
  if (album.photographer) credits.push(toCredit(album.photographer, true, ""));
  if (album.director) credits.push(toCredit(album.director, false, "director"));

  return {
    source: "legacy",
    kind: "album",
    id: String(album.id),
    parentId: album.parent_id === null ? null : String(album.parent_id),
    path: album.path,
    title: album.title,
    description: album.description,
    body: { kind: "html", text: album.body ? sanitizeBody(album.body) : "" },
    cover: null,
    date: album.date,
    layout: album.layout === "yearly" ? "yearly" : "simple",
    visibility: legacyVisibility(album.is_public, album.is_visible),
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: album.is_downloadable,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: buildBreadcrumb(ancestors, series),
    subalbums: toSubalbums(subalbums),
    photos,
    credits,
    terms: album.terms
      ? { kind: "text", text: album.terms.text, url: album.terms.url }
      : null,
    previousInSeries: album.previous_path
      ? { path: album.previous_path, title: album.previous_title ?? "" }
      : null,
    nextInSeries: album.next_path
      ? { path: album.next_path, title: album.next_title ?? "" }
      : null,
    redirectUrl: album.redirect_url || null,
    legacyAdminUrl: `${legacyAdminUrl}edegal/album/${album.id}/change/`,
  };
}

/** A series lists its member albums like an album lists subalbums; it has no pictures of its own. */
export async function loadLegacySeries(
  seriesId: number,
): Promise<AlbumPageVM | null> {
  const series = await legacySeriesById(seriesId);
  if (!series) return null;
  const [root, albums] = await Promise.all([
    legacyAncestors(["/"]),
    legacySeriesAlbums(series.id),
  ]);
  return {
    source: "legacy",
    kind: "series",
    id: `series:${series.id}`,
    parentId: null,
    path: series.path,
    title: series.title,
    description: series.description,
    body: { kind: "html", text: series.body ? sanitizeBody(series.body) : "" },
    cover: null,
    date: null,
    layout: "simple",
    visibility: legacyVisibility(series.is_public, series.is_visible),
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: root.map(({ path, title }) => ({ path, title })),
    subalbums: toSubalbums(albums),
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: `${legacyAdminUrl}edegal/series/${series.id}/change/`,
  };
}

/** Tiles for the /photographers index: legacy photographers with a cover picture. */
export async function legacyPhotographerSubalbums(): Promise<SubalbumVM[]> {
  const rows = await legacyPhotographerTiles();
  return rows.flatMap((row) => {
    const thumbnail = buildLegacyMediaSet(row.cover_media, "thumbnail");
    if (!thumbnail) return [];
    return [
      {
        path: `/photographers/${row.slug}`,
        title: row.display_name,
        date: null,
        visibility: "public" as const,
        thumbnail,
        externalUrl: null,
        ownerId: null,
      },
    ];
  });
}

/** A legacy photographer's page: profile plus their albums titled in photographer context. */
export async function loadLegacyPhotographerPage(
  id: number,
): Promise<AlbumPageVM | null> {
  const photographer = await legacyPhotographerById(id);
  if (!photographer) return null;
  const [albums, root] = await Promise.all([
    legacyPhotographerAlbums(photographer.id),
    legacyAncestors(["/"]),
  ]);
  const prefixes = new Set<string>();
  for (const album of albums)
    for (const prefix of pathPrefixes(album.path))
      if (prefix !== "/") prefixes.add(prefix);
  const ancestors = new Map(
    (await legacyAncestors([...prefixes])).map((a) => [a.path, a.title]),
  );

  const subalbums = toSubalbums(albums).map((tile) => ({
    ...tile,
    title: titleInPhotographerContext(
      pathPrefixes(tile.path)
        .filter((p) => p !== "/")
        .map((p) => ancestors.get(p) ?? ""),
      tile.title,
      photographer.display_name,
    ),
  }));

  return {
    source: "legacy",
    kind: "photographer",
    id: `photographer:${photographer.id}`,
    parentId: null,
    path: `/photographers/${photographer.slug}`,
    title: photographer.display_name,
    description: "",
    body: {
      kind: "html",
      text: photographer.body ? sanitizeBody(photographer.body) : "",
    },
    cover: buildLegacyMediaSet(photographer.cover_media, "thumbnail"),
    date: null,
    layout: "yearly",
    visibility: "public",
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: [
      ...root.map(({ path, title }) => ({ path, title })),
      { path: "/photographers", title: "Photographers" },
    ],
    subalbums,
    photos: [],
    credits: [toCredit(photographer, true, "")],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: `${legacyAdminUrl}edegal/photographer/${photographer.id}/change/`,
  };
}
