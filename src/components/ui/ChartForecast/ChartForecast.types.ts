import { HTMLAttributes } from 'react';

/**
 * Forecast data structure matching API response
 */
export interface ForecastSeries {
  [date: string]: {
    forecast: number;
    lower_boundary?: {
      '6m'?: number;
      '12m'?: number;
      '24m'?: number;
      [key: string]: number | undefined;
    };
    upper_boundary?: {
      '6m'?: number;
      '12m'?: number;
      '24m'?: number;
      [key: string]: number | undefined;
    };
    quantile_forecast?: {
      [quantile: string]: number;
    };
  };
}

export interface ForecastData {
  forecast_series: ForecastSeries;
  forecast_start?: string;
  forecast_end?: string;
  last_valid_data_index?: string;
}

/**
 * Time series data point [date, value]
 */
export type TimeSeriesPoint = [string, number];

/**
 * Change point detection data
 */
export interface ChangePointDetection {
  MeanCPD: {
    change_points: Array<{
      sign: number;
      prev_coef: number[];
      prev_period_est: TimeSeriesPoint[];
      next_period_est: TimeSeriesPoint[];
    }>;
    cpd_metrics: {
      sensitivity_threshold: number;
      fc_metrics: {
        recall: number;
      };
      consistency_metrics: {
        fc_ignore_noise_class: number;
        fc_with_noise_class: number;
      };
    };
  };
  SlopeCPD?: {
    change_points: Array<{
      sign: number;
      prev_coef: number[];
      prev_period_est: TimeSeriesPoint[];
    }>;
    cpd_metrics: {
      sensitivity_threshold: number;
    };
  };
}

/**
 * Chart visualization mode
 */
export type ChartMode =
  | 'deterministic'
  | 'probabilistic'
  | 'boundaries'
  | 'cloud';

/**
 * Main component props
 */
export interface ChartForecastProps extends HTMLAttributes<HTMLDivElement> {
  /** Historical time series data */
  historicalData: TimeSeriesPoint[];

  /** Forecast data from API */
  forecastData: ForecastData;

  /** Optional change point detection data for boundaries */
  changePoints?: ChangePointDetection;

  /** Chart visualization mode */
  mode?: ChartMode;

  /** Show confidence bands (24m by default) */
  showConfidenceBands?: boolean;

  /** Show guard rails / boundaries */
  showBoundaries?: boolean;

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

/**
 * Data point for Recharts
 */
export interface ChartDataPoint {
  date: string;
  historical?: number;
  forecast?: number;
  lower_boundary?: number;
  upper_boundary?: number;
  [key: string]: string | number | undefined;
}

/**
 * Confidence band configuration
 */
export interface ConfidenceBandConfig {
  horizon: '6m' | '12m' | '24m' | '60m';
  opacity: number;
  color: string;
}
