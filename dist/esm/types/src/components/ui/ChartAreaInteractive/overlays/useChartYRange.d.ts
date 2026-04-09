import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
interface UseChartYRangeOptions {
    baseChartProps: BaseChartWrapperProps;
    chartData?: ChartDataPoint[];
    disableRescaleWhenQuantileChanges?: boolean;
    excludeQuantileBands?: boolean;
    selectedForecastId?: number;
}
/**
 * Hook to calculate yMin and yMax from chart data
 * Optionally includes quantile values from forecast data
 */
export declare function useChartYRange({ baseChartProps, chartData, disableRescaleWhenQuantileChanges, excludeQuantileBands, selectedForecastId, }: UseChartYRangeOptions): {
    yMin: number;
    yMax: number;
};
export {};
