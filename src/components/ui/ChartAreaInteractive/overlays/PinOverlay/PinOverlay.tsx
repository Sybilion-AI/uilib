'use client';

import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { BaseChartWrapper } from '@/components/ui/Chart/components';
import { BaseChartWrapperProps } from '@/components/ui/Chart/components/BaseChartWrapper';
import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import useDragElem, { Delta } from '@/hooks/useDragElem';
import { ChevronsLeftRight } from 'lucide-react';

import CAS from '../../ChartAreaInteractive.styl';
import { useChartYRange } from '../useChartYRange';
import S from './PinOverlay.styl';

interface PinOverlayProps {
  baseChartProps: BaseChartWrapperProps;
  pinMonth: string | undefined;
  onPinMonthChange: (month: string | undefined) => void;
  onPreviewMonthChange?: (month: string | undefined) => void;
  className?: string;
}

export function PinOverlay({
  baseChartProps,
  pinMonth,
  onPinMonthChange,
  onPreviewMonthChange,
  className,
}: PinOverlayProps) {
  const { chartData } = baseChartProps;
  const chartRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const pinPlaceholderRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [isPinAnimating, setIsPinAnimating] = useState(true);
  const [isPinHovered, setIsPinHovered] = useState(false);

  const pinPosRef = useRef<number>(0);
  const containerRectRef = useRef<DOMRect | null>(null);
  const currPinMonthRef = useRef<string | undefined>(pinMonth);

  const debouncedOnPinMonthChange = useDebounceCallback(
    (...args: unknown[]) => onPinMonthChange?.(args[0] as string),
    500,
    [onPinMonthChange],
  );

  const { yMin, yMax } = useChartYRange({
    baseChartProps,
    excludeQuantileBands: true,
  });

  const setPinPosition = (position: number) => {
    pinPosRef.current = position;
    if (pinRef.current) {
      pinRef.current.style.left = `${position}%`;
    }
    if (pinPlaceholderRef.current) {
      pinPlaceholderRef.current.style.left = `${position}%`;
    }
  };

  // Get full month and year for pin position to send to parent component
  const getPinMonthAndYear = (position?: number) => {
    if (!chartData.length) return null;

    const totalPoints = chartData.length;
    const positionToUse = position !== undefined ? position : pinPosRef.current;
    const index = Math.round((positionToUse / 100) * (totalPoints - 1));
    const clampedIndex = Math.max(0, Math.min(totalPoints - 1, index));
    const dataPoint = chartData[clampedIndex];

    if (dataPoint && dataPoint.date) {
      const date = new Date(dataPoint.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
  };

  // Handle chart click to move pin to specific position
  const snapPinToPosition = (
    eventX: number,
    needMonthUpdate: boolean = true,
    immediateMonthUpdate: boolean = false,
  ) => {
    if (!pinContainerRef.current || !chartData.length) return;

    const pinContainerRect = pinContainerRef.current.getBoundingClientRect();
    const effectiveLeft = pinContainerRect.left;
    const effectiveWidth = pinContainerRect.width;

    // Calculate relative position within plotted area
    const relativeX = eventX - effectiveLeft;
    const rawPercentage =
      effectiveWidth > 0 ? (relativeX / effectiveWidth) * 100 : 0;
    const percentage = Math.max(
      0,
      Math.min(100, isNaN(rawPercentage) ? 0 : rawPercentage),
    );

    // Snap to nearest data point
    const totalPoints = chartData.length;
    if (totalPoints > 1) {
      const nearestIndex = Math.round((percentage / 100) * (totalPoints - 1));
      const clampedIndex = Math.max(0, Math.min(totalPoints - 1, nearestIndex));
      const snappedPercentage = (clampedIndex / (totalPoints - 1)) * 100;

      setPinPosition(isNaN(snappedPercentage) ? 0 : snappedPercentage);

      if (needMonthUpdate) {
        // Update news for all months (historical and forecast)
        const monthAndYear = getPinMonthAndYear();
        if (monthAndYear) {
          const isNewMonth = monthAndYear !== currPinMonthRef.current;
          if (isNewMonth) currPinMonthRef.current = monthAndYear;
          // When immediate (e.g. dragEnd), always notify parent so showFutureOutlook is correct
          if (immediateMonthUpdate) {
            onPinMonthChange?.(monthAndYear);
          } else if (isNewMonth) {
            debouncedOnPinMonthChange(monthAndYear);
          }
        }
      }
    }
  };

  // Update pin position when pinMonth prop changes
  useEffect(() => {
    if (!pinMonth || !chartData.length) return;

    // Find the data point index for the given month
    const dataPointIndex = chartData.findIndex(point => {
      const date = new Date(point.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const pointMonth = `${month} ${year}`;
      return pointMonth === pinMonth;
    });

    if (dataPointIndex !== -1) {
      const totalPoints = chartData.length;
      const newPosition = (dataPointIndex / (totalPoints - 1)) * 100;
      setPinPosition(isNaN(newPosition) ? 0 : newPosition);
      currPinMonthRef.current = pinMonth;
    }
  }, [pinMonth, chartData]);

  useDragElem({
    elem: [chartRef],
    onDragStart: () => {
      setIsDraggingPin(true);

      containerRectRef.current =
        pinContainerRef.current?.getBoundingClientRect() || null;
    },
    onDrag: (delta: Delta) => {
      if (pinRef.current) {
        const containerRect = containerRectRef.current;
        if (!containerRect) return;

        const pinCurrentLeft = (pinPosRef.current / 100) * containerRect.width;

        const leftLimit = -pinCurrentLeft;
        const rightLimit = containerRect.width - pinCurrentLeft;

        const clampedDeltaX = Math.max(
          leftLimit,
          Math.min(rightLimit, delta.x),
        );

        setIsPinAnimating(false);
        pinRef.current.style.transform = `translateX(${clampedDeltaX}px)`;

        // Calculate preview month based on current drag position
        if (onPreviewMonthChange && chartData.length > 0) {
          const newPositionPixels = pinCurrentLeft + clampedDeltaX;
          const newPercentage = (newPositionPixels / containerRect.width) * 100;
          const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
          const previewMonth = getPinMonthAndYear(clampedPercentage);

          if (previewMonth) {
            onPreviewMonthChange(previewMonth);
          }
        }
      }
    },
    onDragEnd: (e: PointerEvent) => {
      setIsDraggingPin(false);
      setTimeout(() => setIsPinAnimating(true), 200);
      if (pinRef.current) pinRef.current.style.transform = '';
      // Snap first so onPinMonthChange runs before we clear preview (avoids showFutureOutlook fallback)
      snapPinToPosition(e.clientX, true, true);
      if (onPreviewMonthChange) {
        onPreviewMonthChange(undefined);
      }
    },
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName !== 'svg') return;
    snapPinToPosition(e.clientX, true, false);
  };

  const overlay = (
    <>
      <div className={cn(CAS.overlay, S.pinContainer)} ref={pinContainerRef}>
        <div
          className={S.pinLineBase}
          style={{ left: `${pinPosRef.current}%` }}
          ref={pinRef}
        >
          <div
            className={S.pinButton}
            aria-label="News pin"
            title={`Current month: ${getPinMonthAndYear() || 'Loading...'}`}
          >
            <ChevronsLeftRight className={S.pinIcon} aria-hidden="true" />
          </div>
        </div>
      </div>
      {/* Hover placeholder for easier pin access - on top of everything */}
      <div
        className={S.pinPlaceholder}
        style={{ left: `${pinPosRef.current}%` }}
        ref={pinPlaceholderRef}
        onPointerEnter={() => setIsPinHovered(true)}
        onPointerLeave={() => setIsPinHovered(false)}
      />
    </>
  );

  return (
    <div
      className={cn(
        className,
        S.root,
        isDraggingPin && S.pinDragging,
        isPinAnimating && S.pinAnimating,
        isPinHovered && S.pinHovered,
      )}
      onPointerDown={onPointerDown}
      // onClick={e => snapPinToPosition(e.clientX)}
      ref={chartRef}
    >
      <BaseChartWrapper
        {...baseChartProps}
        yMin={yMin}
        yMax={yMax}
        autoScaleYAxis={false}
        overlayElements={overlay}
      />
    </div>
  );
}
