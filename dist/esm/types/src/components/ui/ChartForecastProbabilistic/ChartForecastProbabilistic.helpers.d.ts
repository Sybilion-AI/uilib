import type { ChartDataPoint, ForecastData, TimeSeriesPoint } from './ChartForecastProbabilistic.types';
/**
 * Transform historical and forecast data to chart format
 * Includes connection point logic to ensure visual continuity
 */
export declare function transformToChartData(historicalData: TimeSeriesPoint[], forecastData: ForecastData): ChartDataPoint[];
/**
 * Calculate X-axis range for focused/full view
 */
export declare function calculateXAxisRange(chartData: ChartDataPoint[], focused: boolean): [number, number];
/**
 * Get quantile value from data point by quantile string
 */
export declare function getQuantileValue(point: ChartDataPoint, quantile: string): number | undefined;
