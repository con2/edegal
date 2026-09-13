import { describe, expect, it } from "vitest";

import { neighboursOf, orderSeriesMembers } from "./series";

const members = [
  { path: "/run-1", title: "Run 1", date: "2024-01-01", visibility: "public" },
  { path: "/run-2", title: "Run 2", date: "2024-06-01", visibility: "public" },
  { path: "/run-3", title: "Run 3", date: "2025-01-01", visibility: "private" },
  { path: "/run-4", title: "Run 4", date: "2025-06-01", visibility: "hidden" },
  { path: "/undated", title: "Undated", date: null, visibility: "public" },
];

describe("orderSeriesMembers", () => {
  it("orders newest first with unknown dates last", () => {
    expect(
      orderSeriesMembers([...members].reverse()).map((m) => m.path),
    ).toEqual(["/run-4", "/run-3", "/run-2", "/run-1", "/undated"]);
  });
});

describe("neighboursOf", () => {
  it("links previous (older) and next (newer) members", () => {
    expect(neighboursOf(members, "/run-2")).toEqual({
      previous: { path: "/run-1", title: "Run 1" },
      // Run 3 is private and skipped; the hidden Run 4 is still linkable by URL.
      next: { path: "/run-4", title: "Run 4" },
    });
  });

  it("has no next at the newest and no previous at the oldest", () => {
    expect(neighboursOf(members, "/run-4").next).toBeNull();
    expect(neighboursOf(members, "/undated").previous).toBeNull();
  });

  // A private member still sees its own neighbours; only links towards it are withheld.
  it("computes neighbours for a private member itself", () => {
    expect(neighboursOf(members, "/run-3")).toEqual({
      previous: { path: "/run-2", title: "Run 2" },
      next: { path: "/run-4", title: "Run 4" },
    });
  });

  it("returns nothing for a path outside the series", () => {
    expect(neighboursOf(members, "/elsewhere")).toEqual({
      previous: null,
      next: null,
    });
  });
});
