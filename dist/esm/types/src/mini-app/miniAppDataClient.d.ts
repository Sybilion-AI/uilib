import type { MiniAppDataset, MiniAppDriversComparisonSnapshot, MiniAppForecastMap, MiniAppPerformanceBundle } from './miniAppDataTypes';
export type MiniAppDataClientOptions = {
    /** Default 10000 ms. */
    timeoutMs?: number;
};
export type MiniAppDataClient = {
    getDatasets(): Promise<MiniAppDataset[]>;
    getDataset(id: number): Promise<MiniAppDataset | null>;
    getForecasts(datasetId: number): Promise<MiniAppForecastMap>;
    getForecast(datasetId: number, analysisId: number): Promise<unknown | null>;
    getDrivers(datasetId: number, analysisId: number): Promise<unknown[]>;
    getPerformanceData(datasetId: number, analysisId: number): Promise<MiniAppPerformanceBundle>;
    getDriversComparisonData(datasetId: number, analysisId: number): Promise<MiniAppDriversComparisonSnapshot>;
};
/** One listener per browsing context; tracks in-flight bridge requests by `requestId`. */
export declare function createMiniAppDataClient(options?: MiniAppDataClientOptions): MiniAppDataClient;
