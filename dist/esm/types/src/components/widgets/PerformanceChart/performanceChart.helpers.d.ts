/**
 * Helper functions for Performance Tab calculations
 * Note: ROI/calculatons.ts is only for reference/example
 */
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastData } from '#uilib/types/forecast-data';
import type { SpaghettiPerformanceMatrixPayload } from './performanceChartUserSeries';
export type RealBacktestsEntry = {
    forecast_start: string;
    forecast_end: string;
    forecast_series: Record<string, number>;
};
/** Legacy: API backtest spaghetti lines used `SPAGHETTI_FORECAST_ID_BASE + i` (spaghetti view now uses drift per-horizon instead). */
export declare const SPAGHETTI_FORECAST_ID_BASE = 6000;
/** Model PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_MODEL_PER_HORIZON_ID_BASE + i`. */
export declare const SPAGHETTI_MODEL_PER_HORIZON_ID_BASE = 7000;
/** Drift PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE + i`. */
export declare const SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE = 8000;
export declare function isSpaghettiModelPerHorizonLineId(id: number): boolean;
export declare function isSpaghettiDriftPerHorizonLineId(id: number): boolean;
/**
 * Converts `performance.model` / `performance.drift` per-horizon forecasts into synthetic
 * backtest-shaped entries: each line is [horizon_1[i], …, horizon_n[i]] as date→value points
 * (aligned by sorted key index per horizon).
 */
export declare function buildPerHorizonSpaghettiEntries(forecastRoot: {
    forecasts?: Record<string, Record<string, number>>;
} | null | undefined, horizonKeys: string[]): RealBacktestsEntry[];
/**
 * Same row alignment as {@link buildPerHorizonSpaghettiEntries}: row `i` uses each horizon's
 * i-th sorted forecast month; `dates[i]` is horizon_1's month at that row (Date column).
 * Use this for custom dialog seed + “copy statistical baseline (drift)” prefill.
 */
export declare function buildDriftSpaghettiMatrixForCustomDialog(driftRoot: {
    forecasts?: Record<string, Record<string, number>>;
} | null | undefined, horizonKeys: string[]): {
    dates: string[];
    grid: number[][];
    perHorizonDates: string[][];
} | null;
/**
 * Prefill for custom performance when copying drift layout: each spaghetti row is flat at the
 * historical value for the month before the earliest forecast month in that row (same anchor as
 * chart connection-point logic).
 */
export declare function spaghettiGridFromHistoricalPreviousMonth(perHorizonDates: string[][], horizonCount: number, historicalByDate: Map<string, number>): number[][];
/** Mean absolute error / MAPE vs historical for one horizon column of a spaghetti matrix (aligned by month). */
export declare function averageForecastErrorsVsHistoricalForMatrixColumn(matrix: SpaghettiPerformanceMatrixPayload, horizonColumnIndex: number, historicalByDate: Map<string, number>): {
    mae: number;
    mape: number;
} | null;
/** @deprecated Use {@link buildPerHorizonSpaghettiEntries} (same implementation). */
export declare const buildModelPerHorizonSpaghettiEntries: typeof buildPerHorizonSpaghettiEntries;
export declare function mergeSpaghettiMergedBases(a: {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
}, b: {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
}): {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
};
export declare function buildSpaghettiMergedChartData(entries: RealBacktestsEntry[], historicalChartData: ChartDataPoint[], idBase?: number): {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
};
/** Appends forecast-backed user series (from dataset context) onto spaghetti backtest lines. */
export declare function mergeSpaghettiUserSeriesFromForecastData(base: {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
}, userSeries: {
    id: number;
    name?: string;
}[], forecastData: Record<string, ForecastData>): {
    mergedData: ChartDataPoint[];
    seriesMeta: {
        id: number;
        label: string;
    }[];
};
export declare function filterChartDataLast24Months(data: ChartDataPoint[], months: number): ChartDataPoint[];
/**
 * Spaghetti chart x-range: from two months before the earliest forecast_start
 * (per-horizon synthetic entries + mergeable user forecast series), inclusive.
 * Falls back to last N months when no forecast candidates exist.
 *
 * When `historicalWindowFloor` is set (e.g. first month of per-horizon `filtered24mData`),
 * the range start is floored to that month so the historical line matches the per-horizon tab.
 *
 * When `historicalWindowCeiling` is set (e.g. last month of `filtered24mData`), drops points after
 * that month so spaghetti X matches per-horizon (per-horizon chart trims forecasts past last historical).
 */
export declare function filterSpaghettiDataFromEarliestForecastStart(mergedData: ChartDataPoint[], entries: RealBacktestsEntry[], userSeries: {
    id: number;
    name?: string;
}[], forecastData: Record<string, ForecastData>, 
/** Series meta from the first merged batch (e.g. drift) — used to skip duplicate user-series ids. */
firstBatchSeriesMeta: {
    id: number;
    label: string;
}[], fallbackMonths: number, extraForecastCandidates?: RealBacktestsEntry[], historicalWindowFloor?: string | null, historicalWindowCeiling?: string | null): ChartDataPoint[];
/**
 * Ensure each spaghetti row has `historical` from {@link historicalChartData} when that month
 * falls in the filtered window — matches per-horizon chart (actuals line), and fills months that
 * exist in history but were missing after merge/filter.
 */
export declare function mergeHistoricalIntoSpaghettiChartData(filteredRows: ChartDataPoint[], historicalChartData: ChartDataPoint[]): ChartDataPoint[];
/**
 * Calculate Accuracy: 100% - MAPE
 * @param mape - MAPE value as decimal (e.g., 0.0436 for 4.36%)
 * @returns Accuracy percentage
 */
export declare function calculateAccuracy(mape: number): number;
/**
 * Format Accuracy as percentage
 * @param value - Accuracy value
 * @returns Formatted accuracy string (e.g., "97%")
 */
export declare function formatAccuracy(value: number): string;
/**
 * Format Error as "$/Ton"
 * @param mae - MAE value from metrics_summary.24m.mae
 * @returns Formatted error string (e.g., "0.05$/Ton")
 */
export declare function formatError(mae: number): string;
/**
 * Calculate ROI
 * Reference: ROI/calculatons.ts for example logic
 * @param totalBenefit - Total annual benefit
 * @param operatingCost - Annual operating cost
 * @returns ROI percentage
 */
export declare function calculateROI(totalBenefit: number, operatingCost: number): number;
/**
 * Calculate ROI Multiple
 * Formula: ROI Multiple = ROI / 100
 * Where ROI = (AB - IC) / IC × 100
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns ROI multiple (e.g., 1.0 for 100% ROI, 2.0 for 200% ROI)
 */
export declare function calculateROIMultiple(totalBenefit: number, operatingCost: number): number;
/**
 * Format ROI as multiplier (xN format)
 * Formula: ROI Multiple = ROI / 100
 * Examples: 100% ROI = x1, 200% ROI = x2, 0% ROI = x0
 * Note: Negative ROI (when benefit < cost) is displayed as x1
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns Formatted ROI string (e.g., "x1.5")
 */
export declare function formatROI(totalBenefit: number, operatingCost: number): string;
/**
 * Calculate Benefit p/a
 * Formula: Annual Benefit = PV × V × C × PI
 * Where:
 * - PV = Procurement Volume
 * - V = Variable Raw Material Share (as decimal)
 * - C = Controllable Cost Share (as decimal)
 * - PI = Price Improvement = |FA_new - FA_current| × 0.2 (correlation factor)
 * @param mae - MAE value (not used in calculation, kept for backward compatibility)
 * @param mape - MAPE value (used to calculate actual forecast accuracy)
 * @param adjustParams - Adjust parameters from dialog
 * @param baselineAccuracy - Optional baseline accuracy for comparison (if provided, uses actual improvement)
 * @returns Benefit per annum
 */
export declare function calculateBenefit(mae: number, mape: number, adjustParams: {
    procurementVolume: number;
    variableRawMaterialCostShare: number;
    controllableCosts: number;
    currentForecastAccuracy: number;
    expectedImprovement: number;
    analystHourlyRate: number;
}, baselineAccuracy?: number): number;
/**
 * Format Benefit as euros
 * @param value - Benefit value
 * @returns Formatted benefit string (e.g., "€616.640")
 */
export declare function formatBenefit(value: number): string;
/**
 * Map forecast model key to display name
 * @param key - Forecast model key (e.g., "mean", "drift", "seasonal")
 * @returns Display name (e.g., "Mean", "Drift", "Seasonal")
 */
export declare function getForecastModelDisplayName(key: string): string;
/**
 * Calculate Y range (min/max) from chart data points
 * Extracts all numeric values from chart data points and calculates min/max with padding
 * @param chartData - Array of chart data points
 * @returns Object with yMin and yMax values
 */
export declare function calculateYRangeFromChartData(chartData: Array<Record<string, unknown>>): {
    yMin: number;
    yMax: number;
};
