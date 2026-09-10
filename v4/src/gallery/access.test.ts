import { describe, expect, it } from "vitest";

import {
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
  canList,
  canUpload,
  canView,
} from "./access";
import type { Viewer } from "./viewer";

const anonymous: Viewer = { kind: "anonymous" };
const photographer: Viewer = {
  kind: "user",
  userId: "p1",
  name: "P",
  isPhotographer: true,
  isAdmin: false,
};
const owner: Viewer = {
  kind: "user",
  userId: "owner",
  name: "O",
  isPhotographer: true,
  isAdmin: false,
};
const admin: Viewer = {
  kind: "user",
  userId: "a1",
  name: "A",
  isPhotographer: true,
  isAdmin: true,
};

const v4 = (visibility: "public" | "hidden" | "private") => ({
  source: "v4" as const,
  visibility,
  ownerId: "owner",
});
const legacy = (visibility: "public" | "hidden" | "private") => ({
  source: "legacy" as const,
  visibility,
  ownerId: null,
});

describe("canView", () => {
  it("lets everyone view public and hidden content", () => {
    expect(canView(anonymous, v4("public"))).toBe(true);
    expect(canView(anonymous, v4("hidden"))).toBe(true);
    expect(canView(anonymous, legacy("hidden"))).toBe(true);
  });

  it("restricts private v4 content to the owner and admins", () => {
    expect(canView(anonymous, v4("private"))).toBe(false);
    expect(canView(photographer, v4("private"))).toBe(false);
    expect(canView(owner, v4("private"))).toBe(true);
    expect(canView(admin, v4("private"))).toBe(true);
  });

  it("restricts private legacy content to staff, like Django's is_staff", () => {
    expect(canView(anonymous, legacy("private"))).toBe(false);
    expect(canView(photographer, legacy("private"))).toBe(true);
  });
});

describe("canList", () => {
  it("lists hidden content only for those who could edit it", () => {
    expect(canList(anonymous, v4("hidden"))).toBe(false);
    expect(canList(photographer, v4("hidden"))).toBe(false);
    expect(canList(owner, v4("hidden"))).toBe(true);
    expect(canList(admin, v4("hidden"))).toBe(true);
    expect(canList(photographer, legacy("hidden"))).toBe(true);
  });
});

describe("editing", () => {
  it("never allows editing legacy albums through v4", () => {
    expect(canEditAlbum(admin, { source: "legacy", ownerId: null })).toBe(
      false,
    );
  });

  it("allows owners and admins to edit, and open albums to accept subalbums from photographers", () => {
    expect(canEditAlbum(owner, { source: "v4", ownerId: "owner" })).toBe(true);
    expect(canEditAlbum(photographer, { source: "v4", ownerId: "owner" })).toBe(
      false,
    );
    expect(
      canCreateSubalbum(photographer, {
        source: "v4",
        ownerId: "owner",
        isOpenForSubalbums: false,
      }),
    ).toBe(false);
    expect(
      canCreateSubalbum(photographer, {
        source: "v4",
        ownerId: "owner",
        isOpenForSubalbums: true,
      }),
    ).toBe(true);
    expect(
      canCreateSubalbum(anonymous, {
        source: "v4",
        ownerId: "owner",
        isOpenForSubalbums: true,
      }),
    ).toBe(false);
  });

  it("never deletes the root album and ties uploads to editing", () => {
    expect(
      canDeleteAlbum(admin, { source: "v4", ownerId: "owner", path: "/" }),
    ).toBe(false);
    expect(
      canDeleteAlbum(owner, { source: "v4", ownerId: "owner", path: "/x" }),
    ).toBe(true);
    expect(
      canDeleteAlbum(photographer, {
        source: "v4",
        ownerId: "owner",
        path: "/x",
      }),
    ).toBe(false);
    expect(canUpload(owner, { source: "v4", ownerId: "owner" })).toBe(true);
    expect(canUpload(admin, { source: "legacy", ownerId: null })).toBe(false);
  });
});
