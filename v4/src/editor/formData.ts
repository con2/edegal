import type {
  AlbumFormOptions,
  AlbumFormValues,
} from "@/components/editor/AlbumForm";
import type { CreditInput } from "@/editor/schemas";
import { pathPrefixes } from "@/gallery/paths";
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
): Promise<AlbumFormOptions> {
  const [terms, photographers, users, inherited] = await Promise.all([
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
  ]);
  return {
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
      ordering: 0,
      eventMetadataUrl: "",
      body: "",
      termsId: photographer?.defaultTermsId ?? "",
      ownerId: viewer.userId,
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
      eventDate: album.eventDate,
      visibility: album.visibility,
      isOpenForSubalbums: album.isOpenForSubalbums,
      isDownloadable: album.isDownloadable,
      ordering: album.ordering,
      eventMetadataUrl: album.eventMetadataUrl,
      body: album.body,
      termsId: album.termsId ?? "",
      ownerId: album.ownerId ?? "",
    },
    credits: album.credits.map((c) => ({
      photographerId: c.photographerId,
      isCopyright: c.isCopyright,
      description: c.description,
    })),
  };
}
