import sharp, { type Sharp } from "sharp";

import type { MediaFormat } from "@/gallery/types";

import { type ScaledMediaSpec, scaledMediaSpecs } from "./specs";
import { mediaStorage } from "./storage";

export interface ProducedMedia {
  role: "original" | "preview" | "thumbnail";
  format: MediaFormat;
  width: number;
  height: number;
  storageKey: string;
  byteSize: number;
}

const roleDirectories = { original: "pictures", preview: "previews", thumbnail: "thumbnails" } as const;

/** `pictures/myevent/dsc-0001.jpeg`, `previews/myevent/dsc-0001.avif`, ... */
export function storageKeyFor(photoPath: string, role: ProducedMedia["role"], format: MediaFormat): string {
  return `${roleDirectories[role]}${photoPath}.${format}`;
}

async function encode(image: Sharp, spec: ScaledMediaSpec): Promise<Buffer> {
  const resized = image.clone().resize({
    width: spec.maxWidth,
    height: spec.maxHeight,
    fit: "inside",
    withoutEnlargement: true,
  });
  switch (spec.format) {
    case "jpeg":
      return resized.jpeg({ quality: spec.quality, mozjpeg: true }).toBuffer();
    case "webp":
      return resized.webp({ quality: spec.quality, effort: 6 }).toBuffer();
    case "avif":
      return resized.avif({ quality: spec.quality }).toBuffer();
    case "heif":
      return resized.heif({ quality: spec.quality }).toBuffer();
  }
}

/**
 * Stores the uploaded original and every scaled variant in `scaledMediaSpecs`, returning the rows
 * to insert as Media. Orientation is normalised from EXIF before scaling.
 */
export async function importOriginal(photoPath: string, original: Buffer): Promise<ProducedMedia[]> {
  const image = sharp(original, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const isJpeg = metadata.format === "jpeg";
  const originalFormat: MediaFormat = isJpeg ? "jpeg" : "jpeg";
  const originalBuffer = isJpeg ? original : await image.clone().jpeg({ quality: 95 }).toBuffer();
  const originalMeta = isJpeg ? metadata : await sharp(originalBuffer).metadata();
  const originalKey = storageKeyFor(photoPath, "original", originalFormat);
  await mediaStorage.put(originalKey, originalBuffer, "image/jpeg");

  const produced: ProducedMedia[] = [
    {
      role: "original",
      format: originalFormat,
      width: originalMeta.width ?? 0,
      height: originalMeta.height ?? 0,
      storageKey: originalKey,
      byteSize: originalBuffer.byteLength,
    },
  ];

  for (const spec of scaledMediaSpecs) {
    const buffer = await encode(image, spec);
    const { width = 0, height = 0 } = await sharp(buffer).metadata();
    const storageKey = storageKeyFor(photoPath, spec.role, spec.format);
    await mediaStorage.put(storageKey, buffer, `image/${spec.format}`);
    produced.push({ role: spec.role, format: spec.format, width, height, storageKey, byteSize: buffer.byteLength });
  }
  return produced;
}

/** EXIF DateTimeOriginal as ISO 8601, or null. */
export async function takenAtOf(original: Buffer): Promise<string | null> {
  const { exif } = await sharp(original).metadata();
  if (!exif) return null;
  const match = exif.toString("latin1").match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
