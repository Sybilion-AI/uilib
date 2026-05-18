/**
 * Shared types for Chart primitives (quantile bands, connection points, boundaries).
 * Keeps Chart/ChartAreaInteractive independent of removed top-level forecast components.
 */

/** Time series tuple [date, value] */
export type TimeSeriesPoint = [string, number];

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

/** API-style forecast payload keyed by `forecast_series` */
export interface SeriesForecastData {
  forecast_series: ForecastSeries;
  forecast_start?: string;
  forecast_end?: string;
  last_valid_data_index?: string;
}

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

/** Recharts row shape for confidence / boundary layers */
export interface ForecastVisualizationRow {
  date: string;
  historical?: number;
  forecast?: number;
  lower_boundary?: number;
  upper_boundary?: number;
  [key: string]: string | number | undefined;
}

export interface QuantileBandConfig {
  key: string;
  /** When set, band fill follows this forecast series line color (LW chart). */
  forecastSeriesId?: number;
  quantiles: [string, string];
  opacity: number;
  color?: string;
  name: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeOpacity?: number;
  type?:
    | 'monotone'
    | 'linear'
    | 'step'
    | 'stepBefore'
    | 'stepAfter'
    | 'basis'
    | 'natural';
  fillPattern?: 'solid' | 'dots' | 'lines';
}
