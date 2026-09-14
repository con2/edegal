import type { MediaFormat } from "@/gallery/types";

export interface ScaledMediaSpec {
  role: "thumbnail" | "preview";
  format: MediaFormat;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

/**
 * Sizes match the legacy media specs so new and legacy content look alike. Thumbnails were WebP
 * q75 until 2026-09; AVIF q55 with 4:2:0 chroma matches them in quality at 83 % of the bytes,
 * and thumbnails made earlier keep their WebP variant since `<picture>` offers whatever exists.
 */
export const scaledMediaSpecs: ScaledMediaSpec[] = [
  { role: "thumbnail", format: "jpeg", maxWidth: 900, maxHeight: 240, quality: 60 },
  { role: "thumbnail", format: "avif", maxWidth: 900, maxHeight: 240, quality: 55 },
  { role: "preview", format: "jpeg", maxWidth: 2400, maxHeight: 1350, quality: 85 },
  { role: "preview", format: "avif", maxWidth: 2400, maxHeight: 1350, quality: 60 },
];

/** Order in which alternate formats are offered to the browser inside `<picture>`. */
export const formatPreference: MediaFormat[] = ["avif", "webp", "jpeg"];
