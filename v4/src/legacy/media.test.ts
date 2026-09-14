import { describe, expect, it } from "vitest";

import { buildLegacyMediaSet, legacyOriginal } from "./media";
import type { LegacyMediaRow } from "./rows";

const rows: LegacyMediaRow[] = [
  {
    src: "pictures/a/b.jpeg",
    width: 6000,
    height: 4000,
    format: "jpeg",
    role: "original",
  },
  {
    src: "previews/a/b.thumbnail.webp",
    width: 360,
    height: 240,
    format: "webp",
    role: "thumbnail",
  },
  {
    src: "previews/a/b.thumbnail.jpeg",
    width: 360,
    height: 240,
    format: "jpeg",
    role: "thumbnail",
  },
  {
    src: "previews/a/b.preview.avif",
    width: 2025,
    height: 1350,
    format: "avif",
    role: "preview",
  },
  {
    src: "previews/a/b.preview.jpeg",
    width: 2025,
    height: 1350,
    format: "jpeg",
    role: "preview",
  },
];

describe("buildLegacyMediaSet", () => {
  it("uses the jpeg as fallback and lists other formats as alternates from media rows, not by extension substitution", () => {
    const set = buildLegacyMediaSet(rows, "thumbnail");
    expect(set?.fallback).toEqual({
      src: "/media/previews/a/b.thumbnail.jpeg",
      storageKey: "previews/a/b.thumbnail.jpeg",
      width: 360,
      height: 240,
      format: "jpeg",
      byteSize: null,
    });
    expect(set?.alternates).toEqual([
      {
        src: "/media/previews/a/b.thumbnail.webp",
        storageKey: "previews/a/b.thumbnail.webp",
        width: 360,
        height: 240,
        format: "webp",
        byteSize: null,
      },
    ]);
  });

  it("degrades to a non-jpeg fallback when the role has no jpeg", () => {
    const set = buildLegacyMediaSet(
      rows.filter((r) => r.format !== "jpeg"),
      "preview",
    );
    expect(set?.fallback.format).toBe("avif");
    expect(set?.alternates).toEqual([]);
  });

  it("returns null when the role is missing", () => {
    expect(buildLegacyMediaSet(rows, "nonexistent")).toBeNull();
    expect(buildLegacyMediaSet(null, "thumbnail")).toBeNull();
  });

  it("finds the original", () => {
    expect(legacyOriginal(rows)?.src).toBe("/media/pictures/a/b.jpeg");
  });
});
