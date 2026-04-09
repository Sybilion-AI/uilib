import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import useElemDrag, { Delta } from '@/hooks/useDragElem';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

export function useThresholdButton({
  lineRef,
  overlayContainerRef,
  initialValue,
  minValue,
  maxValue,
  yMin,
  yMax,
  onValueChange,
  discreteValues,
}: {
  lineRef: RefObject<HTMLDivElement>;
  gradientRef?: RefObject<HTMLDivElement>;
  overlayContainerRef: RefObject<HTMLDivElement>;
  initialValue: number;
  minValue: number;
  maxValue: number;
  yMin: number;
  yMax: number;
  onValueChange: (value: number) => void;
  discreteValues?: number[];
}) {
  const [isDragging, setIsDragging] = useState(false);
  const initialValueRef = useRef<number>(initialValue);
  const startYRef = useRef<number>(0);

  const onValueChangeThrottled = useThrottledCallback(onValueChange, 50);

  const percentToValue = useCallback(
    (percent: number): number => {
      const normalized = 1 - percent / 100;
      return yMin + normalized * (yMax - yMin);
    },
    [yMin, yMax],
  );

  const valueToPercent = useCallback(
    (value: number): number => {
      const normalized = (value - yMin) / (yMax - yMin);
      return Math.max(0, Math.min(100, (1 - normalized) * 100));
    },
    [yMin, yMax],
  );

  const minPercent = valueToPercent(maxValue);
  const maxPercent = valueToPercent(minValue);

  const clientYToValue = useCallback(
    (clientY: number): number => {
      if (!overlayContainerRef.current) return initialValueRef.current;

      const rect = overlayContainerRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const rawPercent = (relativeY / rect.height) * 100;
      const clampedPercent = Math.max(
        minPercent,
        Math.min(maxPercent, rawPercent),
      );
      const value = Math.max(
        minValue,
        Math.min(maxValue, percentToValue(clampedPercent)),
      );
      return value;
    },
    [
      overlayContainerRef,
      percentToValue,
      minPercent,
      maxPercent,
      minValue,
      maxValue,
    ],
  );

  const setLinePosition = percent => {
    if (lineRef.current) {
      lineRef.current.style.top = `${percent}%`;
    }
  };

  // Helper function to find closest discrete value
  const findClosestDiscreteValue = useCallback(
    (value: number, discreteValues: number[]): number => {
      if (discreteValues.length === 0) return value;

      let closest = discreteValues[0];
      let minDiff = Math.abs(discreteValues[0] - value);

      for (const discreteValue of discreteValues) {
        const diff = Math.abs(discreteValue - value);
        if (diff < minDiff) {
          minDiff = diff;
          closest = discreteValue;
        }
      }

      return closest;
    },
    [],
  );

  // Sync button position when initialValue changes (outside of drag)
  useEffect(() => {
    if (!isDragging && lineRef.current) {
      const clampedValue = Math.max(minValue, Math.min(maxValue, initialValue));
      const percent = valueToPercent(clampedValue);
      setLinePosition(percent);
    }
  }, [initialValue, isDragging, lineRef, minValue, maxValue, valueToPercent]);

  const handleDrag = useCallback(
    (delta: Delta, e: PointerEvent) => {
      const newValue = clientYToValue(e.clientY);
      const clampedValue = Math.max(minValue, Math.min(maxValue, newValue));
      const percent = valueToPercent(clampedValue);

      setLinePosition(percent);
      onValueChangeThrottled(clampedValue);
    },
    [clientYToValue, valueToPercent, minValue, maxValue],
  );

  const handleDragStart = useCallback(
    (e: PointerEvent) => {
      initialValueRef.current = initialValue;
      startYRef.current = e.clientY;
      setIsDragging(true);
    },
    [initialValue],
  );

  const handleDragEnd = useCallback(
    (e: PointerEvent) => {
      const finalValue = clientYToValue(e.clientY);
      let clampedValue = Math.max(minValue, Math.min(maxValue, finalValue));

      // Snap to nearest discrete value if provided (only values within bounds)
      if (discreteValues && discreteValues.length > 0) {
        const validDiscreteValues = discreteValues.filter(
          v => v >= minValue && v <= maxValue,
        );
        if (validDiscreteValues.length > 0) {
          clampedValue = findClosestDiscreteValue(
            clampedValue,
            validDiscreteValues,
          );
        }
        clampedValue = Math.max(minValue, Math.min(maxValue, clampedValue));

        const percent = valueToPercent(clampedValue);
        setLinePosition(percent);
      }

      // Update React state for persistence
      onValueChange(clampedValue);

      setIsDragging(false);
    },
    [
      overlayContainerRef,
      clientYToValue,
      minValue,
      maxValue,
      onValueChange,
      discreteValues,
      findClosestDiscreteValue,
      valueToPercent,
    ],
  );

  useElemDrag({
    elem: lineRef,
    onDrag: handleDrag,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    isActive: true,
  });

  return { isDragging };
}
