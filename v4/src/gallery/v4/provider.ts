import type {
  AlbumPageVM,
  MediaFormat,
  MediaSet,
  MediaVariant,
  PhotoVM,
  SubalbumVM,
} from "@/gallery/types";
import { pathPrefixes } from "@/gallery/paths";
import { formatPreference } from "@/media/specs";
import { mediaUrl } from "@/media/url";
import { pgTimestampToIso } from "@/lib/time";
import { db } from "@/prisma/db";

interface MediaRow {
  role: "original" | "preview" | "thumbnail";
  format: MediaFormat;
  width: number;
  height: number;
  storageKey: string;
}

function toVariant(m: MediaRow): MediaVariant {
  return {
    src: mediaUrl(m.storageKey),
    width: m.width,
    height: m.height,
    format: m.format,
  };
}

export function buildMediaSet(
  media: MediaRow[],
  role: MediaRow["role"],
): MediaSet | null {
  const variants = media.filter((m) => m.role === role).map(toVariant);
  if (variants.length === 0) return null;
  const fallback = variants.find((v) => v.format === "jpeg") ?? variants[0];
  const alternates = variants
    .filter((v) => v.format !== fallback.format)
    .sort(
      (a, b) =>
        formatPreference.indexOf(a.format) - formatPreference.indexOf(b.format),
    )
    .map(({ src, format }) => ({ src, format }));
  return { fallback, alternates };
}

export async function loadV4Album(
  albumId: string,
): Promise<AlbumPageVM | null> {
  const album = await db.orm.public.Album.where({ id: albumId })
    .include("children", (children) =>
      children
        .include("thumbnailPhoto", (photo) => photo.include("media"))
        .orderBy([(a) => a.ordering.asc(), (a) => a.eventDate.desc()]),
    )
    .include("photos", (photos) =>
      photos
        .include("media")
        .orderBy([
          (p) => p.ordering.asc(),
          (p) => p.takenAt.asc(),
          (p) => p.slug.asc(),
        ]),
    )
    .include("credits", (credits) =>
      credits
        .include("photographer", (photographer) =>
          photographer.include("links"),
        )
        .orderBy((c) => c.ordering.asc()),
    )
    .first();
  if (!album) return null;

  const ancestors = await db.orm.public.Album.where((a) =>
    a.path.in(pathPrefixes(album.path)),
  )
    .select("path", "title")
    .all();
  ancestors.sort((a, b) => a.path.length - b.path.length);

  const subalbums: SubalbumVM[] = album.children.map((child) => ({
    path: child.path,
    title: child.title,
    date: child.eventDate,
    visibility: child.visibility,
    thumbnail: child.thumbnailPhoto
      ? buildMediaSet(child.thumbnailPhoto.media, "thumbnail")
      : null,
    externalUrl: null,
    ownerId: child.ownerId,
  }));

  const photos = album.photos.flatMap((photo): PhotoVM[] => {
    const thumbnail = buildMediaSet(photo.media, "thumbnail");
    if (!thumbnail) return [];
    const original = photo.media.find((m) => m.role === "original");
    return [
      {
        path: photo.path,
        title: photo.title,
        visibility: "public",
        takenAt: photo.takenAt ? pgTimestampToIso(photo.takenAt) : null,
        thumbnail,
        preview: buildMediaSet(photo.media, "preview"),
        original: original ? toVariant(original) : null,
      },
    ];
  });

  return {
    source: "v4",
    path: album.path,
    title: album.title,
    description: "",
    body: { kind: "markdown", text: album.body },
    date: album.eventDate,
    layout: "simple",
    visibility: album.visibility,
    ownerId: album.ownerId,
    isDownloadable: album.isDownloadable,
    breadcrumb: ancestors.map(({ path, title }) => ({ path, title })),
    subalbums,
    photos,
    credits: album.credits.map((credit) => ({
      displayName: credit.photographer.displayName,
      isCopyright: credit.isCopyright,
      description: credit.description,
      links: credit.photographer.links
        .slice()
        .sort((a, b) => a.ordering - b.ordering)
        .map(({ href, title }) => ({ href, title })),
    })),
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: null,
  };
}

export async function v4PublicPhotoCount(): Promise<number> {
  const result = await db.orm.public.Photo.aggregate((a) => ({ n: a.count() }));
  return result.n;
}

export async function v4RandomPublicPhotoPath(): Promise<string | null> {
  const count = await v4PublicPhotoCount();
  if (count === 0) return null;
  const rows = await db.orm.public.Photo.select("path")
    .orderBy((p) => p.id.asc())
    .offset(Math.floor(Math.random() * count))
    .limit(1)
    .all();
  return rows[0]?.path ?? null;
}
