import { useRef, useState } from 'react';

import useEvent from './useEvent';
import type { UseEventParams } from './useEvent';

export type Delta = {
  x: number;
  y: number;
};

type Props = Pick<UseEventParams, 'elem'> & {
  onDrag: (delta: Delta, e: PointerEvent) => void;
  onDragStart?: (e: PointerEvent) => void;
  onDragEnd?: (e: PointerEvent) => void;
  isActive?: boolean;
};

export default function useElemDrag({
  elem,
  onDrag,
  onDragStart,
  onDragEnd,
  isActive = true,
}: Props): { isDragging: boolean } {
  const state = useRef({ startX: 0, startY: 0, x: 0, y: 0, isDragging: false });
  const [isDragging, setIsDragging] = useState(false);
  const isStarted = useRef(false);
  const pointerTypeRef = useRef<PointerEvent['pointerType'] | null>(null);
  const hasDragIntentRef = useRef(false);
  const lastMoveRef = useRef({ x: 0, y: 0 });

  const dropDelta = () => {
    state.current.x = 0;
    state.current.y = 0;
    state.current.startX = 0;
    state.current.startY = 0;
  };

  const enable = () => {
    state.current.isDragging = true;
    dropDelta();
  };

  const onPointerDown = (e: Event) => {
    if (!(e instanceof PointerEvent)) return;
    dropDelta();
    isStarted.current = true;
    pointerTypeRef.current = e.pointerType;
    hasDragIntentRef.current = false;
    lastMoveRef.current = { x: e.clientX, y: e.clientY };
    onDragStart?.(e);
    state.current.startX = e.clientX;
    state.current.startY = e.clientY;
  };

  const onPointerMove = (e: Event) => {
    if (!(e instanceof PointerEvent)) return;
    if (!isStarted.current) {
      return;
    }

    const delta = {
      x: e.clientX - state.current.startX,
      y: e.clientY - state.current.startY,
    };
    const absDeltaX = Math.abs(delta.x);
    const absDeltaY = Math.abs(delta.y);

    const recentDelta = {
      x: e.clientX - lastMoveRef.current.x,
      y: e.clientY - lastMoveRef.current.y,
    };
    const absRecentDeltaX = Math.abs(recentDelta.x);
    const absRecentDeltaY = Math.abs(recentDelta.y);

    const isTouch = pointerTypeRef.current === 'touch';
    const isHorizontalDrag = absDeltaX > absDeltaY * 1.5 && absDeltaX > 6;
    const isVerticalDrag = absDeltaY > absDeltaX * 1.5 && absDeltaY > 6;

    // Cancel drag if it was started horizontally but then moves vertically (to allow scrolling)
    // Only apply this if drag was already started (hasDragIntentRef.current is true)
    if (
      isTouch &&
      hasDragIntentRef.current &&
      isHorizontalDrag &&
      absRecentDeltaY > absRecentDeltaX * 2 &&
      absRecentDeltaY > 3
    ) {
      hasDragIntentRef.current = false;
      state.current.isDragging = false;
      setIsDragging(false);
      lastMoveRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Allow dragging to start if:
    // - Not touch (mouse/pen), OR
    // - Horizontal drag detected, OR
    // - Vertical drag detected (fix for mobile), OR
    // - Drag intent already established
    const shouldStartDrag =
      !isTouch ||
      isHorizontalDrag ||
      isVerticalDrag ||
      hasDragIntentRef.current;

    if (shouldStartDrag) {
      hasDragIntentRef.current = true;
      e.stopPropagation();
      e.preventDefault();
    } else {
      lastMoveRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    lastMoveRef.current = { x: e.clientX, y: e.clientY };
    state.current.isDragging = true;
    setIsDragging(true);
    onDrag?.(delta, e);
  };

  const onPointerEnd = (e: Event) => {
    if (!(e instanceof PointerEvent)) return;
    if (state.current.isDragging) onDragEnd?.(e);

    isStarted.current = false;
    state.current.isDragging = false;
    setIsDragging(false);

    dropDelta();
  };

  useEvent({
    elem,
    event: 'pointerdown',
    callback: onPointerDown,
    isActive,
  });

  useEvent({
    event: 'pointermove',
    callback: onPointerMove,
    isActive,
  });

  useEvent({
    event: ['pointerup', 'pointercancel'],
    callback: onPointerEnd,
    isActive,
  });

  return { isDragging };
}
