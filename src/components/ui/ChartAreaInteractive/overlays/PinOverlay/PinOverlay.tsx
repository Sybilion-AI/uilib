import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { BaseChartWrapper } from '#uilib/components/ui/Chart/components';
import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { useDebounceCallback } from '#uilib/hooks/useDebounceCallback';
import useElemDrag from '#uilib/hooks/useDragElem';
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
  const containerRectRef = useRef<DOMRect | null>(null);

  const [isPinHovered, setIsPinHovered] = useState(false);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [isPinAnimating, setIsPinAnimating] = useState(true);

  const pinPosRef = useRef<number>(0);
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

  const snapPinToPosition = (
    eventX: number,
    needMonthUpdate: boolean = true,
    immediateMonthUpdate: boolean = false,
  ) => {
    if (!pinContainerRef.current || !chartData.length) return;

    const pinContainerRect = pinContainerRef.current.getBoundingClientRect();
    const effectiveLeft = pinContainerRect.left;
    const effectiveWidth = pinContainerRect.width;

    const relativeX = eventX - effectiveLeft;
    const rawPercentage =
      effectiveWidth > 0 ? (relativeX / effectiveWidth) * 100 : 0;
    const percentage = Math.max(
      0,
      Math.min(100, isNaN(rawPercentage) ? 0 : rawPercentage),
    );

    const totalPoints = chartData.length;
    if (totalPoints > 1) {
      const nearestIndex = Math.round((percentage / 100) * (totalPoints - 1));
      const clampedIndex = Math.max(0, Math.min(totalPoints - 1, nearestIndex));
      const snappedPercentage = (clampedIndex / (totalPoints - 1)) * 100;

      setPinPosition(isNaN(snappedPercentage) ? 0 : snappedPercentage);

      if (needMonthUpdate) {
        const monthAndYear = getPinMonthAndYear();
        if (monthAndYear) {
          const isNewMonth = monthAndYear !== currPinMonthRef.current;
          if (isNewMonth) currPinMonthRef.current = monthAndYear;
          if (immediateMonthUpdate) {
            onPinMonthChange?.(monthAndYear);
          } else if (isNewMonth) {
            debouncedOnPinMonthChange(monthAndYear);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!pinMonth || !chartData.length) return;

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

  const clearPinTransforms = () => {
    if (pinRef.current) {
      pinRef.current.style.transform = '';
      pinRef.current.style.transition = '';
    }
    if (pinPlaceholderRef.current) {
      pinPlaceholderRef.current.style.transform = '';
      pinPlaceholderRef.current.style.transition = '';
    }
  };

  useElemDrag({
    elem: pinPlaceholderRef,
    isActive: chartData.length > 0,
    onDragStart: e => {
      e.stopPropagation();
      setIsDraggingPin(true);
      setIsPinAnimating(false);
      containerRectRef.current =
        pinContainerRef.current?.getBoundingClientRect() ?? null;
      if (pinRef.current) pinRef.current.style.transition = 'none';
      if (pinPlaceholderRef.current) {
        pinPlaceholderRef.current.style.transition = 'none';
      }
    },
    onDrag: (_delta, e) => {
      const containerRect = containerRectRef.current;
      if (!containerRect) return;

      const pinCurrentLeft = (pinPosRef.current / 100) * containerRect.width;
      const relativeX = e.clientX - containerRect.left;
      const clampedX = Math.max(0, Math.min(containerRect.width, relativeX));
      const translateX = clampedX - pinCurrentLeft;
      const transform = `translateX(${translateX}px)`;

      if (pinRef.current) pinRef.current.style.transform = transform;
      if (pinPlaceholderRef.current) {
        pinPlaceholderRef.current.style.transform = transform;
      }

      const previewPercent =
        containerRect.width > 0 ? (clampedX / containerRect.width) * 100 : 0;
      onPreviewMonthChange?.(getPinMonthAndYear(previewPercent) ?? undefined);
    },
    onDragEnd: e => {
      e.stopPropagation();
      setIsDraggingPin(false);
      setTimeout(() => setIsPinAnimating(true), 200);
      containerRectRef.current = null;
      clearPinTransforms();
      snapPinToPosition(e.clientX, true, true);
    },
  });

  const onChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (!target.closest?.('svg')) return;
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
      <div className={cn(CAS.overlay, S.pinPlaceholderHost)}>
        <div
          className={S.pinPlaceholder}
          style={{ left: `${pinPosRef.current}%` }}
          ref={pinPlaceholderRef}
          onPointerEnter={() => setIsPinHovered(true)}
          onPointerLeave={() => setIsPinHovered(false)}
        />
      </div>
    </>
  );

  return (
    <div
      className={cn(
        className,
        S.root,
        isPinAnimating && S.pinAnimating,
        isPinHovered && S.pinHovered,
        isDraggingPin && S.pinDragging,
      )}
      onClick={onChartClick}
      ref={chartRef}
    >
      <BaseChartWrapper
        {...baseChartProps}
        yMin={yMin}
        yMax={yMax}
        autoScaleYAxis={false}
        showTooltip={!isDraggingPin}
        overlayElements={overlay}
      />
    </div>
  );
}
