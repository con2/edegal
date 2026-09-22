import type { MediaVariant, PhotoVM } from "@/gallery/types";
import { formatPreference } from "@/media/specs";

import { extensions } from "./names";

export interface DownloadOption {
  kind: "original" | "preview";
  variant: MediaVariant;
  fileName: string;
}

/**
 * Every file a visitor may save for a photo: the original first, then the preview renditions with
 * the jpeg ahead of the newer formats since it opens everywhere. Thumbnails are not offered.
 */
export function downloadOptions(photo: PhotoVM): DownloadOption[] {
  const slug = photo.path.split("/").pop() ?? "photo";
  const options: DownloadOption[] = [];
  if (photo.original) {
    options.push({
      kind: "original",
      variant: photo.original,
      fileName: `${slug}.${extensions[photo.original.format]}`,
    });
  }
  if (photo.preview) {
    const previews = [photo.preview.fallback, ...photo.preview.alternates].sort(
      (a, b) => rank(a.format) - rank(b.format),
    );
    for (const variant of previews) {
      options.push({
        kind: "preview",
        variant,
        fileName: `${slug}-preview.${extensions[variant.format]}`,
      });
    }
  }
  return options;
}

function rank(format: MediaVariant["format"]): number {
  return format === "jpeg" ? -1 : formatPreference.indexOf(format);
}

/** "350 KB", "4.2 MB", "35 MB". */
export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** "JPEG (8000×6000, 35 MB)"; the size is left out when it is unknown. */
export function describeVariant(variant: MediaVariant): string {
  const size =
    variant.byteSize === null ? "" : `, ${formatBytes(variant.byteSize)}`;
  return `${variant.format.toUpperCase()} (${variant.width}×${variant.height}${size})`;
}
