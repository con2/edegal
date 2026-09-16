export type SwipeDirection = "next" | "previous";

export interface Point {
  x: number;
  y: number;
}

export const swipeMinDistance = 50;
export const swipeAxisRatio = 1.5;

/**
 * Classifies a touch gesture from its start and end points. Returns null for taps,
 * vertical drags and diagonals that are not predominantly horizontal.
 */
export function swipeDirection(
  start: Point,
  end: Point,
): SwipeDirection | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < swipeMinDistance) return null;
  if (Math.abs(dx) <= swipeAxisRatio * Math.abs(dy)) return null;
  return dx < 0 ? "next" : "previous";
}
