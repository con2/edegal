import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

import {
  beginDrag,
  dragOffset,
  moveDrag,
  settleDrag,
  settleMilliseconds,
  type DragState,
  type SwipeDirection,
} from "@/lib/swipe";

type Phase =
  | { kind: "idle" }
  | { kind: "dragging"; drag: DragState }
  | { kind: "settling"; direction: SwipeDirection | null };

interface UsePictureDragOptions {
  stageRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  hasPrevious: boolean;
  hasNext: boolean;
  /** False while a dialog is open; touches are ignored entirely. */
  enabled: boolean;
  /** Any change resyncs the track to its resting position, discarding an in-flight gesture. */
  index: number;
  onCommit: (direction: SwipeDirection) => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isZoomedIn(): boolean {
  return (window.visualViewport?.scale ?? 1) > 1;
}

/** Wires touch gestures on `.PictureView` to a follow-the-finger drag of `.PictureView-track`. */
export function usePictureDrag({
  stageRef,
  trackRef,
  hasPrevious,
  hasNext,
  enabled,
  index,
  onCommit,
}: UsePictureDragOptions) {
  const phaseRef = useRef<Phase>({ kind: "idle" });
  const settleTimerRef = useRef<number | null>(null);
  /** The offset last written to the track, so a settle can tell "already there" from "must animate". */
  const currentOffsetRef = useRef(0);

  const write = useCallback(
    (offset: number, animate: boolean) => {
      currentOffsetRef.current = offset;
      const track = trackRef.current;
      if (!track) return;
      track.style.transition =
        animate && !prefersReducedMotion()
          ? `transform ${settleMilliseconds}ms ease-out`
          : "none";
      track.style.transform = `translateX(${offset}px)`;
    },
    [trackRef],
  );

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  /** Ends a settle immediately: commits if it was heading to a neighbour, then goes idle. */
  const finishSettle = useCallback(() => {
    clearSettleTimer();
    const phase = phaseRef.current;
    if (phase.kind !== "settling") return;
    phaseRef.current = { kind: "idle" };
    if (phase.direction) onCommit(phase.direction);
  }, [clearSettleTimer, onCommit]);

  const beginSettle = useCallback(
    (offset: number, direction: SwipeDirection | null) => {
      clearSettleTimer();
      if (currentOffsetRef.current === offset) {
        // The track is already where it needs to be (a tap, or a drag released exactly on target):
        // no transform change means no transitionend will ever fire.
        phaseRef.current = { kind: "idle" };
        if (direction) onCommit(direction);
        return;
      }
      phaseRef.current = { kind: "settling", direction };
      write(offset, true);
      if (prefersReducedMotion()) {
        finishSettle();
        return;
      }
      // Fallback for a transitionend the browser drops, e.g. a backgrounded tab.
      settleTimerRef.current = window.setTimeout(
        finishSettle,
        settleMilliseconds + 50,
      );
    },
    [clearSettleTimer, finishSettle, onCommit, write],
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || event.touches.length !== 1 || isZoomedIn()) return;
      if (phaseRef.current.kind === "settling") finishSettle();
      const stageWidth = stageRef.current?.clientWidth ?? 0;
      const { clientX, clientY } = event.touches[0];
      const drag = beginDrag({ x: clientX, y: clientY }, event.timeStamp, {
        stageWidth,
        hasPrevious,
        hasNext,
      });
      phaseRef.current = { kind: "dragging", drag };
    },
    [enabled, finishSettle, hasNext, hasPrevious, stageRef],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      const phase = phaseRef.current;
      if (phase.kind !== "dragging") return;
      if (event.touches.length > 1) {
        beginSettle(0, null);
        return;
      }
      const { clientX, clientY } = event.touches[0];
      const drag = moveDrag(
        phase.drag,
        { x: clientX, y: clientY },
        event.timeStamp,
      );
      phaseRef.current = { kind: "dragging", drag };
      write(dragOffset(drag), false);
    },
    [beginSettle, write],
  );

  const onTouchEnd = useCallback(() => {
    const phase = phaseRef.current;
    if (phase.kind !== "dragging") return;
    const settle = settleDrag(phase.drag);
    beginSettle(
      settle.offset,
      settle.kind === "commit" ? settle.direction : null,
    );
  }, [beginSettle]);

  const onTouchCancel = useCallback(() => {
    if (phaseRef.current.kind !== "dragging") return;
    beginSettle(0, null);
  }, [beginSettle]);

  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "transform") return;
      finishSettle();
    },
    [finishSettle],
  );

  // Any navigation - a commit, the keyboard, a chevron click or the slideshow timer - lands on a
  // new index. Resync the track to its resting position before paint so the transform never
  // visibly jumps: the outgoing arrangement at -stageWidth/+stageWidth and the incoming one at 0
  // show the same photo in the same place.
  useLayoutEffect(() => {
    clearSettleTimer();
    phaseRef.current = { kind: "idle" };
    write(0, false);
  }, [index, clearSettleTimer, write]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onTransitionEnd,
  };
}
