import { describe, expect, it } from "vitest";

import type { ClientAlbumPage } from "@/gallery/types";

import { albumReadme } from "./readme";

const album: ClientAlbumPage = {
  source: "v4",
  kind: "album",
  id: "album-1",
  path: "/event/saturday",
  title: "Saturday",
  description: "",
  body: { kind: "markdown", text: "" },
  date: "2026-09-05",
  layout: "simple",
  visibility: "public",
  effectiveVisibility: "public",
  contactable: false,
  cover: null,
  isDownloadable: true,
  photosProcessing: 0,
  hasManualOrdering: false,
  breadcrumb: [],
  subalbums: [],
  photos: [],
  credits: [
    {
      displayName: "Shooter",
      path: null,
      isCopyright: true,
      description: "",
      links: [
        { href: "https://www.instagram.com/shooter", title: "Instagram" },
      ],
    },
    {
      displayName: "Helper",
      path: null,
      isCopyright: false,
      description: "lighting",
      links: [],
    },
  ],
  terms: {
    kind: "markdown",
    text: "Credit the photographer.",
    url: "https://example.com/terms",
  },
  previousInSeries: null,
  nextInSeries: null,
  redirectUrl: null,
  legacyAdminUrl: null,
};

describe("albumReadme", () => {
  it("lists title, url, credits with links, and terms", () => {
    expect(albumReadme(album, "https://uusi.example.fi/event/saturday")).toBe(
      [
        "Saturday",
        "https://uusi.example.fi/event/saturday",
        "",
        "Photographer: Shooter",
        "Instagram: https://www.instagram.com/shooter",
        "",
        "lighting: Helper",
        "",
        "Credit the photographer.",
        "",
        "https://example.com/terms",
        "",
      ].join("\n"),
    );
  });

  it("omits empty sections", () => {
    expect(
      albumReadme({ ...album, credits: [], terms: null }, "https://x/y"),
    ).toBe("Saturday\nhttps://x/y\n");
  });
});
