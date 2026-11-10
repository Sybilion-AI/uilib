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
  /** Formats the tooltip's values (for example with a unit); without it they print as they are. */
  tooltipValueFormatter?: (value: number) => string;
  /** Formats the category axis's ticks. */
  categoryTickFormatter?: (value: string | number) => string;
  /** Formats the tooltip's category label. */
  tooltipLabelFormatter?: (value: string | number) => string;
  /** Title of the category axis. */
  categoryAxisLabel?: string;
  /** Title of the value axis. */
  valueAxisLabel?: string;
  /**
   * Keys of hidden series. With it, the host owns visibility; without it
   * (and with onToggleKey) the chart keeps the hidden set itself.
   */
  hiddenKeys?: ReadonlySet<string>;
  /**
   * Called with a series key when its legend entry is clicked. Without it the
   * legend is plain text.
   */
  onToggleKey?: (key: string) => void;
  /** Fixed chart height in px; defaults to a 16:9 responsive box. */
  height?: number;
}
