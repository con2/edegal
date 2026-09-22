export type SwipeDirection = "next" | "previous";

export interface Point {
  x: number;
  y: number;
}

export type Axis = "x" | "y";

export const swipeMinDistance = 50;
export const swipeAxisRatio = 1.5;
/** Touch movement below this, in either axis, is too small to tell a tap from a drag. */
export const dragLockSlop = 10;
/** Below `swipeMinDistance`, a release still commits if it was at least this fast (px/ms). */
export const flickVelocity = 0.5;
/** Dragging toward a missing neighbour moves the photo by this fraction of the finger's motion. */
export const edgeResistance = 0.3;
export const settleMilliseconds = 250;

export interface DragContext {
  stageWidth: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DragState extends DragContext {
  start: Point;
  last: Point;
  lastTime: number;
  axis: Axis | null;
  dx: number;
  /** Exponentially smoothed horizontal speed, in px/ms; signed the same way as `dx`. */
  velocity: number;
}

export type Settle =
  | { kind: "commit"; direction: SwipeDirection; offset: number }
  | { kind: "cancel"; offset: 0 };

const velocitySmoothing = 0.5;

export function beginDrag(
  point: Point,
  time: number,
  context: DragContext,
): DragState {
  return {
    ...context,
    start: point,
    last: point,
    lastTime: time,
    axis: null,
    dx: 0,
    velocity: 0,
  };
}

/** Decides the axis once movement clears `dragLockSlop`; a locked axis never changes. */
function lockAxis(dx: number, dy: number): Axis | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < dragLockSlop) return null;
  return Math.abs(dx) > swipeAxisRatio * Math.abs(dy) ? "x" : "y";
}

export function moveDrag(
  state: DragState,
  point: Point,
  time: number,
): DragState {
  const dx = point.x - state.start.x;
  const dy = point.y - state.start.y;
  const axis = state.axis ?? lockAxis(dx, dy);
  const elapsed = time - state.lastTime;
  const instantVelocity =
    elapsed > 0 ? (point.x - state.last.x) / elapsed : state.velocity;
  const velocity =
    state.velocity + velocitySmoothing * (instantVelocity - state.velocity);
  return { ...state, last: point, lastTime: time, axis, dx, velocity };
}

/** The live horizontal offset to render for the track, including edge resistance. */
export function dragOffset(state: DragState): number {
  if (state.axis !== "x") return 0;
  const towardMissingNeighbour =
    (state.dx < 0 && !state.hasNext) || (state.dx > 0 && !state.hasPrevious);
  return towardMissingNeighbour ? state.dx * edgeResistance : state.dx;
}

export function settleDrag(state: DragState): Settle {
  if (state.axis !== "x") return { kind: "cancel", offset: 0 };
  const distanceCommits = Math.abs(state.dx) >= swipeMinDistance;
  const flickCommits =
    Math.abs(state.velocity) >= flickVelocity &&
    Math.sign(state.velocity) === Math.sign(state.dx);
  if (!distanceCommits && !flickCommits) return { kind: "cancel", offset: 0 };
  if (state.dx < 0) {
    if (!state.hasNext) return { kind: "cancel", offset: 0 };
    return { kind: "commit", direction: "next", offset: -state.stageWidth };
  }
  if (!state.hasPrevious) return { kind: "cancel", offset: 0 };
  return { kind: "commit", direction: "previous", offset: state.stageWidth };
}
