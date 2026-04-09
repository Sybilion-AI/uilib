import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { QuantileBandConfig } from '#uilib/components/ui/ChartForecastProbabilistic/ChartForecastProbabilistic.types';
import type { ForecastData } from '#uilib/types/forecast-data';
interface UseQuantileBandOptions {
    color?: string;
    chartData: ChartDataPoint[];
    selectedForecastId?: number;
    forecastData: {
        [key: string]: ForecastData;
    };
    bandKey: string;
    getBandValues: (date: string, dateIndex: number, allQuantiles: Record<string, number[]>) => [number, number] | null;
    getBandConfig: (bandKey: string, forecastColor?: string) => QuantileBandConfig;
}
/**
 * Hook to transform chart data and create quantile band configuration
 */
export declare function useQuantileBands({ color, chartData, selectedForecastId, forecastData, bandKey, getBandValues, getBandConfig, }: UseQuantileBandOptions): {
    transformedChartData: ChartDataPoint[];
    quantileBands: QuantileBandConfig[];
};
export {};
