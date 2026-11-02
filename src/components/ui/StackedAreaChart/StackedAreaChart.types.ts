import { HTMLAttributes, ReactNode } from 'react';

export type StackedAreaChartDatum = Record<
  string,
  string | number | null | undefined
>;

export interface StackedAreaChartLayer {
  /** Data key of the layer in each datum. A value that is not a number stacks as 0. */
  key: string;
  /** Legend and tooltip label; falls back to the key. */
  label?: ReactNode;
  /** CSS colour; falls back to the built-in series palette. */
  color?: string;
}

export interface StackedAreaChartOverlay {
  /** Data key of the line in each datum. Gaps are bridged. */
  key: string;
  /** Legend and tooltip label; falls back to the key. */
  label?: ReactNode;
  /** CSS colour; falls back to the foreground colour. */
  color?: string;
  /**
   * Shade the x ranges where this line is above or below the stacked total
   * (the visible layers plus the margin), changing at rows. Hidden with the
   * line. At most one overlay should set it; the first one that does is used.
   */
  compare?: boolean;
}

export interface StackedAreaChartMargin {
  /**
   * Margin on top of the layers, in percent of the layers' total at each x.
   * null or 0 hides the margin layer; it stays mounted, so changing it as the
   * user types does not redraw the chart from scratch.
   */
  pct: number | null;
  /** Legend and tooltip label; defaults to `margin <pct>%`. */
  label?: ReactNode;
  /** CSS colour of the margin layer. */
  color?: string;
}

export interface StackedAreaChartZoneLabels {
  above: ReactNode;
  below: ReactNode;
}

export interface StackedAreaChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Rows in x order. */
  data: StackedAreaChartDatum[];
  /** Data key holding the x value (a date string such as `2026-01-01`, or a label). */
  xKey: string;
  /** Stacked layers, bottom first. */
  layers: StackedAreaChartLayer[];
  /** Lines drawn over the stack (e.g. prices paid). */
  overlays?: StackedAreaChartOverlay[];
  /** An extra layer on top of the stack, a percentage of the layers' total. */
  margin?: StackedAreaChartMargin;
  /** Show each layer's share of the total at the last x with a total, in the legend. */
  showWeights?: boolean;
  /**
   * Label the x axis by year, one tick at the first row of each year, when
   * the x values are dates (`YYYY…`) spanning at least three years.
   */
  yearTicks?: boolean;
  /**
   * With fewer rows than this, the stack draws as bars (an area needs a
   * few points to show anything). Default 3.
   */
  barsBelow?: number;
  /** Legend labels of the compare zones. */
  zoneLabels?: StackedAreaChartZoneLabels;
  /** Keys of hidden layers and overlays. With it, the host owns visibility. */
  hiddenKeys?: ReadonlySet<string>;
  /** Called with a layer or overlay key when its legend entry is clicked. */
  onToggleKey?: (key: string) => void;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  /** Formats numeric y-axis ticks and tooltip values. */
  valueFormatter?: (value: number) => string;
  /** Formats x-axis ticks (ignored for year ticks, which show the year). */
  xTickFormatter?: (value: string | number) => string;
  /** Formats the tooltip's x label. */
  tooltipLabelFormatter?: (value: string | number) => string;
  /** Fixed chart height in px; defaults to a 16:9 responsive box. */
  height?: number;
}
