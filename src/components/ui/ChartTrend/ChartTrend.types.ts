import { HTMLAttributes } from 'react';

/**
 * Time series data point [date, value]
 */
export type TimeSeriesPoint = [string, number];

/**
 * Change point detection data for Mean CPD
 */
export interface MeanChangePoint {
  sign: number; // -1 (decreasing), 0 (stable), 1 (increasing)
  prev_coef: number[]; // [intercept, ...]
  prev_period_est: TimeSeriesPoint[];
  next_period_est: TimeSeriesPoint[];
}

export interface MeanCPDMetrics {
  sensitivity_threshold: number;
  fc_metrics: {
    recall: number;
  };
  consistency_metrics: {
    fc_ignore_noise_class: number;
    fc_with_noise_class: number;
  };
}

export interface MeanCPDData {
  change_points: MeanChangePoint[];
  cpd_metrics: MeanCPDMetrics;
}

/**
 * Change point detection data for Slope CPD
 */
export interface SlopeChangePoint {
  sign: number;
  prev_coef: number[]; // [intercept, slope]
  prev_period_est: TimeSeriesPoint[];
  next_period_est: TimeSeriesPoint[];
}

export interface SlopeCPDData {
  change_points: SlopeChangePoint[];
  cpd_metrics: {
    sensitivity_threshold: number;
  };
}

/**
 * Trend type
 */
export type TrendType = 'mean' | 'slope';

/**
 * Main component props
 */
export interface ChartTrendProps extends HTMLAttributes<HTMLDivElement> {
  /** Historical time series data */
  historicalData: TimeSeriesPoint[];
  
  /** Mean CPD data (for mean trend) */
  meanCPD?: MeanCPDData;
  
  /** Slope CPD data (for slope trend) */
  slopeCPD?: SlopeCPDData;
  
  /** Type of trend visualization */
  trendType?: TrendType;
  
  /** Show annotations with percentages */
  showAnnotations?: boolean;
  
  /** Restricted mode (prevents negative values) */
  restricted?: boolean;
  
  /** Chart is in loading state */
  loading?: boolean;
  
  /** Dark theme mode */
  isDarkTheme?: boolean;
  
  /** Chart height in pixels */
  height?: number;
  
  /** Focus range (years to show before last data point) */
  focusYears?: number;
  
  /** Optional CSS class name */
  className?: string;
}

/**
 * Data point for Recharts
 */
export interface ChartDataPoint {
  date: string;
  historical?: number;
  historical_avg?: number;
  upper_boundary?: number;
  lower_boundary?: number;
  upper_area?: number;
  lower_area?: number;
  [key: string]: string | number | undefined;
}

/**
 * Trend boundary configuration
 */
export interface TrendBoundary {
  dates: string[];
  lower: number[];
  upper: number[];
  color: string;
}

/**
 * Annotation configuration
 */
export interface TrendAnnotation {
  x: string;
  y: number;
  text: string;
  color: string;
}
