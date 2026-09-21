import { legacyEnabled } from "@/config";
import {
  legacyHtmlBody,
  legacyPhotographerSubalbums,
  loadLegacyPhotographerPage,
} from "@/legacy/provider";
import { legacyAlbumByPath, legacyPhotographerIdBySlug } from "@/legacy/sql";
import { compareEventDateDesc } from "@/lib/time";
import { db } from "@/prisma/db";

import { pathPrefixes } from "./paths";
import { titleInPhotographerContext } from "./titles";
import type { AlbumPageVM, CoverVM, SubalbumVM } from "./types";
import { effectiveVisibilities } from "./v4/effective";
import { buildMediaSet } from "./v4/provider";

const photographersPath = "/photographers";

async function rootCrumb() {
  const root = await db.orm.public.Album.where({ path: "/" })
    .select("path", "title")
    .first();
  return root ? [{ path: root.path, title: root.title }] : [];
}

/**
 * Public v4 photographers, one tile each: their own profile photo, or an empty tile when they
 * have none - never guessed from a credited album, so an empty tile means exactly what it shows.
 */
async function v4PhotographerSubalbums(): Promise<SubalbumVM[]> {
  const photographers = await db.orm.public.Photographer.where({
    visibility: "public",
  })
    .include("coverPhoto", (p) => p.include("media").include("album"))
    .orderBy((p) => p.displayName.asc())
    .all();
  const effective = await effectiveVisibilities(
    photographers.flatMap((p) =>
      p.coverPhoto ? [p.coverPhoto.album.path] : [],
    ),
  );
  return photographers.map((photographer) => {
    const thumbnail =
      photographer.coverPhoto &&
      effective.get(photographer.coverPhoto.album.path) === "public"
        ? buildMediaSet(photographer.coverPhoto.media, "thumbnail")
        : null;
    return {
      path: `${photographersPath}/${photographer.slug}`,
      title: photographer.displayName,
      date: null,
      visibility: "public" as const,
      thumbnail,
      externalUrl: null,
      ownerId: null,
    };
  });
}

/** The /photographers index: v4 and legacy photographers merged by slug (v4 wins), sorted by name. */
export async function loadPhotographersIndex(): Promise<AlbumPageVM> {
  const [v4, legacy, root, v4Intro, legacyIntro] = await Promise.all([
    v4PhotographerSubalbums(),
    legacyEnabled ? legacyPhotographerSubalbums() : Promise.resolve([]),
    rootCrumb(),
    db.orm.public.Album.where({ path: photographersPath })
      .select("body")
      .first(),
    legacyEnabled
      ? legacyAlbumByPath(photographersPath)
      : Promise.resolve(null),
  ]);
  // Merged by path (one tile per photographer, never two): a v4 tile with its own thumbnail
  // wins outright; otherwise the legacy tile fills in if it has one, so a v4 profile whose own
  // cover photo is momentarily unusable (e.g. its album went private) still shows something
  // real instead of the empty tile it would get on its own. Only when neither side has a usable
  // photo does the (public) v4 tile's empty placeholder show through.
  const legacyByPath = new Map(legacy.map((s) => [s.path, s]));
  const v4Paths = new Set(v4.map((s) => s.path));
  const subalbums = [
    ...v4.map((tile) =>
      tile.thumbnail
        ? tile
        : {
            ...tile,
            thumbnail: legacyByPath.get(tile.path)?.thumbnail ?? null,
          },
    ),
    ...legacy.filter((s) => !v4Paths.has(s.path)),
  ].sort((a, b) => a.title.localeCompare(b.title, "fi"));
  return {
    source: "v4",
    kind: "photographers",
    id: "photographers",
    parentId: null,
    path: photographersPath,
    title: "Photographers",
    description: "",
    body: v4Intro?.body
      ? { kind: "markdown", text: v4Intro.body }
      : legacyHtmlBody(legacyIntro?.body),
    cover: null,
    date: null,
    layout: "simple",
    visibility: "public",
    effectiveVisibility: "public",
    contactable: false,
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: root,
    subalbums,
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: null,
  };
}

/** A v4 photographer's page: introduction, links and every album they are credited on. */
export async function loadV4PhotographerPage(
  photographerId: string,
): Promise<AlbumPageVM | null> {
  const photographer = await db.orm.public.Photographer.where({
    id: photographerId,
  })
    .include("links", (l) => l.orderBy((x) => x.ordering.asc()))
    .include("credits", (c) =>
      c.include("album", (a) =>
        a.include("thumbnailPhoto", (t) => t.include("media")),
      ),
    )
    .include("coverPhoto", (p) =>
      p
        .include("media")
        .include("album", (a) =>
          a.include("credits", (c) => c.include("photographer")),
        ),
    )
    .first();
  if (!photographer) return null;
  const effective = await effectiveVisibilities([
    ...photographer.credits.map((c) => c.album.path),
    ...(photographer.coverPhoto ? [photographer.coverPhoto.album.path] : []),
  ]);
  // The cover photo's own containing album's visibility gates it independently of the
  // photographer's own profile visibility: a photo picked from a non-public album stays off it.
  const coverMedia =
    photographer.coverPhoto &&
    effective.get(photographer.coverPhoto.album.path) === "public"
      ? buildMediaSet(photographer.coverPhoto.media, "thumbnail")
      : null;
  const cover: CoverVM | null =
    photographer.coverPhoto && coverMedia
      ? {
          media: coverMedia,
          path: photographer.coverPhoto.path,
          credits: photographer.coverPhoto.album.credits
            .filter((c) => c.isCopyright)
            .sort((a, b) => a.ordering - b.ordering)
            .map((c) => ({
              displayName: c.photographer.displayName,
              path: `${photographersPath}/${c.photographer.slug}`,
            })),
        }
      : null;

  const albums = photographer.credits
    .map((c) => c.album)
    .sort(
      (a, b) =>
        a.ordering - b.ordering ||
        compareEventDateDesc(a.eventDate, b.eventDate),
    );
  const prefixes = new Set<string>();
  for (const album of albums)
    for (const prefix of pathPrefixes(album.path))
      if (prefix !== "/") prefixes.add(prefix);
  const ancestorRows =
    prefixes.size > 0
      ? await db.orm.public.Album.where((a) => a.path.in([...prefixes]))
          .select("path", "title")
          .all()
      : [];
  const ancestors = new Map(ancestorRows.map((a) => [a.path, a.title]));

  const subalbums: SubalbumVM[] = albums.flatMap((album) => {
    const thumbnail = album.thumbnailPhoto
      ? buildMediaSet(album.thumbnailPhoto.media, "thumbnail")
      : null;
    if (!thumbnail) return [];
    return [
      {
        path: album.path,
        title: titleInPhotographerContext(
          pathPrefixes(album.path)
            .filter((p) => p !== "/")
            .map((p) => ancestors.get(p) ?? ""),
          album.title,
          photographer.displayName,
        ),
        date: album.eventDate,
        visibility: effective.get(album.path) ?? album.visibility,
        thumbnail,
        externalUrl: null,
        ownerId: album.ownerId,
      },
    ];
  });

  return {
    source: "v4",
    kind: "photographer",
    id: `photographer:${photographer.id}`,
    parentId: null,
    path: `${photographersPath}/${photographer.slug}`,
    title: photographer.displayName,
    description: "",
    body: { kind: "markdown", text: photographer.introduction },
    cover,
    date: null,
    layout: "yearly",
    // No ancestor chain to be the least visible of, unlike an album: the profile's own setting
    // is already the effective one.
    visibility: photographer.visibility,
    effectiveVisibility: photographer.visibility,
    contactable: false,
    ownerId: photographer.userId,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: [
      ...(await rootCrumb()),
      { path: photographersPath, title: "Photographers" },
    ],
    subalbums,
    photos: [],
    credits: [
      {
        displayName: photographer.displayName,
        path: `${photographersPath}/${photographer.slug}`,
        isCopyright: true,
        description: "",
        links: photographer.links.map(({ href, title }) => ({ href, title })),
      },
    ],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: null,
  };
}

/**
 * A photographer page by slug. A person who photographed before and after the rewrite has a
 * v4 row and a legacy row with the same slug; their page shows both sets of albums, the v4
 * introduction taking precedence and the legacy cover picture filling in until v4 has one.
 */
export async function loadPhotographerPageBySlug(
  slug: string,
): Promise<AlbumPageVM | null> {
  const [v4Row, legacyId] = await Promise.all([
    db.orm.public.Photographer.where({ slug }).select("id").first(),
    legacyEnabled ? legacyPhotographerIdBySlug(slug) : Promise.resolve(null),
  ]);
  const [v4, legacy] = await Promise.all([
    v4Row ? loadV4PhotographerPage(v4Row.id) : Promise.resolve(null),
    legacyId !== null
      ? loadLegacyPhotographerPage(legacyId)
      : Promise.resolve(null),
  ]);
  if (!v4) return legacy;
  if (!legacy) return v4;
  const seen = new Set(v4.subalbums.map((s) => s.path));
  return {
    ...v4,
    body: v4.body.text ? v4.body : legacy.body,
    cover: v4.cover ?? legacy.cover,
    subalbums: [
      ...v4.subalbums,
      ...legacy.subalbums.filter((s) => !seen.has(s.path)),
    ],
  };
}
