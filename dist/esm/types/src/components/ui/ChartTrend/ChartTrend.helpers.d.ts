import type { ChartDataPoint, MeanCPDData, TimeSeriesPoint, TrendAnnotation, TrendBoundary } from './ChartTrend.types';
/**
 * Filter historical data to show only recent years
 */
export declare const filterHistoricalByYears: (historical: TimeSeriesPoint[], years: number) => TimeSeriesPoint[];
/**
 * Transform historical and CPD data into Recharts format
 */
export declare const transformToChartData: (historical: TimeSeriesPoint[], meanCPD: MeanCPDData, restricted?: boolean) => ChartDataPoint[];
/**
 * Calculate trend boundaries for visualization
 */
export declare const calculateTrendBoundaries: (meanCPD: MeanCPDData, historical: TimeSeriesPoint[], restricted?: boolean) => TrendBoundary | null;
/**
 * Generate annotations for trend visualization
 */
export declare const generateAnnotations: (meanCPD: MeanCPDData, boundaries: TrendBoundary) => TrendAnnotation[];
/**
 * Calculate chart Y-axis range
 */
export declare const calculateYAxisRange: (historical: TimeSeriesPoint[], boundaries?: TrendBoundary | null, restricted?: boolean) => [number, number];
/**
 * Format number for display
 */
export declare const formatNumber: (value: number) => string;
/**
 * Format date for display
 */
export declare const formatDate: (dateStr: string, long?: boolean) => string;
