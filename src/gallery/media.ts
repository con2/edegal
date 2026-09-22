import { formatPreference } from "@/media/specs";
import { mediaUrl } from "@/media/url";
import { pgTimestampToIso } from "@/lib/time";

import type {
  MediaFormat,
  MediaSet,
  MediaVariant,
  PhotoVM,
  Visibility,
} from "./types";

export interface MediaRow {
  role: "original" | "preview" | "thumbnail";
  format: MediaFormat;
  width: number;
  height: number;
  storageKey: string;
  byteSize: number | null;
}

function toVariant(m: MediaRow): MediaVariant {
  return {
    src: mediaUrl(m.storageKey),
    storageKey: m.storageKey,
    width: m.width,
    height: m.height,
    format: m.format,
    byteSize: m.byteSize,
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
    );
  return { fallback, alternates };
}

/**
 * Maps one photo row (with its media already loaded) to a `PhotoVM`, or null when it has no
 * thumbnail yet (still processing). `ownerId` is left undefined for a photo shown on its own
 * album's page, where the page's own owner already governs it; the timeline loader passes the
 * containing album's owner explicitly, since it flattens photos from several albums.
 */
export function photoVM(
  photo: {
    id: string;
    path: string;
    title: string;
    takenAt: string | null;
    media: MediaRow[];
  },
  visibility: Visibility,
  ownerId?: string | null,
): PhotoVM | null {
  const thumbnail = buildMediaSet(photo.media, "thumbnail");
  if (!thumbnail) return null;
  const original = photo.media.find((m) => m.role === "original");
  return {
    id: photo.id,
    path: photo.path,
    title: photo.title,
    visibility,
    takenAt: photo.takenAt ? pgTimestampToIso(photo.takenAt) : null,
    thumbnail,
    preview: buildMediaSet(photo.media, "preview"),
    original: original ? toVariant(original) : null,
    ownerId,
  };
}
