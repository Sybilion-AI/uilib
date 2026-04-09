import { HTMLAttributes } from 'react';
/**
 * Quantile forecast data structure
 */
export interface QuantileForecast {
    [quantile: string]: number;
}
/**
 * Forecast series with quantile data
 */
export interface ForecastSeriesPoint {
    forecast: number;
    quantile_forecast?: QuantileForecast;
}
export interface ForecastSeries {
    [date: string]: ForecastSeriesPoint;
}
export interface ForecastData {
    forecast_series: ForecastSeries;
    forecast_start?: string;
    forecast_end?: string;
    forecast_horizon?: number;
    last_valid_data_index?: string;
}
/**
 * Time series data point [date, value]
 */
export type TimeSeriesPoint = [string, number];
/**
 * Chart data point for Recharts
 */
export interface ChartDataPoint {
    date: string;
    historical?: number;
    forecast?: number;
    q10?: number;
    q15?: number;
    q25?: number;
    q50?: number;
    q75?: number;
    q85?: number;
    q90?: number;
    band_10_90?: [number, number];
    band_15_85?: [number, number];
    band_25_75?: [number, number];
    [key: string]: string | number | [number, number] | undefined;
}
/**
 * Quantile band configuration
 */
export interface QuantileBandConfig {
    key: string;
    quantiles: [string, string];
    opacity: number;
    color?: string;
    name: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    strokeOpacity?: number;
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter' | 'basis' | 'natural';
    fillPattern?: 'solid' | 'dots' | 'lines';
}
/**
 * Component props
 */
export interface ChartForecastProbabilisticProps extends HTMLAttributes<HTMLDivElement> {
    /** Historical time series data */
    historicalData: TimeSeriesPoint[];
    /** Forecast data with quantiles */
    forecastData: ForecastData;
    /** Show quantile bands */
    showQuantiles?: boolean;
    /** Custom quantile band configurations (overrides defaults) */
    quantileBands?: QuantileBandConfig[];
    /** Chart is in loading state */
    loading?: boolean;
    /** Dark theme mode */
    isDarkTheme?: boolean;
    /** Focused view (zoomed time range) */
    focused?: boolean;
    /** Chart height in pixels */
    height?: number;
    /** Optional CSS class name */
    className?: string;
}
