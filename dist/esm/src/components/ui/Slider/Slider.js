import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useRef, useCallback, useEffect } from 'react';
import S from './Slider.styl.js';

function Slider({ className, value: controlledValue, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, disabled = false, }) {
    const [internalValue, setInternalValue] = useState(controlledValue ?? defaultValue ?? [min]);
    const [isDragging, setIsDragging] = useState(false);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const sliderThumbContainerRef = useRef(null);
    const thumbRef = useRef(null);
    const rangeRef = useRef(null);
    const cachedRectRef = useRef(null);
    const updateThumbPosition = useCallback((percentage) => {
        if (thumbRef.current) {
            thumbRef.current.style.left = `${percentage}%`;
        }
        if (rangeRef.current && sliderThumbContainerRef.current) {
            const containerWidth = sliderThumbContainerRef.current.offsetWidth;
            const rangeWidth = (containerWidth * percentage) / 100 + 16;
            rangeRef.current.style.width = `${rangeWidth}px`;
        }
    }, []);
    const calculatePercentageFromPosition = useCallback((clientX, useCache = false) => {
        if (!sliderThumbContainerRef.current)
            return 0;
        const rect = useCache && cachedRectRef.current
            ? cachedRectRef.current
            : sliderThumbContainerRef.current.getBoundingClientRect();
        if (useCache && !cachedRectRef.current) {
            cachedRectRef.current = rect;
        }
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    }, []);
    const calculateValueFromPosition = useCallback((clientX, useCache = false) => {
        if (!sliderThumbContainerRef.current)
            return value;
        const percentage = calculatePercentageFromPosition(clientX, useCache);
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));
        return [clampedValue];
    }, [min, max, step, value, calculatePercentageFromPosition]);
    const handlePointerDown = useCallback((e) => {
        if (disabled)
            return;
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
    }, [
        disabled,
        calculatePercentageFromPosition,
        calculateValueFromPosition,
        isControlled,
        onValueChange,
        updateThumbPosition,
    ]);
    const handlePointerMove = useCallback((e) => {
        if (!isDragging || disabled)
            return;
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
    }, [
        disabled,
        calculatePercentageFromPosition,
        calculateValueFromPosition,
        isControlled,
        isDragging,
        min,
        max,
        onValueChange,
        updateThumbPosition,
    ]);
    const handlePointerUp = useCallback((e) => {
        if (!isDragging)
            return;
        setIsDragging(false);
        // Clear cached rect when drag ends
        cachedRectRef.current = null;
        const newValue = calculateValueFromPosition(e.clientX);
        onValueCommit?.(newValue);
    }, [calculateValueFromPosition, isDragging, onValueCommit]);
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
    return (jsx("div", { "data-slot": "slider", className: cn(S.sliderRoot, className), "data-disabled": disabled, "data-dragging": isDragging, children: jsxs("div", { className: S.sliderTrack, onPointerDown: handlePointerDown, children: [jsx("div", { ref: rangeRef, className: S.sliderRange }), jsx("div", { ref: sliderThumbContainerRef, className: S.sliderThumbContainer, children: jsx("div", { ref: thumbRef, className: S.sliderThumb, onPointerDown: handlePointerDown }) })] }) }));
}

export { Slider };
