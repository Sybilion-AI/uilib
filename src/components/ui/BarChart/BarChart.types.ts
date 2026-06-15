import { HTMLAttributes, ReactNode } from 'react';

export type BarChartDatum = Record<string, string | number | null | undefined>;

export interface BarChartSeries {
  /** Data key of the series in each datum. */
  key: string;
  /** Human-readable label; falls back to the key. */
  label?: ReactNode;
  /** CSS colour; falls back to the built-in series palette. */
  color?: string;
}

/** Direction the bars grow in: vertical bars rise up, horizontal bars extend right. */
export type BarChartOrientation = 'vertical' | 'horizontal';

export type BarChartMode = 'grouped' | 'stacked';

export interface BarChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  data: BarChartDatum[];
  /** Data key holding the category label (x axis for vertical bars). */
  categoryKey: string;
  series: BarChartSeries[];
  orientation?: BarChartOrientation;
  mode?: BarChartMode;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  /** Formats numeric axis tick values. */
  valueFormatter?: (value: number) => string;
  /** Fixed chart height in px; defaults to a 16:9 responsive box. */
  height?: number;
}
