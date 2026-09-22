import { describe, expect, it } from "vitest";

import { timelineVM } from "./timeline";
import type { AlbumPageVM, MediaSet, PhotoVM } from "./types";

const media: MediaSet = {
  fallback: {
    src: "/photo.jpg",
    storageKey: "photo.jpg",
    width: 100,
    height: 100,
    format: "jpeg",
    byteSize: null,
  },
  alternates: [],
};

function photo(path: string): PhotoVM {
  return {
    id: path,
    path,
    title: path,
    visibility: "public",
    takenAt: null,
    thumbnail: media,
    preview: null,
    original: null,
  };
}

function shell(overrides: Partial<AlbumPageVM> = {}): AlbumPageVM {
  return {
    kind: "album",
    id: "1",
    parentId: null,
    path: "/root",
    title: "Root",
    description: "A description",
    body: "Some prose about the album",
    eventMetadataUrl: "",
    cover: null,
    date: null,
    layout: "simple",
    visibility: "public",
    effectiveVisibility: "public",
    contactable: false,
    ownerId: "owner",
    isOpenForSubalbums: false,
    isDownloadable: true,
    photosProcessing: 3,
    hasManualOrdering: true,
    breadcrumb: [{ path: "/", title: "Site" }],
    subalbums: [
      {
        path: "/root/child",
        title: "Child",
        date: null,
        visibility: "public",
        thumbnail: null,
        externalUrl: null,
        ownerId: null,
      },
    ],
    photos: [photo("/root/own-photo")],
    credits: [],
    terms: null,
    previousInSeries: { path: "/prev", title: "Prev" },
    nextInSeries: { path: "/next", title: "Next" },
    redirectUrl: null,
    ...overrides,
  };
}

describe("timelineVM", () => {
  it("replaces the shell's own photos and subalbums with the flattened list", () => {
    const flattened = [photo("/root/a/1"), photo("/root/b/2")];
    const result = timelineVM(shell(), flattened);
    expect(result.kind).toBe("timeline");
    expect(result.subalbums).toEqual([]);
    expect(result.photos).toBe(flattened);
  });

  it("blanks the album's own prose and series links, which describe one album, not a subtree", () => {
    const result = timelineVM(shell(), []);
    expect(result.body).toBe("");
    expect(result.previousInSeries).toBeNull();
    expect(result.nextInSeries).toBeNull();
  });

  it("does not track a per-album processing count, and drops manual ordering", () => {
    const result = timelineVM(shell(), []);
    expect(result.photosProcessing).toBe(0);
    expect(result.hasManualOrdering).toBe(false);
  });

  it("keeps everything else from the shell untouched", () => {
    const base = shell();
    const result = timelineVM(base, []);
    expect(result.title).toBe(base.title);
    expect(result.breadcrumb).toBe(base.breadcrumb);
    expect(result.effectiveVisibility).toBe(base.effectiveVisibility);
    expect(result.ownerId).toBe(base.ownerId);
    expect(result.path).toBe(base.path);
  });
});
