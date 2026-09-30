const appSegmentHeader = Buffer.from("Exif\0\0", "latin1");

const tiffMagic = 42;
const exifIfdPointerTag = 0x8769;
const dateTimeOriginalTag = 0x9003;
const dateTimeDigitizedTag = 0x9004;
const offsetTimeOriginalTag = 0x9011;
const offsetTimeDigitizedTag = 0x9012;
const asciiType = 2;
const entrySize = 12;

interface TiffReader {
  u16(offset: number): number;
  u32(offset: number): number;
}

function readerFor(tiff: Buffer): TiffReader | null {
  const order = tiff.toString("latin1", 0, 2);
  if (order === "II") {
    return { u16: (o) => tiff.readUInt16LE(o), u32: (o) => tiff.readUInt32LE(o) };
  }
  if (order === "MM") {
    return { u16: (o) => tiff.readUInt16BE(o), u32: (o) => tiff.readUInt32BE(o) };
  }
  return null;
}

/**
 * ASCII entries of an IFD, by tag. Entries longer than four bytes live at an offset the entry
 * points to; the tag's value is only returned when the whole of it fits inside the buffer.
 */
function asciiEntries(tiff: Buffer, r: TiffReader, ifdOffset: number): Map<number, string> {
  const entries = new Map<number, string>();
  if (ifdOffset + 2 > tiff.length) return entries;
  const count = r.u16(ifdOffset);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * entrySize;
    if (entry + entrySize > tiff.length) break;
    if (r.u16(entry + 2) !== asciiType) continue;
    const length = r.u32(entry + 4);
    const start = length <= 4 ? entry + 8 : r.u32(entry + 8);
    if (start + length > tiff.length) continue;
    entries.set(r.u16(entry), tiff.toString("latin1", start, start + length).replace(/\0+$/, ""));
  }
  return entries;
}

function pointerEntry(tiff: Buffer, r: TiffReader, ifdOffset: number, tag: number): number | null {
  if (ifdOffset + 2 > tiff.length) return null;
  const count = r.u16(ifdOffset);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * entrySize;
    if (entry + entrySize > tiff.length) break;
    if (r.u16(entry) === tag) return r.u32(entry + 8);
  }
  return null;
}

export interface ExifCaptureTime {
  /** As the camera wrote it: "YYYY:MM:DD HH:MM:SS" in the camera's clock. */
  dateTime: string;
  /** UTC offset of that clock, "+HH:MM", when the camera recorded one. */
  offset: string | null;
}

/**
 * The capture time recorded in an EXIF blob, or null. Only DateTimeOriginal and DateTimeDigitized
 * count: IFD0's DateTime is the modification time, which photo editors set to the export time.
 */
export function exifCaptureTime(exif: Buffer): ExifCaptureTime | null {
  const tiff = exif.subarray(0, appSegmentHeader.length).equals(appSegmentHeader)
    ? exif.subarray(appSegmentHeader.length)
    : exif;
  if (tiff.length < 8) return null;
  const r = readerFor(tiff);
  if (!r || r.u16(2) !== tiffMagic) return null;
  const exifIfd = pointerEntry(tiff, r, r.u32(4), exifIfdPointerTag);
  if (exifIfd === null) return null;
  const entries = asciiEntries(tiff, r, exifIfd);
  const candidates: [number, number][] = [
    [dateTimeOriginalTag, offsetTimeOriginalTag],
    [dateTimeDigitizedTag, offsetTimeDigitizedTag],
  ];
  for (const [dateTimeTag, offsetTag] of candidates) {
    const dateTime = entries.get(dateTimeTag);
    if (!dateTime?.match(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/)) continue;
    const offset = entries.get(offsetTag);
    return { dateTime, offset: offset?.match(/^[+-]\d{2}:\d{2}$/) ? offset : null };
  }
  return null;
}
