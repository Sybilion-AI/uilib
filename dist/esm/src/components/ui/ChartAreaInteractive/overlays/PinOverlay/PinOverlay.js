import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useState, useEffect } from 'react';
import { BaseChartWrapper } from '../../../Chart/components/BaseChartWrapper.js';
import 'recharts';
import '../../../Chart/Chart.context.js';
import '../../../Chart/Chart.styl.js';
import { useDebounceCallback } from '../../../../../hooks/useDebounceCallback.js';
import useElemDrag from '../../../../../hooks/useDragElem.js';
import { ChevronsLeftRight } from 'lucide-react';
import S from '../../ChartAreaInteractive.styl.js';
import { useChartYRange } from '../useChartYRange.js';
import S$1 from './PinOverlay.styl.js';

function PinOverlay({ baseChartProps, pinMonth, onPinMonthChange, onPreviewMonthChange, className, }) {
    const { chartData } = baseChartProps;
    const chartRef = useRef(null);
    const pinRef = useRef(null);
    const pinPlaceholderRef = useRef(null);
    const pinContainerRef = useRef(null);
    const [isDraggingPin, setIsDraggingPin] = useState(false);
    const [isPinAnimating, setIsPinAnimating] = useState(true);
    const [isPinHovered, setIsPinHovered] = useState(false);
    const pinPosRef = useRef(0);
    const containerRectRef = useRef(null);
    const currPinMonthRef = useRef(pinMonth);
    const debouncedOnPinMonthChange = useDebounceCallback((...args) => onPinMonthChange?.(args[0]), 500, [onPinMonthChange]);
    const { yMin, yMax } = useChartYRange({
        baseChartProps,
        excludeQuantileBands: true,
    });
    const setPinPosition = (position) => {
        pinPosRef.current = position;
        if (pinRef.current) {
            pinRef.current.style.left = `${position}%`;
        }
        if (pinPlaceholderRef.current) {
            pinPlaceholderRef.current.style.left = `${position}%`;
        }
    };
    // Get full month and year for pin position to send to parent component
    const getPinMonthAndYear = (position) => {
        if (!chartData.length)
            return null;
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
    const snapPinToPosition = (eventX, needMonthUpdate = true, immediateMonthUpdate = false) => {
        if (!pinContainerRef.current || !chartData.length)
            return;
        const pinContainerRect = pinContainerRef.current.getBoundingClientRect();
        const effectiveLeft = pinContainerRect.left;
        const effectiveWidth = pinContainerRect.width;
        // Calculate relative position within plotted area
        const relativeX = eventX - effectiveLeft;
        const rawPercentage = effectiveWidth > 0 ? (relativeX / effectiveWidth) * 100 : 0;
        const percentage = Math.max(0, Math.min(100, isNaN(rawPercentage) ? 0 : rawPercentage));
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
                    if (isNewMonth)
                        currPinMonthRef.current = monthAndYear;
                    // When immediate (e.g. dragEnd), always notify parent so showFutureOutlook is correct
                    if (immediateMonthUpdate) {
                        onPinMonthChange?.(monthAndYear);
                    }
                    else if (isNewMonth) {
                        debouncedOnPinMonthChange(monthAndYear);
                    }
                }
            }
        }
    };
    // Update pin position when pinMonth prop changes
    useEffect(() => {
        if (!pinMonth || !chartData.length)
            return;
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
    useElemDrag({
        elem: [chartRef],
        onDragStart: () => {
            setIsDraggingPin(true);
            containerRectRef.current =
                pinContainerRef.current?.getBoundingClientRect() || null;
        },
        onDrag: (delta) => {
            if (pinRef.current) {
                const containerRect = containerRectRef.current;
                if (!containerRect)
                    return;
                const pinCurrentLeft = (pinPosRef.current / 100) * containerRect.width;
                const leftLimit = -pinCurrentLeft;
                const rightLimit = containerRect.width - pinCurrentLeft;
                const clampedDeltaX = Math.max(leftLimit, Math.min(rightLimit, delta.x));
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
        onDragEnd: (e) => {
            setIsDraggingPin(false);
            setTimeout(() => setIsPinAnimating(true), 200);
            if (pinRef.current)
                pinRef.current.style.transform = '';
            // Snap first so onPinMonthChange runs before we clear preview (avoids showFutureOutlook fallback)
            snapPinToPosition(e.clientX, true, true);
            if (onPreviewMonthChange) {
                onPreviewMonthChange(undefined);
            }
        },
    });
    const onPointerDown = (e) => {
        if (e.target.tagName !== 'svg')
            return;
        snapPinToPosition(e.clientX, true, false);
    };
    const overlay = (jsxs(Fragment, { children: [jsx("div", { className: cn(S.overlay, S$1.pinContainer), ref: pinContainerRef, children: jsx("div", { className: S$1.pinLineBase, style: { left: `${pinPosRef.current}%` }, ref: pinRef, children: jsx("div", { className: S$1.pinButton, "aria-label": "News pin", title: `Current month: ${getPinMonthAndYear() || 'Loading...'}`, children: jsx(ChevronsLeftRight, { className: S$1.pinIcon, "aria-hidden": "true" }) }) }) }), jsx("div", { className: S$1.pinPlaceholder, style: { left: `${pinPosRef.current}%` }, ref: pinPlaceholderRef, onPointerEnter: () => setIsPinHovered(true), onPointerLeave: () => setIsPinHovered(false) })] }));
    return (jsx("div", { className: cn(className, S$1.root, isDraggingPin && S$1.pinDragging, isPinAnimating && S$1.pinAnimating, isPinHovered && S$1.pinHovered), onPointerDown: onPointerDown, 
        // onClick={e => snapPinToPosition(e.clientX)}
        ref: chartRef, children: jsx(BaseChartWrapper, { ...baseChartProps, yMin: yMin, yMax: yMax, autoScaleYAxis: false, overlayElements: overlay }) }));
}

export { PinOverlay };
