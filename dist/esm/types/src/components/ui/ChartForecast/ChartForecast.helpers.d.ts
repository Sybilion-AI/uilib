import type { ChartDataPoint, ForecastData, TimeSeriesPoint } from './ChartForecast.types';
/**
 * Add connection point between historical and forecast data at the previous month before first forecast.
 * Ensures visual continuity without overwriting forecast values.
 */
export declare const addConnectionPoint: (forecast: ForecastData, historical: TimeSeriesPoint[]) => ForecastData;
/**
 * Transform historical and forecast data into Recharts format
 */
export declare const transformToChartData: (historical: TimeSeriesPoint[], forecast: ForecastData, horizon?: "6m" | "12m" | "24m") => ChartDataPoint[];
/**
 * Calculate chart x-axis range based on mode
 */
export declare const calculateXAxisRange: (chartData: ChartDataPoint[], focused?: boolean) => [string, string];
