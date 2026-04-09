import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import type { ForecastData } from '#uilib/types/forecast-data';
import { Analysis } from '../../ChartAreaInteractive.types';
interface ThresholdsOverlayProps {
    baseChartProps: BaseChartWrapperProps;
    selectedForecast?: Analysis;
    className?: string;
    lowerThreshold?: number;
    upperThreshold?: number;
    onLowerThresholdChange?: (value: number) => void;
    onUpperThresholdChange?: (value: number) => void;
    discreteThresholdValues?: {
        lower: number[];
        upper: number[];
    };
    overlayForecastData: Record<number, ForecastData>;
}
export declare function ThresholdsOverlay({ baseChartProps, selectedForecast, className, lowerThreshold, upperThreshold, onLowerThresholdChange, onUpperThresholdChange, discreteThresholdValues, overlayForecastData: forecastData, }: ThresholdsOverlayProps): import("react/jsx-runtime").JSX.Element;
export {};
