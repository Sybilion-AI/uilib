import { RefObject } from 'react';
export declare function useQuantileButton({ buttonRef, overlayContainerRef, quantiles, selectedQuantile, onQuantileChange, calculateQuantilePosition, yMin, yMax, minPercent, maxPercent, }: {
    buttonRef: RefObject<HTMLButtonElement>;
    overlayContainerRef: RefObject<HTMLDivElement>;
    quantiles: string[];
    selectedQuantile: string | null | undefined;
    onQuantileChange?: (quantile: string | null) => void;
    calculateQuantilePosition: (quantile: string, yMin: number, yMax: number) => number;
    yMin: number;
    yMax: number;
    minPercent?: number;
    maxPercent?: number;
}): {
    isDragging: boolean;
};
