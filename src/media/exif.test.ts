import { readFile } from "node:fs/promises";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { exifCaptureTime } from "./exif";
import { takenAtOf } from "./pipeline";

const exported = "2026:09:29 21:00:00";
const captured = "2026:09:20 14:30:00";
const digitized = "2026:09:20 14:30:01";

async function jpegWithExif(exif: Record<string, Record<string, string>>): Promise<Buffer> {
  return sharp({ create: { width: 8, height: 6, channels: 3, background: "#800" } })
    .jpeg()
    .withExif(exif)
    .toBuffer();
}

async function exifOf(jpeg: Buffer): Promise<Buffer> {
  const { exif } = await sharp(jpeg).metadata();
  return exif!;
}

describe("exifCaptureTime", () => {
  it("prefers DateTimeOriginal over the IFD0 modification time that precedes it in the blob", async () => {
    const exif = await exifOf(
      await jpegWithExif({ IFD0: { DateTime: exported }, IFD2: { DateTimeOriginal: captured, DateTimeDigitized: digitized } }),
    );
    expect(exif.toString("latin1").indexOf(exported)).toBeLessThan(exif.toString("latin1").indexOf(captured));
    expect(exifCaptureTime(exif)).toEqual({ dateTime: captured, offset: null });
  });

  it("falls back to DateTimeDigitized", async () => {
    const exif = await exifOf(await jpegWithExif({ IFD0: { DateTime: exported }, IFD2: { DateTimeDigitized: digitized } }));
    expect(exifCaptureTime(exif)).toEqual({ dateTime: digitized, offset: null });
  });

  it("ignores a modification time on its own", async () => {
    const exif = await exifOf(await jpegWithExif({ IFD0: { DateTime: exported } }));
    expect(exifCaptureTime(exif)).toBeNull();
  });

  it("returns the camera's UTC offset when recorded", async () => {
    const exif = await exifOf(await jpegWithExif({ IFD2: { DateTimeOriginal: captured, OffsetTimeOriginal: "+03:00" } }));
    expect(exifCaptureTime(exif)).toEqual({ dateTime: captured, offset: "+03:00" });
  });

  it("ignores a blank timestamp", async () => {
    const exif = await exifOf(await jpegWithExif({ IFD2: { DateTimeOriginal: "    :  :     :  :  " } }));
    expect(exifCaptureTime(exif)).toBeNull();
  });

  it("survives a truncated or foreign blob", () => {
    expect(exifCaptureTime(Buffer.from("Exif\0\0II*\0"))).toBeNull();
    expect(exifCaptureTime(Buffer.from("Exif\0\0II*\0\xff\xff\xff\xff", "latin1"))).toBeNull();
    expect(exifCaptureTime(Buffer.alloc(64))).toBeNull();
  });
});

describe("takenAtOf", () => {
  it("applies the recorded offset", async () => {
    const jpeg = await jpegWithExif({ IFD0: { DateTime: exported }, IFD2: { DateTimeOriginal: captured, OffsetTimeOriginal: "+03:00" } });
    expect(await takenAtOf(jpeg)).toBe("2026-09-20T11:30:00.000Z");
  });

  it("reads a camera file whose export time is later than its capture time as Helsinki time", async () => {
    expect(await takenAtOf(await readFile("example_content/ASMS0004.jpg"))).toBe("2015-08-01T09:46:36.000Z");
  });

  it("assumes Helsinki winter time for a camera without an offset", async () => {
    const jpeg = await jpegWithExif({ IFD2: { DateTimeOriginal: "2026:01:15 14:30:00" } });
    expect(await takenAtOf(jpeg)).toBe("2026-01-15T12:30:00.000Z");
  });

  it("resolves the wall time just after the spring DST transition", async () => {
    const jpeg = await jpegWithExif({ IFD2: { DateTimeOriginal: "2026:03:29 04:30:00" } });
    expect(await takenAtOf(jpeg)).toBe("2026-03-29T01:30:00.000Z");
  });

  it("is null without EXIF", async () => {
    const jpeg = await sharp({ create: { width: 8, height: 6, channels: 3, background: "#800" } }).jpeg().toBuffer();
    expect(await takenAtOf(jpeg)).toBeNull();
  });
});
