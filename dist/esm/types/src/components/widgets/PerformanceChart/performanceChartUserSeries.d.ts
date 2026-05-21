import type { ForecastData } from '#uilib/types/forecast-data';
export declare const SPAGHETTI_TIME_SERIES_MATRIX_V: 2;
export interface SpaghettiPerformanceMatrixPayload {
    v: typeof SPAGHETTI_TIME_SERIES_MATRIX_V;
    dates: string[];
    horizonKeys: string[];
    grid: number[][];
    perHorizonDates?: string[][];
}
export declare const SPAGHETTI_MATRIX_SYNTHETIC_BASE = 9800000;
export declare const SPAGHETTI_MATRIX_MAX_COLS = 128;
export declare const SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID = 9000001;
export declare function spaghettiMatrixSyntheticId(userSeriesRowId: number, horizonIndex: number): number;
export declare function isSpaghettiMatrixSyntheticLineId(id: number): boolean;
export declare function getCustomMatrixSeriesForHorizonTab(matrix: SpaghettiPerformanceMatrixPayload, horizonKey: string, rowId: number, forecastData: Record<string, ForecastData> | undefined): {
    lineId: number;
    dates: string[];
    forecastValues: number[];
} | null;
export declare function tryParseSpaghettiPerformanceMatrix(parsed: unknown): SpaghettiPerformanceMatrixPayload | null;
