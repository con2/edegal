import { describe, expect, it } from "vitest";

import { normalizeGalleryPath, pathPrefixes } from "./paths";

describe("normalizeGalleryPath", () => {
  it("maps no segments to the root", () => {
    expect(normalizeGalleryPath(undefined)).toEqual({
      path: "/",
      timeline: false,
    });
    expect(normalizeGalleryPath([])).toEqual({ path: "/", timeline: false });
  });

  it("joins segments and lowercases", () => {
    expect(normalizeGalleryPath(["Tracon-2026", "Lauantai"])).toEqual({
      path: "/tracon-2026/lauantai",
      timeline: false,
    });
  });

  it("strips the legacy timeline suffix", () => {
    expect(normalizeGalleryPath(["tracon-2026", "timeline"])).toEqual({
      path: "/tracon-2026",
      timeline: true,
    });
    expect(normalizeGalleryPath(["timeline"])).toEqual({
      path: "/timeline",
      timeline: false,
    });
  });

  it("rejects paths outside the legacy charset", () => {
    expect(normalizeGalleryPath(["wp-login.php"])).toBeNull();
    expect(normalizeGalleryPath(["ääkköset"])).toBeNull();
    expect(normalizeGalleryPath(["a b"])).toBeNull();
  });
});

describe("pathPrefixes", () => {
  it("returns ancestors root first, excluding the path itself", () => {
    expect(pathPrefixes("/")).toEqual(["/"]);
    expect(pathPrefixes("/a")).toEqual(["/"]);
    expect(pathPrefixes("/a/b/c")).toEqual(["/", "/a", "/a/b"]);
  });
});
