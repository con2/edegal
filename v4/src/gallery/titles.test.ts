import { describe, expect, it } from "vitest";

import { stripPhotographerName, titleInPhotographerContext } from "./titles";

describe("stripPhotographerName", () => {
  it("removes the name and the punctuation that separated it", () => {
    expect(stripPhotographerName("Foo Bar - Cool Pics", "Foo Bar")).toBe(
      "Cool Pics",
    );
    expect(stripPhotographerName("Cool Pics: Foo Bar", "Foo Bar")).toBe(
      "Cool Pics",
    );
    expect(
      stripPhotographerName("Foo Bar » Cool Pics » Foo Bar", "Foo Bar"),
    ).toBe("Cool Pics");
  });

  it("leaves titles without the name alone, apart from trimming", () => {
    expect(stripPhotographerName("  Cool Pics ", "Foo Bar")).toBe("Cool Pics");
    expect(stripPhotographerName("Cool Pics", "")).toBe("Cool Pics");
  });
});

describe("titleInPhotographerContext", () => {
  it("prefixes the album title with its ancestors, name stripped from each", () => {
    expect(
      titleInPhotographerContext(
        ["Ropecon 2019", "Foo Bar"],
        "Saturday",
        "Foo Bar",
      ),
    ).toBe("Ropecon 2019 » Saturday");
  });

  // An album titled only with the photographer's name would otherwise render as an empty tile.
  it("falls back to the plain title when stripping leaves nothing", () => {
    expect(titleInPhotographerContext([], "Foo Bar", "Foo Bar")).toBe(
      "Foo Bar",
    );
  });
});
