import { describe, expect, it } from "vitest";

import type { AlbumPageVM, MediaSet, PhotoVM } from "./types";
import type { Viewer } from "./viewer";
import { applyVisibility } from "./visibility";

const anonymous: Viewer = { kind: "anonymous" };
const admin: Viewer = {
  kind: "user",
  userId: "admin",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
};
const rootOwner: Viewer = {
  kind: "user",
  userId: "root-owner",
  name: "Root owner",
  isPhotographer: true,
  isAdmin: false,
};
const otherOwner: Viewer = {
  kind: "user",
  userId: "other-owner",
  name: "Other owner",
  isPhotographer: true,
  isAdmin: false,
};

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

function photo(overrides: Partial<PhotoVM> = {}): PhotoVM {
  return {
    id: "photo",
    path: "/root/other-album/photo",
    title: "Photo",
    visibility: "public",
    takenAt: null,
    thumbnail: media,
    preview: null,
    original: null,
    ...overrides,
  };
}

function timeline(photos: PhotoVM[]): AlbumPageVM {
  return {
    kind: "timeline",
    id: "root",
    parentId: null,
    path: "/root",
    title: "Root",
    description: "",
    body: "",
    eventMetadataUrl: "",
    cover: null,
    date: null,
    layout: "simple",
    visibility: "public",
    effectiveVisibility: "public",
    contactable: false,
    ownerId: "root-owner",
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: [],
    subalbums: [],
    photos,
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
  };
}

describe("applyVisibility with a flattened, multi-owner photo list (timeline)", () => {
  it("falls back to the page album's own owner when a photo carries none", () => {
    const vm = timeline([photo({ visibility: "private" })]);
    expect(applyVisibility(vm, rootOwner)?.photos).toHaveLength(1);
    expect(applyVisibility(vm, otherOwner)?.photos).toHaveLength(0);
  });

  it("uses a photo's own containing-album owner instead of the page album's", () => {
    const vm = timeline([
      photo({ visibility: "private", ownerId: "other-owner" }),
    ]);
    expect(applyVisibility(vm, rootOwner)?.photos).toHaveLength(0);
    expect(applyVisibility(vm, otherOwner)?.photos).toHaveLength(1);
    expect(applyVisibility(vm, admin)?.photos).toHaveLength(1);
  });

  it("hides a photo governed by a hidden descendant from anonymous visitors even though the page album is public", () => {
    const vm = timeline([
      photo({ visibility: "hidden", ownerId: "other-owner" }),
    ]);
    expect(applyVisibility(vm, anonymous)?.photos).toHaveLength(0);
    expect(applyVisibility(vm, otherOwner)?.photos).toHaveLength(1);
  });

  it("strips ownerId from every surviving photo before it reaches the client", () => {
    const vm = timeline([photo({ ownerId: "other-owner" })]);
    const result = applyVisibility(vm, anonymous);
    expect(result?.photos[0]).not.toHaveProperty("ownerId");
  });
});
