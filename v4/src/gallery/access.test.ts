import { describe, expect, it } from "vitest";

import {
  mostRestrictive,
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
  canList,
  canSeePhoto,
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

const guard = (visibility: "public" | "hidden" | "private") => ({
  visibility,
  ownerId: "owner",
});

describe("canView", () => {
  it("lets everyone view public and hidden content", () => {
    expect(canView(anonymous, guard("public"))).toBe(true);
    expect(canView(anonymous, guard("hidden"))).toBe(true);
  });

  it("restricts private content to the owner and admins", () => {
    expect(canView(anonymous, guard("private"))).toBe(false);
    expect(canView(photographer, guard("private"))).toBe(false);
    expect(canView(owner, guard("private"))).toBe(true);
    expect(canView(admin, guard("private"))).toBe(true);
  });
});

describe("canList", () => {
  it("lists hidden content only for those who could edit it", () => {
    expect(canList(anonymous, guard("hidden"))).toBe(false);
    expect(canList(photographer, guard("hidden"))).toBe(false);
    expect(canList(owner, guard("hidden"))).toBe(true);
    expect(canList(admin, guard("hidden"))).toBe(true);
  });
});

describe("canSeePhoto", () => {
  it("shows non-public photos only to the album owner and admins", () => {
    expect(canSeePhoto(owner, { ownerId: "owner" }, "private")).toBe(true);
    expect(canSeePhoto(admin, { ownerId: "owner" }, "hidden")).toBe(true);
    expect(canSeePhoto(photographer, { ownerId: "owner" }, "private")).toBe(
      false,
    );
    expect(canSeePhoto(photographer, { ownerId: "owner" }, "hidden")).toBe(
      false,
    );
    expect(canSeePhoto(anonymous, { ownerId: "owner" }, "public")).toBe(true);
  });
});

describe("editing", () => {
  it("allows owners and admins to edit, and open albums to accept subalbums from photographers", () => {
    expect(canEditAlbum(owner, { ownerId: "owner" })).toBe(true);
    expect(canEditAlbum(photographer, { ownerId: "owner" })).toBe(false);
    expect(
      canCreateSubalbum(photographer, {
        ownerId: "owner",
        isOpenForSubalbums: false,
      }),
    ).toBe(false);
    expect(
      canCreateSubalbum(photographer, {
        ownerId: "owner",
        isOpenForSubalbums: true,
      }),
    ).toBe(true);
    expect(
      canCreateSubalbum(anonymous, {
        ownerId: "owner",
        isOpenForSubalbums: true,
      }),
    ).toBe(false);
  });

  it("never deletes the root album and ties uploads to editing", () => {
    expect(canDeleteAlbum(admin, { ownerId: "owner", path: "/" })).toBe(false);
    expect(canDeleteAlbum(owner, { ownerId: "owner", path: "/x" })).toBe(true);
    expect(canDeleteAlbum(photographer, { ownerId: "owner", path: "/x" })).toBe(
      false,
    );
    expect(canUpload(owner, { ownerId: "owner" })).toBe(true);
  });
});

describe("mostRestrictive", () => {
  it("picks private over hidden over public, public when empty", () => {
    expect(mostRestrictive([])).toBe("public");
    expect(mostRestrictive(["public", "hidden", "public"])).toBe("hidden");
    expect(mostRestrictive(["hidden", "private", "public"])).toBe("private");
  });
});
