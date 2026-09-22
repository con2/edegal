import { describe, expect, it } from "vitest";

import { walkRedirects } from "./redirects";

describe("walkRedirects", () => {
  it("returns an external ancestor redirect as is", () => {
    expect(
      walkRedirects("/con/mira/dsc-1", [
        { path: "/con/mira", target: "https://flickr.com/x" },
      ]),
    ).toBe("https://flickr.com/x");
  });

  it("re-attaches the segments below a locally redirected ancestor", () => {
    expect(
      walkRedirects("/old-name/sat/dsc-1", [
        { path: "/old-name", target: "/new-name/" },
      ]),
    ).toBe("/new-name/sat/dsc-1");
  });

  // The deepest redirecting ancestor describes the most specific move.
  it("prefers the deepest ancestor", () => {
    expect(
      walkRedirects("/a/b/c", [
        { path: "/a", target: "/x" },
        { path: "/a/b", target: "/y" },
      ]),
    ).toBe("/y/c");
  });

  it("ignores the path itself and unrelated paths", () => {
    expect(
      walkRedirects("/a/b", [
        { path: "/a/b", target: "/self" },
        { path: "/z", target: "/other" },
      ]),
    ).toBeNull();
    expect(walkRedirects("/a", [])).toBeNull();
  });

  // Bad legacy data without a leading slash must not become a relative Location: the browser
  // would resolve it against the current path and keep re-triggering the same redirect forever.
  it("ignores a local target with no leading slash", () => {
    expect(
      walkRedirects("/old-name/sat/dsc-1", [
        { path: "/old-name", target: "new-name" },
      ]),
    ).toBeNull();
  });

  it("falls through to a shallower ancestor when a deeper one has a malformed target", () => {
    expect(
      walkRedirects("/a/b/c", [
        { path: "/a", target: "/x" },
        { path: "/a/b", target: "malformed" },
      ]),
    ).toBe("/x/b/c");
  });
});
