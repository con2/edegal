import sharp, { type Sharp } from "sharp";

import { timezone } from "@/config";
import type { MediaFormat } from "@/gallery/types";

import { exifCaptureTime } from "./exif";
import { type ScaledMediaSpec, scaledMediaSpecs } from "./specs";
import { type MediaBackend, mediaStorage } from "./storage";

export interface ProducedMedia {
  role: "original" | "preview" | "thumbnail";
  format: MediaFormat;
  width: number;
  height: number;
  storageKey: string;
  backend: MediaBackend;
  byteSize: number;
}

/** An original either arrives in memory or already sits in storage as a browser's direct upload. */
export type OriginalSource = Buffer | { uploadKey: string; byteSize: number };

export interface UploadInfo {
  format: MediaFormat;
  width: number;
  height: number;
  /** EXIF orientation, 1 when absent. */
  orientation: number;
}

const roleDirectories = { original: "pictures", preview: "previews", thumbnail: "thumbnails" } as const;

/** `pictures/myevent/dsc-0001.png`, `previews/myevent/dsc-0001.avif`, ... */
export function storageKeyFor(photoPath: string, role: ProducedMedia["role"], format: MediaFormat): string {
  return `${roleDirectories[role]}${photoPath}.${format}`;
}

/**
 * Decoding allocates about four bytes per pixel, so this bounds the memory one upload can take
 * in the web process and the worker. Comfortably above current camera sensors.
 */
export const maxInputPixels = 100_000_000;

/**
 * Formats the pipeline can decode. sharp reports AVIF as HEIF with AV1 compression; HEIC (HEVC) is
 * refused because prebuilt sharp has no HEVC decoder.
 */
export async function inspectUpload(data: Buffer): Promise<UploadInfo | null> {
  try {
    const { format, compression, width, height, orientation } = await sharp(data, {
      failOn: "none",
      limitInputPixels: maxInputPixels,
    }).metadata();
    if (!width || !height) return null;
    const uploadFormat =
      format === "jpeg" || format === "png" || format === "webp"
        ? format
        : format === "heif" && compression === "av1"
          ? "avif"
          : null;
    if (!uploadFormat) return null;
    return { format: uploadFormat, width, height, orientation: orientation ?? 1 };
  } catch {
    return null;
  }
}

function decode(original: Buffer): Sharp {
  return sharp(original, { failOn: "none", limitInputPixels: maxInputPixels }).rotate();
}

/**
 * Stores the uploaded file as the photo's original under `pictures/`, byte for byte and in its own
 * format: photographers want their files untouched, and originals are only ever downloaded, never
 * shown. `info` is the result of `inspectUpload` for the same bytes.
 */
export async function storeOriginal(photoPath: string, original: OriginalSource, info: UploadInfo): Promise<ProducedMedia> {
  // Recorded as displayed: an orientation tag of 5 or above rotates the stored pixels by a quarter turn.
  const displayed =
    info.orientation >= 5 ? { width: info.height, height: info.width } : { width: info.width, height: info.height };
  const storageKey = storageKeyFor(photoPath, "original", info.format);
  const contentType = `image/${info.format}`;
  let byteSize: number;
  if (Buffer.isBuffer(original)) {
    await mediaStorage.put(storageKey, original, contentType);
    byteSize = original.byteLength;
  } else {
    await mediaStorage.copy(original.uploadKey, storageKey, contentType);
    byteSize = original.byteSize;
  }
  return { role: "original", format: info.format, ...displayed, storageKey, backend: mediaStorage.backend, byteSize };
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
      // Originals are 4:2:0 JPEGs already; sharp's 4:4:4 default costs 5 % for nothing.
      return resized.avif({ quality: spec.quality, chromaSubsampling: "4:2:0" }).toBuffer();
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
    produced.push({
      role: spec.role,
      format: spec.format,
      width,
      height,
      storageKey,
      backend: mediaStorage.backend,
      byteSize: buffer.byteLength,
    });
  }
  return produced;
}

/** Original plus all scaled variants in one go; used where there is no background worker (seed). */
export async function importOriginal(photoPath: string, original: Buffer): Promise<ProducedMedia[]> {
  const info = await inspectUpload(original);
  if (!info) throw new Error(`${photoPath}: not a JPEG, PNG, WebP or AVIF image`);
  const stored = await storeOriginal(photoPath, original, info);
  return [stored, ...(await generateScaledMedia(photoPath, original))];
}

const wallClockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: timezone,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Milliseconds the configured time zone is ahead of UTC at `instant`. */
function zoneOffsetAt(instant: number): number {
  const part = Object.fromEntries(wallClockFormat.formatToParts(new Date(instant)).map((p) => [p.type, Number(p.value)]));
  return Date.UTC(part.year!, part.month! - 1, part.day, part.hour, part.minute, part.second) - instant;
}

/**
 * The instant at which clocks in the configured time zone showed `wall`, given as UTC
 * milliseconds of the same digits. Around a DST transition the offset can differ between the
 * first guess and the answer, so it is looked up twice.
 */
function wallClockToInstant(wall: number): number {
  const instant = wall - zoneOffsetAt(wall);
  return wall - zoneOffsetAt(instant);
}

/**
 * EXIF capture time as ISO 8601, or null. A camera that records no UTC offset is assumed to keep
 * the configured time zone.
 */
export async function takenAtOf(original: Buffer): Promise<string | null> {
  const { exif } = await sharp(original).metadata();
  if (!exif) return null;
  const captured = exifCaptureTime(exif);
  if (!captured) return null;
  const [date, time] = captured.dateTime.split(" ");
  const iso = `${date!.replaceAll(":", "-")}T${time}`;
  const parsed = captured.offset ? new Date(`${iso}${captured.offset}`) : new Date(wallClockToInstant(Date.parse(`${iso}Z`)));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
