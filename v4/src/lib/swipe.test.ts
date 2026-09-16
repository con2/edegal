import { describe, expect, it } from "vitest";

import { swipeDirection } from "./swipe";

describe("swipeDirection", () => {
  it("recognizes a left swipe as next", () => {
    expect(swipeDirection({ x: 300, y: 100 }, { x: 200, y: 100 })).toBe("next");
  });

  it("recognizes a right swipe as previous", () => {
    expect(swipeDirection({ x: 200, y: 100 }, { x: 300, y: 100 })).toBe(
      "previous",
    );
  });

  it("ignores a short drag below the distance threshold", () => {
    expect(swipeDirection({ x: 200, y: 100 }, { x: 230, y: 100 })).toBeNull();
  });

  it("ignores a mostly vertical drag", () => {
    expect(swipeDirection({ x: 200, y: 100 }, { x: 220, y: 300 })).toBeNull();
  });

  it("ignores a diagonal drag that is not predominantly horizontal", () => {
    expect(swipeDirection({ x: 200, y: 100 }, { x: 260, y: 180 })).toBeNull();
  });

  it("recognizes a swipe exactly at the distance threshold", () => {
    expect(swipeDirection({ x: 200, y: 100 }, { x: 150, y: 100 })).toBe("next");
  });
});
