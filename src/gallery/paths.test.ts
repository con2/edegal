import { describe, expect, it } from "vitest";

import {
  isAncestorOrSelf,
  isReservedRootPath,
  lastSegment,
  normalizeGalleryPath,
  pathPrefixes,
} from "./paths";

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
    expect(pathPrefixes("/")).toEqual([]);
    expect(pathPrefixes("/a")).toEqual(["/"]);
    expect(pathPrefixes("/a/b/c")).toEqual(["/", "/a", "/a/b"]);
  });
});

describe("isAncestorOrSelf", () => {
  it("accepts the path itself, its ancestors and the root", () => {
    expect(isAncestorOrSelf("/con/sat", "/con/sat")).toBe(true);
    expect(isAncestorOrSelf("/con", "/con/sat/img-1")).toBe(true);
    expect(isAncestorOrSelf("/", "/con")).toBe(true);
  });

  // A sibling whose slug merely starts with the same letters must not count.
  it("rejects siblings and prefixes that are not whole segments", () => {
    expect(isAncestorOrSelf("/con", "/concert")).toBe(false);
    expect(isAncestorOrSelf("/con/sat", "/con")).toBe(false);
  });
});

describe("isReservedRootPath", () => {
  it("reserves only root-level slugs that routing claims", () => {
    expect(isReservedRootPath("/admin")).toBe(true);
    expect(isReservedRootPath("/photographers")).toBe(true);
    expect(isReservedRootPath("/admin/x")).toBe(false);
    expect(isReservedRootPath("/tracon-2026")).toBe(false);
    expect(isReservedRootPath("/")).toBe(false);
  });
});

describe("lastSegment", () => {
  it("returns the final segment, empty for the root", () => {
    expect(lastSegment("/desucon-2026")).toBe("desucon-2026");
    expect(lastSegment("/a/b")).toBe("b");
    expect(lastSegment("/")).toBe("");
  });
});
