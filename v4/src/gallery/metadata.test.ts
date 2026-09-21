import { describe, expect, it } from "vitest";

import type {
  AlbumPageVM,
  ClientAlbumPage,
  ClientSubalbum,
  CreditVM,
  GalleryPageResult,
  MediaSet,
  PhotoVM,
} from "./types";

import { galleryMetadata } from "./metadata";

const media = (key: string): MediaSet => ({
  fallback: {
    src: `/${key}.jpg`,
    storageKey: `${key}.jpg`,
    width: 10,
    height: 10,
    format: "jpeg",
    byteSize: null,
  },
  alternates: [],
});

function credit(displayName: string): CreditVM {
  return {
    displayName,
    path: null,
    isCopyright: true,
    description: "",
    links: [],
  };
}

function photo(overrides: Partial<PhotoVM> = {}): PhotoVM {
  return {
    id: overrides.path ?? "1",
    path: "/album/photo",
    title: "Photo",
    visibility: "public",
    takenAt: "2024-05-01T00:00:00Z",
    thumbnail: media("thumbnail"),
    preview: media("preview"),
    original: null,
    ...overrides,
  };
}

function subalbum(overrides: Partial<ClientSubalbum> = {}): ClientSubalbum {
  return {
    path: "/album/sub",
    title: "Sub",
    date: null,
    visibility: "public",
    thumbnail: media("subalbum-thumbnail"),
    externalUrl: null,
    ...overrides,
  };
}

function album(overrides: Partial<ClientAlbumPage> = {}): ClientAlbumPage {
  return {
    kind: "album",
    id: "1",
    path: "/album",
    title: "Album title",
    description: "",
    body: "",
    eventMetadataUrl: "",
    cover: null,
    date: "2020-01-01",
    layout: "simple",
    visibility: "public",
    effectiveVisibility: "public",
    contactable: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: [],
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

function ok(
  album: ClientAlbumPage,
  photo: PhotoVM | null = null,
): GalleryPageResult {
  return {
    kind: "ok",
    album,
    // galleryMetadata never reads `unfiltered`; a `ClientAlbumPage` stands in for the full
    // server-side `AlbumPageVM` it would otherwise have to be.
    unfiltered: album as unknown as AlbumPageVM,
    requestedPath: album.path,
    photo,
  };
}

describe("galleryMetadata description", () => {
  it("uses the selected photo's own copyright statement in picture view", () => {
    const meta = galleryMetadata(
      "en",
      ok(
        album({ credits: [credit("Album owner")] }),
        photo({ credits: [credit("Photo owner")] }),
      ),
    );
    expect(meta.description).toBe("© 2024 Photo owner");
  });

  it("attributes an album page (no photo selected) to its own first photo", () => {
    const meta = galleryMetadata(
      "en",
      ok(
        album({
          credits: [credit("Album owner")],
          photos: [
            photo({ path: "/album/first" }),
            photo({ path: "/album/second" }),
          ],
        }),
      ),
    );
    expect(meta.description).toBe("© 2024 Album owner");
  });

  it("attributes a timeline page to its chronologically first photo", () => {
    const meta = galleryMetadata(
      "en",
      ok(
        album({
          kind: "timeline",
          photos: [
            photo({
              path: "/album/day-1/first",
              takenAt: "2023-01-01T00:00:00Z",
              credits: [credit("Day one photographer")],
            }),
          ],
        }),
      ),
    );
    expect(meta.description).toBe("© 2023 Day one photographer");
  });

  it("falls back to the album's own description, then its title, with no photo to attribute", () => {
    const withDescription = galleryMetadata(
      "en",
      ok(album({ description: "A hand-written description" })),
    );
    expect(withDescription.description).toBe("A hand-written description");

    const withoutDescription = galleryMetadata("en", ok(album()));
    expect(withoutDescription.description).toBe("Album title");
  });
});

describe("galleryMetadata Open Graph image", () => {
  it("prefers a subalbum thumbnail over the album's own first photo when both exist", () => {
    const meta = galleryMetadata(
      "en",
      ok(
        album({
          subalbums: [subalbum()],
          photos: [photo()],
        }),
      ),
    );
    expect(meta.openGraph).toMatchObject({
      images: [expect.objectContaining({ url: "/subalbum-thumbnail.jpg" })],
    });
  });

  it("falls back to the album's own first photo when there is no subalbum thumbnail", () => {
    // A timeline never has subalbums, so this is the case that used to have no image at all.
    const meta = galleryMetadata(
      "en",
      ok(album({ kind: "timeline", photos: [photo()] })),
    );
    expect(meta.openGraph).toMatchObject({
      images: [expect.objectContaining({ url: "/preview.jpg" })],
    });
  });
});
