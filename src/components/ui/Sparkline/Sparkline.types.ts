import { HTMLAttributes } from 'react';

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  showValue?: boolean;
  showEndDot?: boolean;
  valueFormatter?: (value: number) => string;
}

export interface SparklineChartData {
  index: number;
  value: number;
}
