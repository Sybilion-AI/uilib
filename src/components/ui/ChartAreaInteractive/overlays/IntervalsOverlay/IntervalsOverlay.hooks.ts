import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import useElemDrag, { Delta } from '@/hooks/useDragElem';

export function useQuantileButton({
  buttonRef,
  overlayContainerRef,
  quantiles,
  selectedQuantile,
  onQuantileChange,
  calculateQuantilePosition,
  yMin,
  yMax,
  minPercent = 0,
  maxPercent = 100,
}: {
  buttonRef: RefObject<HTMLButtonElement>;
  overlayContainerRef: RefObject<HTMLDivElement>;
  quantiles: string[];
  selectedQuantile: string | null | undefined;
  onQuantileChange?: (quantile: string | null) => void;
  calculateQuantilePosition: (
    quantile: string,
    yMin: number,
    yMax: number,
  ) => number;
  yMin: number;
  yMax: number;
  minPercent?: number;
  maxPercent?: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const cachedRectRef = useRef<DOMRect | null>(null);

  const clientYToPercent = useCallback(
    (clientY: number): number => {
      const boundingRect =
        cachedRectRef.current ||
        overlayContainerRef.current?.getBoundingClientRect();

      if (!boundingRect) return 50;

      const relativeY = clientY - boundingRect.top;
      const percent = (relativeY / boundingRect.height) * 100;
      // Clamp to min/max percent constraints
      return Math.max(minPercent, Math.min(maxPercent, percent));
    },
    [overlayContainerRef, minPercent, maxPercent],
  );

  const setButtonPosition = useCallback(
    (percent: number) => {
      if (buttonRef.current) {
        buttonRef.current.style.top = `${percent}%`;
      }
    },
    [buttonRef],
  );

  const findClosestQuantile = useCallback(
    (percent: number, yMin: number, yMax: number): string | null => {
      if (quantiles.length === 0) return null;

      // Clamp percent to constraints before finding closest quantile
      const clampedPercent = Math.max(
        minPercent,
        Math.min(maxPercent, percent),
      );

      let closestQuantile = quantiles[0];
      let minDiff = Math.abs(
        calculateQuantilePosition(quantiles[0], yMin, yMax) - clampedPercent,
      );

      for (const quantile of quantiles) {
        const quantilePercent = calculateQuantilePosition(quantile, yMin, yMax);
        // Only consider quantiles within constraints
        if (quantilePercent < minPercent || quantilePercent > maxPercent) {
          continue;
        }
        const diff = Math.abs(quantilePercent - clampedPercent);
        if (diff < minDiff) {
          minDiff = diff;
          closestQuantile = quantile;
        }
      }

      return closestQuantile;
    },
    [quantiles, calculateQuantilePosition, minPercent, maxPercent],
  );

  // Sync button position when selectedQuantile changes (outside of drag)
  useEffect(() => {
    if (!isDragging && buttonRef.current && selectedQuantile) {
      const percent = calculateQuantilePosition(selectedQuantile, yMin, yMax);
      setButtonPosition(percent);
    }
  }, [
    selectedQuantile,
    isDragging,
    buttonRef,
    calculateQuantilePosition,
    yMin,
    yMax,
    setButtonPosition,
  ]);

  const handleDrag = useCallback(
    (delta: Delta, e: PointerEvent) => {
      if (!buttonRef.current || !cachedRectRef.current) return;

      const percent = clientYToPercent(e.clientY);

      // Update position directly to DOM, following cursor freely
      setButtonPosition(percent);

      // Find closest quantile and update state if changed (without visual snapping)
      const closestQuantile = findClosestQuantile(percent, yMin, yMax);
      if (closestQuantile && closestQuantile !== selectedQuantile) {
        onQuantileChange?.(closestQuantile);
      }
    },
    [
      buttonRef,
      clientYToPercent,
      findClosestQuantile,
      yMin,
      yMax,
      selectedQuantile,
      onQuantileChange,
    ],
  );

  const handleDragStart = useCallback(
    (e: PointerEvent) => {
      setIsDragging(true);
      if (buttonRef.current) {
        buttonRef.current.style.transition = 'none';
      }
      // Cache bounding rect at drag start
      if (overlayContainerRef.current) {
        cachedRectRef.current =
          overlayContainerRef.current.getBoundingClientRect();
      }
    },
    [buttonRef, overlayContainerRef],
  );

  const handleDragEnd = useCallback(
    (e: PointerEvent) => {
      if (!buttonRef.current || !overlayContainerRef.current) return;

      const finalPercent = clientYToPercent(e.clientY);

      // Find nearest quantile and snap to it
      const closestQuantile = findClosestQuantile(finalPercent, yMin, yMax);

      if (closestQuantile && onQuantileChange) {
        // Update visual position to snapped quantile position
        let snappedPercent = calculateQuantilePosition(
          closestQuantile,
          yMin,
          yMax,
        );
        // Clamp snapped position to constraints
        snappedPercent = Math.max(
          minPercent,
          Math.min(maxPercent, snappedPercent),
        );
        setButtonPosition(snappedPercent);

        // Update React state for persistence
        onQuantileChange(closestQuantile);
      }

      // Re-enable transitions
      if (buttonRef.current) {
        buttonRef.current.style.transition = '';
      }

      // Clear cached rect
      cachedRectRef.current = null;

      setIsDragging(false);
    },
    [
      buttonRef,
      overlayContainerRef,
      clientYToPercent,
      findClosestQuantile,
      yMin,
      yMax,
      calculateQuantilePosition,
      setButtonPosition,
      onQuantileChange,
      minPercent,
      maxPercent,
    ],
  );

  useElemDrag({
    elem: buttonRef,
    onDrag: handleDrag,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    isActive: quantiles.length > 0,
  });

  return { isDragging };
}
