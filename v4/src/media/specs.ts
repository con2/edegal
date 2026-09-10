import type { MediaFormat } from "@/gallery/types";

export interface ScaledMediaSpec {
  role: "thumbnail" | "preview";
  format: MediaFormat;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

/** Matches the media specs in production so new and legacy content look alike. */
export const scaledMediaSpecs: ScaledMediaSpec[] = [
  { role: "thumbnail", format: "jpeg", maxWidth: 900, maxHeight: 240, quality: 60 },
  { role: "thumbnail", format: "webp", maxWidth: 900, maxHeight: 240, quality: 75 },
  { role: "preview", format: "jpeg", maxWidth: 2400, maxHeight: 1350, quality: 85 },
  { role: "preview", format: "avif", maxWidth: 2400, maxHeight: 1350, quality: 60 },
];

/** Order in which alternate formats are offered to the browser inside `<picture>`. */
export const formatPreference: MediaFormat[] = ["avif", "webp", "heif", "jpeg"];
