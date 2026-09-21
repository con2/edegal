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
 * Public photographers, one tile each: their own profile photo, or an empty tile when they
 * have none - never guessed from a credited album, so an empty tile means exactly what it shows.
 */
async function photographerSubalbums(): Promise<SubalbumVM[]> {
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

/** The /photographers index: every public photographer, sorted by name. */
export async function loadPhotographersIndex(): Promise<AlbumPageVM> {
  const [subalbums, root, intro] = await Promise.all([
    photographerSubalbums(),
    rootCrumb(),
    db.orm.public.Album.where({ path: photographersPath })
      .select("body")
      .first(),
  ]);
  return {
    kind: "photographers",
    id: "photographers",
    parentId: null,
    path: photographersPath,
    title: "Photographers",
    description: "",
    body: intro?.body ?? "",
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
    subalbums: subalbums.sort((a, b) => a.title.localeCompare(b.title, "fi")),
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
  };
}

/** A photographer's page: introduction, links and every album they are credited on. */
export async function loadPhotographerPageBySlug(
  slug: string,
): Promise<AlbumPageVM | null> {
  const photographer = await db.orm.public.Photographer.where({ slug })
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
    kind: "photographer",
    id: `photographer:${photographer.id}`,
    parentId: null,
    path: `${photographersPath}/${photographer.slug}`,
    title: photographer.displayName,
    description: "",
    body: photographer.introduction,
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
  };
}
