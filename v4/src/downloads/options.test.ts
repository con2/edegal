import { describe, expect, it } from "vitest";

import type { MediaFormat, MediaVariant, PhotoVM } from "@/gallery/types";

import { describeVariant, downloadOptions, formatBytes } from "./options";

const variant = (
  format: MediaFormat,
  width: number,
  byteSize: number | null,
): MediaVariant => ({
  src: `/media/${format}`,
  storageKey: format,
  width,
  height: Math.round((width * 2) / 3),
  format,
  byteSize,
});

const photo: PhotoVM = {
  id: "p",
  path: "/con/sat/dsc-0001",
  title: "",
  visibility: "public",
  takenAt: null,
  thumbnail: { fallback: variant("jpeg", 360, 5000), alternates: [] },
  preview: {
    fallback: variant("jpeg", 2025, 400_000),
    alternates: [variant("avif", 2025, 250_000)],
  },
  original: variant("jpeg", 8000, 36_700_160),
};

describe("downloadOptions", () => {
  it("offers the original, then preview jpeg, then other preview formats, never thumbnails", () => {
    expect(
      downloadOptions(photo).map((o) => [o.kind, o.variant.format, o.fileName]),
    ).toEqual([
      ["original", "jpeg", "dsc-0001.jpg"],
      ["preview", "jpeg", "dsc-0001-preview.jpg"],
      ["preview", "avif", "dsc-0001-preview.avif"],
    ]);
  });

  it("copes with a photo that has only previews", () => {
    expect(
      downloadOptions({ ...photo, original: null }).map((o) => o.kind),
    ).toEqual(["preview", "preview"]);
    expect(
      downloadOptions({ ...photo, original: null, preview: null }),
    ).toEqual([]);
  });
});

describe("labels", () => {
  it("formats sizes in KB below a megabyte and MB above, with a decimal below ten", () => {
    expect(formatBytes(512)).toBe("1 KB");
    expect(formatBytes(358_400)).toBe("350 KB");
    expect(formatBytes(4_404_019)).toBe("4.2 MB");
    expect(formatBytes(36_700_160)).toBe("35 MB");
  });

  it("describes a variant by format, dimensions and size, leaving out an unknown size", () => {
    expect(describeVariant(variant("jpeg", 8000, 36_700_160))).toBe(
      "JPEG (8000×5333, 35 MB)",
    );
    expect(describeVariant(variant("avif", 2025, null))).toBe(
      "AVIF (2025×1350)",
    );
  });
});
