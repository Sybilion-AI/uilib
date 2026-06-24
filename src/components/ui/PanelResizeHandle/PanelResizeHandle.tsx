import { ComponentProps, useCallback, useRef } from 'react';

import {
  notifyPanelWidthDragEnd,
  notifyPanelWidthDragStart,
} from '#uilib/components/ui/SmartTextTruncate/SmartTextTruncate';
import useElemDrag, { Delta } from '#uilib/hooks/useDragElem';

export function PanelResizeHandle({
  className,
  edge,
  isActive,
  startWidthPx,
  getShellWidth,
  onDragWidth,
  onDragComplete,
  ...props
}: ComponentProps<'div'> & {
  edge: 'leading' | 'trailing';
  isActive: boolean;
  startWidthPx: number;
  getShellWidth: () => number;
  onDragWidth: (rawPx: number) => void;
  onDragComplete?: (finalRawPx: number) => void;
}) {
  const handleRef = useRef<HTMLDivElement>(null);
  const startWidthRef = useRef(0);
  const lastRawRef = useRef(0);

  const handleDrag = useCallback(
    (delta: Delta) => {
      notifyPanelWidthDragStart();
      const shellW = getShellWidth();
      if (shellW <= 0) return;
      const raw =
        edge === 'trailing'
          ? startWidthRef.current + delta.x
          : startWidthRef.current - delta.x;
      lastRawRef.current = raw;
      onDragWidth(raw);
    },
    [edge, getShellWidth, onDragWidth],
  );

  const handleDragStart = useCallback(
    (e: PointerEvent) => {
      startWidthRef.current = startWidthPx;
      lastRawRef.current = startWidthPx;
      handleRef.current?.setPointerCapture(e.pointerId);
    },
    [startWidthPx],
  );

  const handleDragEnd = useCallback(
    (e: PointerEvent) => {
      onDragComplete?.(lastRawRef.current);
      notifyPanelWidthDragEnd();
      try {
        handleRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Capture already released
      }
      startWidthRef.current = 0;
    },
    [onDragComplete],
  );

  useElemDrag({
    elem: handleRef,
    onDrag: handleDrag,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    isActive,
  });

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      data-slot="panel-resize-handle"
      data-edge={edge}
      className={className}
      {...props}
    />
  );
}
