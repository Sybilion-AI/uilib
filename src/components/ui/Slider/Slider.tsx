import cn from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import S from './Slider.styl';
import type { SliderProps } from './Slider.types';

function Slider({
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState<number[]>(
    controlledValue ?? defaultValue ?? [min],
  );
  const [isDragging, setIsDragging] = useState(false);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const sliderThumbContainerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);

  const updateThumbPosition = useCallback((percentage: number) => {
    if (thumbRef.current) {
      thumbRef.current.style.left = `${percentage}%`;
    }
    if (rangeRef.current && sliderThumbContainerRef.current) {
      const containerWidth = sliderThumbContainerRef.current.offsetWidth;
      const rangeWidth = (containerWidth * percentage) / 100 + 16;
      rangeRef.current.style.width = `${rangeWidth}px`;
    }
  }, []);

  const calculatePercentageFromPosition = useCallback(
    (clientX: number, useCache = false): number => {
      if (!sliderThumbContainerRef.current) return 0;

      const rect =
        useCache && cachedRectRef.current
          ? cachedRectRef.current
          : sliderThumbContainerRef.current.getBoundingClientRect();

      if (useCache && !cachedRectRef.current) {
        cachedRectRef.current = rect;
      }

      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [],
  );

  const calculateValueFromPosition = useCallback(
    (clientX: number, useCache = false): number[] => {
      if (!sliderThumbContainerRef.current) return value;

      const percentage = calculatePercentageFromPosition(clientX, useCache);
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      return [clampedValue];
    },
    [min, max, step, value, calculatePercentageFromPosition],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      e.preventDefault();
      setIsDragging(true);
      // Cache rect when drag starts
      if (sliderThumbContainerRef.current) {
        cachedRectRef.current =
          sliderThumbContainerRef.current.getBoundingClientRect();
      }
      const rawPercentage = calculatePercentageFromPosition(e.clientX, false);
      const visualPercentage = rawPercentage * 100;
      updateThumbPosition(visualPercentage);

      const newValue = calculateValueFromPosition(e.clientX);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [
      disabled,
      calculatePercentageFromPosition,
      calculateValueFromPosition,
      isControlled,
      onValueChange,
      updateThumbPosition,
    ],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || disabled) return;

      e.preventDefault();
      // Use cached rect during drag for performance
      const rawPercentage = calculatePercentageFromPosition(e.clientX, true);
      const visualPercentage = rawPercentage * 100;
      updateThumbPosition(visualPercentage);

      const newValue = calculateValueFromPosition(e.clientX, true);

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [
      disabled,
      calculatePercentageFromPosition,
      calculateValueFromPosition,
      isControlled,
      isDragging,
      min,
      max,
      onValueChange,
      updateThumbPosition,
    ],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;

      setIsDragging(false);

      // Clear cached rect when drag ends
      cachedRectRef.current = null;
      const newValue = calculateValueFromPosition(e.clientX);

      onValueCommit?.(newValue);
    },
    [calculateValueFromPosition, isDragging, onValueCommit],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);

      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const percentage = ((value[0] - min) / (max - min)) * 100;

  useEffect(() => {
    if (!isDragging) {
      updateThumbPosition(percentage);
    }
  }, [percentage, isDragging, updateThumbPosition, value]);

  return (
    <div
      data-slot="slider"
      className={cn(S.sliderRoot, className)}
      data-disabled={disabled}
      data-dragging={isDragging}
    >
      <div className={S.sliderTrack} onPointerDown={handlePointerDown}>
        <div ref={rangeRef} className={S.sliderRange} />
        <div ref={sliderThumbContainerRef} className={S.sliderThumbContainer}>
          <div
            ref={thumbRef}
            className={S.sliderThumb}
            onPointerDown={handlePointerDown}
          />
        </div>
      </div>
    </div>
  );
}

export { Slider };
