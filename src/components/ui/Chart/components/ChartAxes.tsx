import { type ComponentProps, useMemo, useRef } from 'react';

import { Label, XAxis, YAxis } from 'recharts';

import {
  formatNumber as defaultFormatNumber,
  formatYAxisNumber,
  generateRoundedYTicks,
} from '../tools/formatters';

/** Axis room for a title beside the ticks. */
const X_AXIS_HEIGHT_WITH_LABEL = 44;
const Y_AXIS_WIDTH_WITH_LABEL = 72;

interface ChartAxesProps {
  xAxisClassName?: string;
  yAxisClassName?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatDate: (value: string, detailed?: boolean) => string;
  formatNumber?: (value: number) => string;
  xMin?: string | number;
  xMax?: string | number;
  yMin?: number;
  yMax?: number;
  autoScaleYAxis?: boolean;
  /**
   * `category` (default) gives every row one slot; `number` places the rows
   * by their `date` read as a number, from the smallest to the largest.
   */
  xAxisType?: 'category' | 'number';
  /** The x values to label; without it recharts picks them. */
  xTicks?: ReadonlyArray<string | number>;
  /**
   * Draw no axes. A hidden x-axis is kept, so the tooltip still names the
   * row's date. The y-axis keeps fixed `yMin`/`yMax` (with `autoScaleYAxis`
   * off) as its range, widened if the data goes past it; otherwise it is
   * recharts' default, as without axes.
   */
  hide?: boolean;
}

const numericDate = (row: { date?: unknown }) => Number(row.date);

export function ChartAxes({
  xAxisClassName,
  yAxisClassName,
  xAxisLabel,
  yAxisLabel,
  formatDate,
  // The host's number format for the y-axis ticks; uilib's compact one
  // (K/M/B, whole numbers below 1000) without it.
  formatNumber = defaultFormatNumber,
  xMin,
  xMax,
  yMin,
  yMax,
  autoScaleYAxis = false,
  xAxisType = 'category',
  xTicks,
  hide = false,
}: ChartAxesProps) {
  const tickColor = 'var(--muted-foreground)';

  // Generate rounded ticks to avoid duplicates when we have explicit domain
  const yTicks = useMemo(() => {
    if (!hide && yMin !== undefined && yMax !== undefined && !autoScaleYAxis) {
      const ticks = generateRoundedYTicks(yMin, yMax);
      const formatter = formatNumber || formatYAxisNumber;

      // Group ticks by formatted value and keep the one closest to its rounded value
      const ticksByFormatted = new Map<string, number>();
      ticks.forEach(tick => {
        const formatted = formatter(tick);
        // Parse formatted value back to number to find the target rounded value
        const targetValue = parseFloat(formatted.replace(/[KM]$/, '')) || 0;
        const multiplier = formatted.endsWith('M')
          ? 1000000
          : formatted.endsWith('K')
            ? 1000
            : 1;
        const roundedTarget = targetValue * multiplier;

        const existing = ticksByFormatted.get(formatted);
        if (
          existing === undefined ||
          Math.abs(tick - roundedTarget) < Math.abs(existing - roundedTarget)
        ) {
          ticksByFormatted.set(formatted, tick);
        }
      });

      return Array.from(ticksByFormatted.values()).sort((a, b) => a - b);
    }
    return undefined;
  }, [hide, yMin, yMax, autoScaleYAxis, formatNumber]);

  // Determine Y-axis domain
  let yDomain: ComponentProps<typeof YAxis>['domain'];

  if (autoScaleYAxis) {
    // recharts' own fit: nice round ticks just around the data, so a series
    // moving 1000–1010 fills the chart (scaling the values by 0.95/1.05 left
    // it flat) and a negative one is padded too.
    yDomain = ['auto', 'auto'];
  } else if (yMin !== undefined && yMax !== undefined) {
    yDomain = [yMin, yMax];
  }

  return (
    <>
      <XAxis
        className={xAxisClassName}
        // A number axis reads the row's `date` as a number (rows keep it as
        // text, like every other chart's).
        dataKey={xAxisType === 'number' ? numericDate : 'date'}
        type={xAxisType}
        hide={hide}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={xTicks ? 8 : 32}
        tick={{ fill: tickColor }}
        tickFormatter={value => formatDate(value as string)}
        // Room for the title under the ticks, as BarChart and
        // StackedAreaChart keep.
        {...(xAxisLabel && { height: X_AXIS_HEIGHT_WITH_LABEL })}
        {...(xTicks && { ticks: [...xTicks] })}
        {...(xMin !== undefined && xMax !== undefined
          ? { domain: [xMin, xMax] }
          : xAxisType === 'number' && { domain: ['dataMin', 'dataMax'] })}
      >
        {xAxisLabel && (
          <Label value={xAxisLabel} position="insideBottom" offset={0} />
        )}
      </XAxis>
      {hide && !autoScaleYAxis && yMin !== undefined && yMax !== undefined && (
        <YAxis hide domain={[yMin, yMax]} />
      )}
      {!hide && (
        <YAxis
          className={yAxisClassName}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tick={{ fill: tickColor }}
          tickFormatter={formatNumber}
          {...(yAxisLabel && { width: Y_AXIS_WIDTH_WITH_LABEL })}
          {...(yDomain && { domain: yDomain })}
          {...(yTicks && { ticks: yTicks })}
          allowDataOverflow={!autoScaleYAxis}
        >
          {yAxisLabel && (
            <Label value={yAxisLabel} angle={-90} position="insideLeft" />
          )}
        </YAxis>
      )}
    </>
  );
}
