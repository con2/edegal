import { describe, expect, it } from "vitest";

import { topLevelAlbumPath } from "./sync";

describe("topLevelAlbumPath", () => {
  it("accepts a top-level album on the site, www. and a trailing slash tolerated", () => {
    expect(
      topLevelAlbumPath("https://larppikuvat.fi/foo", "larppikuvat.fi"),
    ).toBe("/foo");
    expect(
      topLevelAlbumPath("https://WWW.larppikuvat.fi/foo/", "larppikuvat.fi"),
    ).toBe("/foo");
  });

  it("rejects other sites, the root, deeper albums and garbage", () => {
    expect(
      topLevelAlbumPath("https://conikuvat.fi/foo", "larppikuvat.fi"),
    ).toBe(null);
    expect(topLevelAlbumPath("https://larppikuvat.fi/", "larppikuvat.fi")).toBe(
      null,
    );
    expect(
      topLevelAlbumPath("https://larppikuvat.fi/foo/bar", "larppikuvat.fi"),
    ).toBe(null);
    expect(topLevelAlbumPath("not a url", "larppikuvat.fi")).toBe(null);
    expect(
      topLevelAlbumPath("ftp://larppikuvat.fi/foo", "larppikuvat.fi"),
    ).toBe(null);
  });
});
