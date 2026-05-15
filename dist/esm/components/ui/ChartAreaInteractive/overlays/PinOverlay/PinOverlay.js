import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useState, useEffect } from 'react';
import { BaseChartWrapper } from '../../../Chart/components/BaseChartWrapper.js';
import 'recharts';
import '../../../Chart/Chart.context.js';
import '../../../Chart/Chart.styl.js';
import { useDebounceCallback } from '../../../../../hooks/useDebounceCallback.js';
import { ChevronsLeftRight } from 'lucide-react';
import S from '../../ChartAreaInteractive.styl.js';
import { useChartYRange } from '../useChartYRange.js';
import S$1 from './PinOverlay.styl.js';

function PinOverlay({ baseChartProps, pinMonth, onPinMonthChange, onPreviewMonthChange: _onPreviewMonthChange, className, }) {
    const { chartData } = baseChartProps;
    const chartRef = useRef(null);
    const pinRef = useRef(null);
    const pinPlaceholderRef = useRef(null);
    const pinContainerRef = useRef(null);
    const [isPinHovered, setIsPinHovered] = useState(false);
    const pinPosRef = useRef(0);
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
    const snapPinToPosition = (eventX, needMonthUpdate = true, immediateMonthUpdate = false) => {
        if (!pinContainerRef.current || !chartData.length)
            return;
        const pinContainerRect = pinContainerRef.current.getBoundingClientRect();
        const effectiveLeft = pinContainerRect.left;
        const effectiveWidth = pinContainerRect.width;
        const relativeX = eventX - effectiveLeft;
        const rawPercentage = effectiveWidth > 0 ? (relativeX / effectiveWidth) * 100 : 0;
        const percentage = Math.max(0, Math.min(100, isNaN(rawPercentage) ? 0 : rawPercentage));
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
                    if (isNewMonth)
                        currPinMonthRef.current = monthAndYear;
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
    useEffect(() => {
        if (!pinMonth || !chartData.length)
            return;
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
    const onChartClick = (e) => {
        if (e.button !== 0)
            return;
        const target = e.target;
        if (!target.closest?.('svg'))
            return;
        snapPinToPosition(e.clientX, true, false);
    };
    const overlay = (jsxs(Fragment, { children: [jsx("div", { className: cn(S.overlay, S$1.pinContainer), ref: pinContainerRef, children: jsx("div", { className: S$1.pinLineBase, style: { left: `${pinPosRef.current}%` }, ref: pinRef, children: jsx("div", { className: S$1.pinButton, "aria-label": "News pin", title: `Current month: ${getPinMonthAndYear() || 'Loading...'}`, children: jsx(ChevronsLeftRight, { className: S$1.pinIcon, "aria-hidden": "true" }) }) }) }), jsx("div", { className: S$1.pinPlaceholder, style: { left: `${pinPosRef.current}%` }, ref: pinPlaceholderRef, onPointerEnter: () => setIsPinHovered(true), onPointerLeave: () => setIsPinHovered(false) })] }));
    return (jsx("div", { className: cn(className, S$1.root, S$1.pinAnimating, isPinHovered && S$1.pinHovered), onClick: onChartClick, ref: chartRef, children: jsx(BaseChartWrapper, { ...baseChartProps, yMin: yMin, yMax: yMax, autoScaleYAxis: false, overlayElements: overlay }) }));
}

export { PinOverlay };
