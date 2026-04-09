import { HTMLAttributes } from 'react';

/**
 * Quantile forecast data structure
 */
export interface QuantileForecast {
  [quantile: string]: number; // e.g., "0.1": 812.202, "0.5": 863.574, "0.9": 935.312
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
  // Quantile values
  q10?: number;
  q15?: number;
  q25?: number;
  q50?: number;
  q75?: number;
  q85?: number;
  q90?: number;
  // Quantile band ranges as [lower, upper] arrays for Recharts Area
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
  quantiles: [string, string]; // [lower, upper] e.g., ["0.1", "0.9"]
  opacity: number;
  color?: string;
  name: string;
  // Area style options
  strokeWidth?: number;
  strokeDasharray?: string; // e.g., "5 5" for dashed, "2 2" for dotted
  strokeOpacity?: number;
  type?:
    | 'monotone'
    | 'linear'
    | 'step'
    | 'stepBefore'
    | 'stepAfter'
    | 'basis'
    | 'natural';
  fillPattern?: 'solid' | 'dots' | 'lines'; // For future pattern support
}

/**
 * Component props
 */
export interface ChartForecastProbabilisticProps
  extends HTMLAttributes<HTMLDivElement> {
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
