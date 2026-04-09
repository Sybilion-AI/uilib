import { RefObject } from 'react';
export declare function useThresholdButton({ lineRef, overlayContainerRef, initialValue, minValue, maxValue, yMin, yMax, onValueChange, discreteValues, }: {
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
}): {
    isDragging: boolean;
};
