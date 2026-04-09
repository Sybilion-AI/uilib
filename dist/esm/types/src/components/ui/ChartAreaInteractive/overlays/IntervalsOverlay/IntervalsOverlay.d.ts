import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import type { ForecastData } from '#uilib/types/forecast-data';
import { Analysis } from '../../ChartAreaInteractive.types';
interface IntervalsOverlayProps {
    baseChartProps: BaseChartWrapperProps;
    selectedForecast?: Analysis;
    className?: string;
    upperQuantiles?: string[];
    lowerQuantiles?: string[];
    selectedLowerQuantile?: string | null;
    selectedUpperQuantile?: string | null;
    onLowerQuantileChange?: (quantile: string | null) => void;
    onUpperQuantileChange?: (quantile: string | null) => void;
    overlayForecastData: Record<number, ForecastData>;
}
export declare function IntervalsOverlay({ baseChartProps, selectedForecast, className, upperQuantiles: propUpperQuantiles, lowerQuantiles: propLowerQuantiles, selectedLowerQuantile: propSelectedLowerQuantile, selectedUpperQuantile: propSelectedUpperQuantile, onLowerQuantileChange, onUpperQuantileChange, overlayForecastData: forecastData, }: IntervalsOverlayProps): import("react/jsx-runtime").JSX.Element;
export {};
