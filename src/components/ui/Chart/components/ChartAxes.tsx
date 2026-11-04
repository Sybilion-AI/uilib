import { useMemo, useRef } from 'react';

import { Label, XAxis, YAxis } from 'recharts';

import {
  formatNumber as defaultFormatNumber,
  formatYAxisNumber,
  generateRoundedYTicks,
} from '../tools/formatters';

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
   * Draw no axes. A hidden x-axis is kept, so the tooltip still names the
   * row's date. The y-axis keeps fixed `yMin`/`yMax` (with `autoScaleYAxis`
   * off) as its range, widened if the data goes past it; otherwise it is
   * recharts' default, as without axes.
   */
  hide?: boolean;
}

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
  let yDomain:
    | [
        (
          | number
          | string
          | 'auto'
          | 'dataMin'
          | 'dataMax'
          | ((dataMin: number) => number)
        ),
        (
          | number
          | string
          | 'auto'
          | 'dataMin'
          | 'dataMax'
          | ((dataMax: number) => number)
        ),
      ]
    | undefined;

  if (autoScaleYAxis) {
    yDomain = [
      (dataMin: number) => dataMin * 0.95,
      (dataMax: number) => dataMax * 1.05,
    ];
  } else if (yMin !== undefined && yMax !== undefined) {
    yDomain = [yMin, yMax];
  }

  return (
    <>
      <XAxis
        className={xAxisClassName}
        dataKey="date"
        hide={hide}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={32}
        tick={{ fill: tickColor }}
        tickFormatter={value => formatDate(value as string)}
        {...(xMin !== undefined &&
          xMax !== undefined && { domain: [xMin, xMax] })}
      >
        {xAxisLabel && (
          <Label value={xAxisLabel} position="insideBottom" offset={-5} />
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
