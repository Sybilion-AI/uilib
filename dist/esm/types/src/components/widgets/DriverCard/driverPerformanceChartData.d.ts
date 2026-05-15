import type { DriverData } from '../DriverMap/driverMapGeography';
export type DriverPerformanceChartPoint = {
    date: Date;
    value: number;
};
/** Last non-null points from `normalized_series`, or deterministic fallback sample. */
export declare function generateDriverChartData(driver: DriverData, precision?: number): DriverPerformanceChartPoint[];
