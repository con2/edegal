import { describe, expect, it } from "vitest";

import type { PhotoVM } from "@/gallery/types";

import { zipEntryName, zipFileName } from "./names";

const variant = (format: PhotoVM["thumbnail"]["fallback"]["format"]) => ({
  src: "/media/x",
  storageKey: "x",
  width: 1,
  height: 1,
  format,
  byteSize: null,
});

const photo = (path: string, format: "jpeg" | "avif"): PhotoVM => ({
  id: path,
  path,
  title: "",
  visibility: "public",
  takenAt: null,
  thumbnail: { fallback: variant("jpeg"), alternates: [] },
  preview: null,
  original: variant(format),
});

describe("zipEntryName", () => {
  it("uses the slug with jpg for jpeg originals, like the legacy zips", () => {
    expect(zipEntryName(photo("/event/dsc-0001", "jpeg"))).toBe("dsc-0001.jpg");
  });

  it("keeps other formats' own extension", () => {
    expect(zipEntryName(photo("/event/dsc-0002", "avif"))).toBe(
      "dsc-0002.avif",
    );
  });
});

describe("zipFileName", () => {
  const base = { title: "Tracon 2026: Lauantai – Ääkköset" } as Parameters<
    typeof zipFileName
  >[0];
  it("slugifies the album title", () => {
    expect(zipFileName(base)).toBe("tracon-2026-lauantai-aakkoset.zip");
  });
  it("falls back for titles without usable characters", () => {
    expect(zipFileName({ ...base, title: "???" })).toBe("gallery.zip");
  });
});
