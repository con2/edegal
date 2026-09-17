import { describe, expect, it } from "vitest";

import {
  beginDrag,
  dragLockSlop,
  dragOffset,
  edgeResistance,
  flickVelocity,
  moveDrag,
  settleDrag,
  swipeMinDistance,
  type DragContext,
} from "./swipe";

const context: DragContext = {
  stageWidth: 400,
  hasPrevious: true,
  hasNext: true,
};

describe("beginDrag", () => {
  it("starts with no locked axis, no movement and no velocity", () => {
    const state = beginDrag({ x: 100, y: 100 }, 0, context);
    expect(state.axis).toBeNull();
    expect(state.dx).toBe(0);
    expect(state.velocity).toBe(0);
  });
});

describe("moveDrag", () => {
  it("keeps the axis unlocked, and the offset at zero, below the lock slop", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 100 + dragLockSlop / 2, y: 100 }, 10);
    expect(state.axis).toBeNull();
    expect(dragOffset(state)).toBe(0);
  });

  it("locks the x axis for a predominantly horizontal move", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 130, y: 102 }, 10);
    expect(state.axis).toBe("x");
  });

  it("locks the y axis for a predominantly vertical move", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 102, y: 130 }, 10);
    expect(state.axis).toBe("y");
  });

  it("locks the y axis for a 45-degree move (axis ratio is 1.5)", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 120, y: 120 }, 10);
    expect(state.axis).toBe("y");
  });

  it("keeps a locked x axis even if the finger later drifts vertically", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 130, y: 102 }, 10);
    state = moveDrag(state, { x: 160, y: 160 }, 20);
    expect(state.axis).toBe("x");
    expect(dragOffset(state)).toBe(state.dx);
  });
});

describe("dragOffset", () => {
  it("stays at zero on a y-locked drag even with a large horizontal delta", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 200, y: 300 }, 10);
    expect(state.axis).toBe("y");
    expect(dragOffset(state)).toBe(0);
  });

  it("cancels a y-locked drag regardless of distance", () => {
    let state = beginDrag({ x: 100, y: 100 }, 0, context);
    state = moveDrag(state, { x: 200, y: 300 }, 10);
    expect(settleDrag(state)).toEqual({ kind: "cancel", offset: 0 });
  });

  it("applies edge resistance when dragging toward a missing neighbour", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, {
      ...context,
      hasNext: false,
    });
    state = moveDrag(state, { x: 100, y: 100 }, 10);
    expect(dragOffset(state)).toBeCloseTo(-100 * edgeResistance);
  });

  it("always cancels a drag toward a missing neighbour", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, {
      ...context,
      hasNext: false,
    });
    state = moveDrag(state, { x: 100, y: 100 }, 10);
    expect(settleDrag(state)).toEqual({ kind: "cancel", offset: 0 });
  });
});

describe("settleDrag", () => {
  it("commits to next on a slow left drag past the distance threshold", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 140, y: 100 }, 500);
    expect(settleDrag(state)).toEqual({
      kind: "commit",
      direction: "next",
      offset: -context.stageWidth,
    });
  });

  it("commits to previous on a slow right drag past the distance threshold", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 260, y: 100 }, 500);
    expect(settleDrag(state)).toEqual({
      kind: "commit",
      direction: "previous",
      offset: context.stageWidth,
    });
  });

  it("commits exactly at the distance threshold", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 200 - swipeMinDistance, y: 100 }, 500);
    expect(settleDrag(state)).toEqual({
      kind: "commit",
      direction: "next",
      offset: -context.stageWidth,
    });
  });

  it("cancels a short slow drag with no flick", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 170, y: 100 }, 500);
    expect(settleDrag(state)).toEqual({ kind: "cancel", offset: 0 });
  });

  it("commits a fast short flick below the distance threshold", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 170, y: 100 }, 20);
    expect(Math.abs(state.velocity)).toBeGreaterThanOrEqual(flickVelocity);
    expect(settleDrag(state)).toEqual({
      kind: "commit",
      direction: "next",
      offset: -context.stageWidth,
    });
  });

  it("cancels a flick whose velocity points opposite to the net drag", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    // Net movement is to the right, but the last, fast segment reverses direction.
    state = moveDrag(state, { x: 260, y: 100 }, 200);
    state = moveDrag(state, { x: 230, y: 100 }, 210);
    expect(state.dx).toBeGreaterThan(0);
    expect(state.velocity).toBeLessThan(0);
    expect(settleDrag(state)).toEqual({ kind: "cancel", offset: 0 });
  });
});

describe("velocity smoothing", () => {
  it("accumulates signed velocity across a sequence of moves", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 190, y: 100 }, 10);
    state = moveDrag(state, { x: 170, y: 100 }, 20);
    state = moveDrag(state, { x: 140, y: 100 }, 30);
    expect(state.velocity).toBeLessThan(0);
  });

  it("does not divide by zero when a move carries the same timestamp", () => {
    let state = beginDrag({ x: 200, y: 100 }, 0, context);
    state = moveDrag(state, { x: 190, y: 100 }, 10);
    const velocityBefore = state.velocity;
    state = moveDrag(state, { x: 180, y: 100 }, 10);
    expect(Number.isFinite(state.velocity)).toBe(true);
    expect(state.velocity).toBe(velocityBefore);
  });
});
