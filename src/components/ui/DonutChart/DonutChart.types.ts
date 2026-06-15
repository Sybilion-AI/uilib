import { HTMLAttributes, ReactNode } from 'react';

export interface DonutChartDatum {
  /** Unique slice key; used for tooltip/legend label lookups. */
  key: string;
  value: number;
  /** Human-readable label; falls back to the key. */
  label?: ReactNode;
  /** CSS colour; falls back to the built-in series palette. */
  color?: string;
}

export interface DonutChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  data: DonutChartDatum[];
  /** Radius of the donut hole; px number or percentage string. */
  innerRadius?: number | string;
  /** Outer radius of the donut; px number or percentage string. */
  outerRadius?: number | string;
  /** Large figure rendered in the centre of the donut hole. */
  centerValue?: string | number;
  /** Small caption rendered under the centre value. */
  centerCaption?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Fixed chart height in px; defaults to a square capped at 320px. */
  height?: number;
}
