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

export interface UploadInfo {
  format: "jpeg" | "png" | "webp";
  width: number;
  height: number;
}

const roleDirectories = { original: "pictures", preview: "previews", thumbnail: "thumbnails" } as const;

/** `pictures/myevent/dsc-0001.jpeg`, `previews/myevent/dsc-0001.avif`, ... */
export function storageKeyFor(photoPath: string, role: ProducedMedia["role"], format: MediaFormat): string {
  return `${roleDirectories[role]}${photoPath}.${format}`;
}

/** Formats the pipeline can decode. HEIC is not among them: prebuilt sharp has no HEVC decoder. */
export async function inspectUpload(data: Buffer): Promise<UploadInfo | null> {
  try {
    const { format, width, height } = await sharp(data, { failOn: "none" }).metadata();
    if ((format === "jpeg" || format === "png" || format === "webp") && width && height) {
      return { format, width, height };
    }
    return null;
  } catch {
    return null;
  }
}

function decode(original: Buffer): Sharp {
  return sharp(original, { failOn: "none" }).rotate();
}

/**
 * Stores the uploaded file as the photo's original under `pictures/`. Orientation is normalised
 * from EXIF and non-JPEG input is re-encoded, so every original is a JPEG.
 */
export async function storeOriginal(photoPath: string, original: Buffer): Promise<ProducedMedia> {
  const image = decode(original);
  const metadata = await image.metadata();
  const needsReencode = metadata.format !== "jpeg" || (metadata.orientation ?? 1) !== 1;
  const buffer = needsReencode ? await image.jpeg({ quality: 95 }).toBuffer() : original;
  const { width = 0, height = 0 } = needsReencode ? await sharp(buffer).metadata() : metadata;
  const storageKey = storageKeyFor(photoPath, "original", "jpeg");
  await mediaStorage.put(storageKey, buffer, "image/jpeg");
  return { role: "original", format: "jpeg", width, height, storageKey, byteSize: buffer.byteLength };
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

/** Produces every scaled variant in `scaledMediaSpecs` from a stored original. */
export async function generateScaledMedia(photoPath: string, original: Buffer): Promise<ProducedMedia[]> {
  const image = decode(original);
  const produced: ProducedMedia[] = [];
  for (const spec of scaledMediaSpecs) {
    const buffer = await encode(image, spec);
    const { width = 0, height = 0 } = await sharp(buffer).metadata();
    const storageKey = storageKeyFor(photoPath, spec.role, spec.format);
    await mediaStorage.put(storageKey, buffer, `image/${spec.format}`);
    produced.push({ role: spec.role, format: spec.format, width, height, storageKey, byteSize: buffer.byteLength });
  }
  return produced;
}

/** Original plus all scaled variants in one go; used where there is no background worker (seed). */
export async function importOriginal(photoPath: string, original: Buffer): Promise<ProducedMedia[]> {
  const stored = await storeOriginal(photoPath, original);
  return [stored, ...(await generateScaledMedia(photoPath, original))];
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
