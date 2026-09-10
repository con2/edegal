import type { MediaFormat, MediaSet, MediaVariant } from "@/gallery/types";
import { formatPreference } from "@/media/specs";
import { mediaUrl } from "@/media/url";

import type { LegacyMediaRow } from "./rows";

const knownFormats: readonly string[] = ["jpeg", "webp", "avif", "heif"];

function toVariant(row: LegacyMediaRow): MediaVariant | null {
  if (!row.src || !knownFormats.includes(row.format)) return null;
  return {
    src: mediaUrl(row.src),
    width: row.width,
    height: row.height,
    format: row.format as MediaFormat,
  };
}

/**
 * Builds a `<picture>` set from the media rows of one legacy picture: the widest jpeg of the role is
 * the fallback (any format if there is no jpeg), other formats become alternates.
 */
export function buildLegacyMediaSet(
  rows: LegacyMediaRow[] | null,
  role: string,
): MediaSet | null {
  const variants = (rows ?? [])
    .filter((m) => m.role === role)
    .map(toVariant)
    .filter((v): v is MediaVariant => v !== null);
  if (variants.length === 0) return null;
  const jpegs = variants
    .filter((v) => v.format === "jpeg")
    .sort((a, b) => b.width - a.width);
  const fallback = jpegs[0] ?? variants[0];
  const alternates = variants
    .filter((v) => v.format !== fallback.format)
    .sort(
      (a, b) =>
        formatPreference.indexOf(a.format) - formatPreference.indexOf(b.format),
    )
    .map(({ src, format }) => ({ src, format }));
  return { fallback, alternates };
}

export function legacyOriginal(
  rows: LegacyMediaRow[] | null,
): MediaVariant | null {
  const original = (rows ?? []).find((m) => m.role === "original");
  return original ? toVariant(original) : null;
}
