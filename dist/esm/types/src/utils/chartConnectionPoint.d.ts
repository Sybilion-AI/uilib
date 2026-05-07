/**
 * Utility functions for ensuring consistent connection points between historical and forecast data
 * across all chart components.
 */
import type { SeriesForecastData, TimeSeriesPoint } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
export type EnsureChartForecastBridgeOptions = {
    forecastSeriesIds?: number[];
    /** When true, returns `chartData` unchanged */
    disabled?: boolean;
};
/**
 * Injects `forecast_{id}` on the row before each series’ first forecast month (historical value)
 * so dashed forecast lines meet the historical line. Matches sybilion-client bridge behavior.
 * Never overwrites an existing forecast value on that row.
 */
export declare function ensureChartForecastBridge(chartData: ChartDataPoint[], options?: EnsureChartForecastBridgeOptions): ChartDataPoint[];
/**
 * Find the last valid historical data point (filtering out null/undefined values)
 */
export declare function findLastValidHistoricalPoint(historical: TimeSeriesPoint[]): TimeSeriesPoint | null;
/**
 * Find the last valid historical data point from ChartDataPoint array
 */
export declare function findLastValidHistoricalChartPoint(historical: ChartDataPoint[]): ChartDataPoint | null;
/**
 * Check if two dates are in the same month (ignoring day)
 */
export declare function isSameMonth(date1: string, date2: string): boolean;
/**
 * Normalize date to first day of month for comparison (YYYY-MM-01)
 */
export declare function normalizeToMonthStart(date: string): string;
/**
 * Find the earliest date from forecast_series keys
 * This represents the first forecast date
 */
export declare function findEarliestForecastDate(forecastSeries: Record<string, unknown>): string | null;
/**
 * Find the latest date from forecast_series keys
 * This represents the last forecast date
 */
export declare function findLatestForecastDate(forecastSeries: Record<string, unknown>): string | null;
/**
 * Get the previous month date (first day of previous month)
 */
export declare function getPreviousMonth(date: string): string;
/**
 * Get the next month date (first day of next month)
 */
export declare function getNextMonth(date: string): string;
/**
 * Ensure forecast data includes a connection point at the previous month before the first forecast
 * This ensures visual continuity without overwriting actual forecast values
 *
 * We don't use last_valid_data_index - we derive the connection point directly from the forecast data:
 * 1. Find the earliest date from forecast_series (first forecast date)
 * 2. Get the previous month (connection point date)
 * 3. Add connection point at that date with the historical value from that month
 */
export declare function ensureForecastConnectionPoint(forecast: SeriesForecastData, historical: TimeSeriesPoint[]): SeriesForecastData;
