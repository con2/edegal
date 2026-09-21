import type {
  AlbumFormOptions,
  AlbumFormValues,
} from "@/components/editor/AlbumForm";
import type {
  SeriesFormOptions,
  SeriesFormValues,
} from "@/components/editor/SeriesForm";
import { legacyEnabled } from "@/config";
import { legacySeriesList } from "@/legacy/sql";
import type { CreditInput } from "@/editor/schemas";
import { parentPathOf, pathPrefixes } from "@/gallery/paths";

import { moveTargets } from "./albums";
import type { Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";

type SignedIn = Viewer & { kind: "user" };

async function inheritedTermsTitle(fromPath: string): Promise<string | null> {
  const ancestors = await db.orm.public.Album.where((a) =>
    a.path.in(pathPrefixes(fromPath)),
  )
    .select("path", "termsId")
    .all();
  ancestors.sort((a, b) => b.path.length - a.path.length);
  const termsId = ancestors.find((a) => a.termsId)?.termsId;
  if (!termsId) return null;
  const terms = await db.orm.public.Terms.where({ id: termsId })
    .select("title")
    .first();
  return terms?.title ?? null;
}

/** Choices offered by the album form: the user's and shared terms, all photographers, users for admins. */
export async function albumFormOptions(
  viewer: SignedIn,
  childPath: string,
  currentTermsId: string | null,
  /** The album being edited, when it may be moved to another parent. */
  movable: { id: string; path: string } | null = null,
): Promise<AlbumFormOptions> {
  const [terms, photographers, users, inherited, parents, series] =
    await Promise.all([
      db.orm.public.Terms.select("id", "title", "ownerId")
        .orderBy((t) => t.title.asc())
        .all(),
      db.orm.public.Photographer.select("id", "displayName")
        .orderBy((p) => p.displayName.asc())
        .all(),
      viewer.isAdmin
        ? db.orm.public.User.select("id", "email", "displayName")
            .orderBy((u) => u.displayName.asc())
            .all()
        : Promise.resolve(null),
      inheritedTermsTitle(childPath),
      movable ? moveTargets(viewer, movable) : Promise.resolve(null),
      db.orm.public.Series.select("id", "title", "slug")
        .orderBy((s) => s.title.asc())
        .all(),
    ]);
  return {
    parents,
    series,
    terms: terms
      .filter(
        (t) =>
          t.ownerId === viewer.userId ||
          t.ownerId === null ||
          t.id === currentTermsId ||
          viewer.isAdmin,
      )
      .map(({ id, title }) => ({ id, title })),
    inheritedTermsTitle: inherited,
    photographers,
    users:
      users?.map((u) => ({
        id: u.id,
        label: u.displayName ? `${u.displayName} (${u.email})` : u.email,
      })) ?? null,
  };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function newAlbumDefaults(
  viewer: SignedIn,
): Promise<{ values: AlbumFormValues; credits: CreditInput[] }> {
  const photographer = await db.orm.public.Photographer.where({
    userId: viewer.userId,
  }).first();
  return {
    values: {
      title: "",
      slug: "",
      eventDate: today(),
      visibility: "public",
      isOpenForSubalbums: false,
      isDownloadable: true,
      layout: "simple",
      parentPath: "",
      ordering: 0,
      eventMetadataUrl: "",
      body: "",
      termsId: photographer?.defaultTermsId ?? "",
      ownerId: viewer.userId,
      redirectUrl: "",
      seriesId: "",
    },
    credits: photographer
      ? [
          {
            photographerId: photographer.id,
            isCopyright: true,
            description: "",
          },
        ]
      : [],
  };
}

export async function existingAlbumValues(
  albumId: string,
): Promise<{ values: AlbumFormValues; credits: CreditInput[] } | null> {
  const album = await db.orm.public.Album.where({ id: albumId })
    .include("credits", (c) => c.orderBy((x) => x.ordering.asc()))
    .first();
  if (!album) return null;
  return {
    values: {
      title: album.title,
      slug: album.slug,
      // Null only for a migrated legacy album with no discoverable date; the form requires one.
      eventDate: album.eventDate ?? today(),
      visibility: album.visibility,
      isOpenForSubalbums: album.isOpenForSubalbums,
      isDownloadable: album.isDownloadable,
      layout: album.layout,
      parentPath: parentPathOf(album.path),
      ordering: album.ordering,
      eventMetadataUrl: album.eventMetadataUrl,
      body: album.body,
      termsId: album.termsId ?? "",
      ownerId: album.ownerId ?? "",
      redirectUrl: album.redirectUrl,
      seriesId: album.seriesId ?? "",
    },
    credits: album.credits.map((c) => ({
      photographerId: c.photographerId,
      isCopyright: c.isCopyright,
      description: c.description,
    })),
  };
}

/** Legacy series without a v4 counterpart yet: picking one of their slugs continues that series. */
export async function seriesFormOptions(): Promise<SeriesFormOptions> {
  const [legacy, v4] = await Promise.all([
    legacyEnabled ? legacySeriesList() : Promise.resolve([]),
    db.orm.public.Series.select("slug").all(),
  ]);
  const taken = new Set(v4.map((s) => s.slug));
  return { legacySeries: legacy.filter((s) => !taken.has(s.slug)) };
}

export const newSeriesValues: SeriesFormValues = {
  title: "",
  slug: "",
  description: "",
  visibility: "public",
  body: "",
};

export async function existingSeriesValues(
  seriesId: string,
): Promise<SeriesFormValues | null> {
  const series = await db.orm.public.Series.where({ id: seriesId }).first();
  if (!series) return null;
  return {
    title: series.title,
    slug: series.slug,
    description: series.description,
    visibility: series.visibility,
    body: series.body,
  };
}
