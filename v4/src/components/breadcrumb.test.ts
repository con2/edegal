import { describe, expect, it } from "vitest";

import type { ClientAlbumPage, MediaSet, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

import { crumbTitle, documentTitle, fullBreadcrumb } from "./breadcrumb";

const messages: Translations["BreadcrumbBar"] = {
  downloadAlbumLink: "Download whole album",
  aboutPhotographerLink: "About the photographer",
  photographers: "Photographers",
  timeline: "Timeline",
};

const media: MediaSet = {
  fallback: {
    src: "/photo.jpg",
    storageKey: "photo.jpg",
    width: 10,
    height: 10,
    format: "jpeg",
    byteSize: null,
  },
  alternates: [],
};

function photo(path: string, title: string): PhotoVM {
  return {
    id: path,
    path,
    title,
    visibility: "public",
    takenAt: null,
    thumbnail: media,
    preview: null,
    original: null,
  };
}

function album(overrides: Partial<ClientAlbumPage> = {}): ClientAlbumPage {
  return {
    kind: "album",
    id: "1",
    path: "/root",
    title: "Root album",
    description: "",
    body: "",
    cover: null,
    date: null,
    layout: "simple",
    visibility: "public",
    effectiveVisibility: "public",
    contactable: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: [{ path: "/", title: "Site" }],
    subalbums: [],
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    ...overrides,
  };
}

describe("fullBreadcrumb", () => {
  it("appends the album, then the photo, for a normal album", () => {
    const crumbs = fullBreadcrumb(album(), photo("/root/p", "A photo"));
    expect(crumbs.map((c) => c.path)).toEqual(["/", "/root", "/root/p"]);
  });

  it("inserts a synthetic timeline crumb between the album and the photo", () => {
    const crumbs = fullBreadcrumb(
      album({ kind: "timeline" }),
      photo("/root/sub/p", "A photo"),
    );
    expect(crumbs.map((c) => c.path)).toEqual([
      "/",
      "/root",
      "/root?timeline",
      "/root/sub/p",
    ]);
  });

  it("omits the timeline crumb for a normal album", () => {
    const crumbs = fullBreadcrumb(album(), null);
    expect(crumbs.some((c) => c.path.endsWith("?timeline"))).toBe(false);
  });
});

describe("crumbTitle", () => {
  it("resolves the synthetic timeline crumb's title from messages, not its own empty title", () => {
    expect(crumbTitle({ path: "/root?timeline", title: "" }, messages)).toBe(
      "Timeline",
    );
  });

  it("otherwise uses the crumb's own title", () => {
    expect(crumbTitle({ path: "/root", title: "Root album" }, messages)).toBe(
      "Root album",
    );
  });
});

describe("documentTitle", () => {
  it("includes Timeline in the page title for a timeline page", () => {
    expect(documentTitle(album({ kind: "timeline" }), null, messages)).toBe(
      "Site » Root album » Timeline",
    );
  });
});
