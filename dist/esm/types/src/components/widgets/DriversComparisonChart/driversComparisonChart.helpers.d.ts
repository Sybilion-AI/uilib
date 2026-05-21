import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { BacktestsComponentPayload } from '@sybilion/platform-sdk';
export declare const DRIVER_FORECAST_ID_BASE = 8000000;
export declare const INITIAL_VISIBLE_SERIES_COUNT = 3;
/** Months of historical context before the earliest forecast month (inclusive). */
export declare const DRIVER_COMPARISON_CHART_LEAD_MONTHS = 6;
export declare function formatSeriesImportance(value: number | null): string;
export declare function mergeBacktestsChartData(payload: BacktestsComponentPayload | null): ChartDataPoint[];
/** While drivers comparison is not loaded: dataset historical only. After load: normalized historical from target.normalized_series (see mergeBacktestsChartData) replaces it. */
export declare function mergeDatasetHistoricalWithBacktestsChartData(datasetHistorical: ChartDataPoint[], backtestsMerged: ChartDataPoint[]): ChartDataPoint[];
/**
 * For each driver, first month with materially non-zero value; anchor = median of those months.
 * (Min is too early with outliers; max matched logs where one driver started 2017-12 while most started 2015-01.)
 */
export declare function getZoomAnchorMonthFromDriverMaterialStarts(points: ChartDataPoint[], forecastIds: number[]): {
    anchor: string | null;
    perDriverFirstMaterial: string[];
};
export declare function subtractMonthsFromMonthStart(date: string, count: number): string;
/**
 * Backtests payload often starts at the same month for target + drivers, so xMin falls
 * in a range with no rows. Prepend historical-only months from raw dataset series
 * (scaled to the first normalized point) so the lead-in shows the target line alone.
 */
export declare function prependHistoricalLeadFromDataset(points: ChartDataPoint[], datasetHistorical: ChartDataPoint[], xMin: string): ChartDataPoint[];
export declare function buildDriversComparisonChartData(mergedWithHistorical: ChartDataPoint[], datasetHistorical: ChartDataPoint[], forecastIds: number[]): ChartDataPoint[];
