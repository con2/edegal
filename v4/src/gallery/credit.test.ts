import { describe, expect, it } from "vitest";

import { copyrightOf, copyrightStatement } from "./credit";
import type { CreditVM, PhotoVM } from "./types";

function credit(overrides: Partial<CreditVM> = {}): CreditVM {
  return {
    displayName: "Photographer",
    path: null,
    isCopyright: true,
    description: "",
    links: [],
    ...overrides,
  };
}

function photo(overrides: Partial<PhotoVM> = {}): PhotoVM {
  return {
    id: "1",
    path: "/album/photo",
    title: "Photo",
    visibility: "public",
    takenAt: null,
    thumbnail: {
      fallback: {
        src: "/photo.jpg",
        storageKey: "photo.jpg",
        width: 10,
        height: 10,
        format: "jpeg",
        byteSize: null,
      },
      alternates: [],
    },
    preview: null,
    original: null,
    ...overrides,
  };
}

describe("copyrightOf", () => {
  it("uses the photo's own credits and date when the photo carries them", () => {
    const result = copyrightOf(
      photo({
        takenAt: "2024-05-01T00:00:00Z",
        credits: [credit({ displayName: "Photo owner" })],
      }),
      { credits: [credit({ displayName: "Album owner" })], date: "2020-01-01" },
    );
    expect(result.year).toBe("2024");
    expect(result.holders.map((h) => h.displayName)).toEqual(["Photo owner"]);
  });

  it("falls back to the album's credits and date when the photo carries none", () => {
    const result = copyrightOf(photo({ takenAt: null }), {
      credits: [credit({ displayName: "Album owner" })],
      date: "2020-01-01",
    });
    expect(result.year).toBe("2020");
    expect(result.holders.map((h) => h.displayName)).toEqual(["Album owner"]);
  });

  it("excludes a non-copyright credit (e.g. a director) from the holders", () => {
    const result = copyrightOf(null, {
      credits: [
        credit({ displayName: "Director", isCopyright: false }),
        credit({ displayName: "Photographer", isCopyright: true }),
      ],
      date: "2020-01-01",
    });
    expect(result.holders.map((h) => h.displayName)).toEqual(["Photographer"]);
  });

  it("has no year when neither the photo nor the album has a date", () => {
    const result = copyrightOf(photo({ takenAt: null }), {
      credits: [credit()],
      date: null,
    });
    expect(result.year).toBe("");
  });
});

describe("copyrightStatement", () => {
  it("formats the year and holders", () => {
    expect(
      copyrightStatement(photo({ takenAt: "2024-05-01T00:00:00Z" }), {
        credits: [
          credit({ displayName: "Jane" }),
          credit({ displayName: "John" }),
        ],
        date: null,
      }),
    ).toBe("© 2024 Jane, John");
  });

  it("is empty when nobody holds copyright", () => {
    expect(copyrightStatement(null, { credits: [], date: "2020-01-01" })).toBe(
      "",
    );
  });

  it("omits the year, without a stray double space, when there is no date", () => {
    expect(
      copyrightStatement(photo({ takenAt: null }), {
        credits: [credit({ displayName: "Jane" })],
        date: null,
      }),
    ).toBe("© Jane");
  });
});
