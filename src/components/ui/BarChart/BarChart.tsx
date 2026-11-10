import cn from 'classnames';
import { forwardRef, useMemo } from 'react';

import ChartS from '#uilib/components/ui/Chart/Chart.styl';
import type { ChartConfig } from '#uilib/components/ui/Chart/Chart.types';
import { getChartSeriesColor } from '#uilib/components/ui/Chart/chartSeriesPalette';
// Straight from the components, not the Chart index, which also loads the
// canvas chart (lightweight-charts) and its styles.
import { ChartContainer } from '#uilib/components/ui/Chart/components/ChartContainer';
import { ChartPlacedTooltip as ChartTooltip } from '#uilib/components/ui/Chart/components/ChartPlacedTooltip';
import { ChartTooltipContent } from '#uilib/components/ui/Chart/components/ChartTooltipContent';
import { useLegendState } from '#uilib/components/ui/Chart/hooks/useLegendState';
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from 'recharts';

import S from './BarChart.styl';
import { BarChartProps, BarChartSeries } from './BarChart.types';

const STACK_ID = 'stack';
/** Room for an axis title beside the ticks (recharts' default is 30). */
const CATEGORY_AXIS_HEIGHT_WITH_LABEL = 44;

const seriesColor = (item: BarChartSeries, index: number) =>
  item.color ?? getChartSeriesColor(index);

function buildChartConfig(series: BarChartSeries[]): ChartConfig {
  const config: ChartConfig = {};

  series.forEach((item, index) => {
    config[item.key] = {
      label: item.label ?? item.key,
      color: seriesColor(item, index),
    };
  });

  return config;
}

const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      className,
      data,
      categoryKey,
      series,
      orientation = 'vertical',
      mode = 'grouped',
      showLegend = true,
      showTooltip = true,
      showGrid = true,
      valueFormatter,
      tooltipValueFormatter = valueFormatter,
      categoryTickFormatter,
      tooltipLabelFormatter,
      categoryAxisLabel,
      valueAxisLabel,
      hiddenKeys,
      onToggleKey,
      height,
      ...props
    },
    ref,
  ) => {
    const config = useMemo(() => buildChartConfig(series), [series]);
    const legend = useLegendState();
    const hidden: ReadonlySet<string> = hiddenKeys ?? legend.hiddenSeries;
    // With hiddenKeys and no onToggleKey nothing can change visibility, so
    // the legend entries are not buttons.
    const toggle =
      hiddenKeys && !onToggleKey
        ? undefined
        : (key: string) => {
            onToggleKey?.(key);
            if (!hiddenKeys) legend.toggleSeries(key);
          };

    const isHorizontal = orientation === 'horizontal';
    const stackId = mode === 'stacked' ? STACK_ID : undefined;
    const barRadius: [number, number, number, number] | number =
      mode === 'stacked' ? 0 : isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0];

    const axisLine = { stroke: 'var(--border)', strokeWidth: 1 };
    const categoryLabel = categoryAxisLabel ? (
      isHorizontal ? (
        <Label value={categoryAxisLabel} angle={-90} position="insideLeft" />
      ) : (
        <Label value={categoryAxisLabel} position="insideBottom" offset={0} />
      )
    ) : null;
    const valueLabel = valueAxisLabel ? (
      isHorizontal ? (
        <Label value={valueAxisLabel} position="insideBottom" offset={0} />
      ) : (
        <Label value={valueAxisLabel} angle={-90} position="insideLeft" />
      )
    ) : null;
    const labelFormatter = tooltipLabelFormatter
      ? (label: unknown) =>
          tooltipLabelFormatter(
            typeof label === 'number' ? label : String(label ?? ''),
          )
      : undefined;

    return (
      <div ref={ref} className={cn(S.root, className)} {...props}>
        <ChartContainer
          config={config}
          style={height ? { height: `${height}px` } : undefined}
        >
          <RechartsBarChart
            data={data}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            accessibilityLayer
          >
            {showGrid && (
              <CartesianGrid
                stroke="var(--border)"
                strokeWidth={0.6}
                vertical={isHorizontal}
                horizontal={!isHorizontal}
              />
            )}
            {isHorizontal ? (
              <>
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={axisLine}
                  tickFormatter={valueFormatter}
                  height={
                    valueAxisLabel ? CATEGORY_AXIS_HEIGHT_WITH_LABEL : undefined
                  }
                >
                  {valueLabel}
                </XAxis>
                <YAxis
                  type="category"
                  dataKey={categoryKey}
                  tickLine={false}
                  axisLine={axisLine}
                  tickFormatter={categoryTickFormatter}
                  width={80}
                >
                  {categoryLabel}
                </YAxis>
              </>
            ) : (
              <>
                <XAxis
                  type="category"
                  dataKey={categoryKey}
                  tickLine={false}
                  axisLine={axisLine}
                  tickFormatter={categoryTickFormatter}
                  height={
                    categoryAxisLabel
                      ? CATEGORY_AXIS_HEIGHT_WITH_LABEL
                      : undefined
                  }
                >
                  {categoryLabel}
                </XAxis>
                <YAxis
                  type="number"
                  tickLine={false}
                  axisLine={axisLine}
                  width={48}
                  tickFormatter={valueFormatter}
                >
                  {valueLabel}
                </YAxis>
              </>
            )}
            {showTooltip && (
              <ChartTooltip
                cursor={{ fill: 'var(--muted)' }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    valueFormatter={tooltipValueFormatter}
                    labelFormatter={labelFormatter}
                  />
                }
              />
            )}
            {series.map(item => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={`var(--color-${item.key})`}
                stackId={stackId}
                radius={barRadius}
                maxBarSize={48}
                hide={hidden.has(item.key)}
              />
            ))}
          </RechartsBarChart>
        </ChartContainer>

        {showLegend && series.length > 0 && (
          <div className={cn(ChartS.legendContainer, S.legend)}>
            {series.map((item, index) => {
              const dimmed = hidden.has(item.key);
              const content = (
                <>
                  <span
                    className={ChartS.legendIndicator}
                    style={{ backgroundColor: seriesColor(item, index) }}
                  />
                  {item.label ?? item.key}
                </>
              );
              return toggle ? (
                <button
                  key={item.key}
                  type="button"
                  className={cn(
                    ChartS.legendItem,
                    S.legendButton,
                    dimmed && S.dimmed,
                  )}
                  aria-pressed={!dimmed}
                  onClick={() => toggle(item.key)}
                >
                  {content}
                </button>
              ) : (
                <span key={item.key} className={ChartS.legendItem}>
                  {content}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

BarChart.displayName = 'BarChart';

export { BarChart };
