import type { Analysis, ChartDataPoint } from './ChartAreaInteractive.types';
export declare const formatNumber: (value: number) => string;
export declare const findPinPositionForDate: (targetDate: string, filteredData: ChartDataPoint[]) => number;
declare const timeRangeToMonths: {
    readonly '6m': 6;
    readonly '1y': 12;
    readonly '3y': 36;
    readonly '5y': 60;
    readonly All: 12;
};
export type TimeRange = keyof typeof timeRangeToMonths;
export type FilterDataForTimeRangeOptions = {
    /** When set (e.g. selected forecast on Forecast tab), the window ends at the
     *  latest point that has shared historical or that analysis — not at another run. */
    endDateAnchorAnalysisId?: number | null;
};
export declare const filterDataForTimeRange: (data: ChartDataPoint[], currentTimeRange: TimeRange, options?: FilterDataForTimeRangeOptions) => ChartDataPoint[];
export declare const shortDateFormatter: (value: string) => string;
export declare const longDateFormatter: (value: string) => string;
/**
 * Checks if an analysis status is 'fail' (case-insensitive).
 * @param analysis - The analysis object with optional status field
 * @returns true if status is 'fail', false otherwise
 */
export declare const isAnalysisFailed: (analysis: Analysis | {
    status?: string;
}) => boolean;
/**
 * Checks if an analysis status is not 'fail' (case-insensitive).
 * @param analysis - The analysis object with optional status field
 * @returns true if status is not 'fail', false otherwise
 */
export declare const isAnalysisNotFailed: (analysis: Analysis | {
    status?: string;
}) => boolean;
export {};
