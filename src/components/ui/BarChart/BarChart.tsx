import cn from 'classnames';
import { forwardRef, useMemo } from 'react';

import type { ChartConfig } from '#uilib/components/ui/Chart';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '#uilib/components/ui/Chart';
import { getChartSeriesColor } from '#uilib/components/ui/Chart/chartSeriesPalette';
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from 'recharts';

import S from './BarChart.styl';
import { BarChartProps, BarChartSeries } from './BarChart.types';

const STACK_ID = 'stack';

function buildChartConfig(series: BarChartSeries[]): ChartConfig {
  const config: ChartConfig = {};

  series.forEach((item, index) => {
    config[item.key] = {
      label: item.label ?? item.key,
      color: item.color ?? getChartSeriesColor(index),
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
      height,
      ...props
    },
    ref,
  ) => {
    const config = useMemo(() => buildChartConfig(series), [series]);

    const isHorizontal = orientation === 'horizontal';
    const stackId = mode === 'stacked' ? STACK_ID : undefined;
    const barRadius: [number, number, number, number] | number =
      mode === 'stacked' ? 0 : isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0];

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
                  axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                  tickFormatter={valueFormatter}
                />
                <YAxis
                  type="category"
                  dataKey={categoryKey}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                  width={80}
                />
              </>
            ) : (
              <>
                <XAxis
                  type="category"
                  dataKey={categoryKey}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                <YAxis
                  type="number"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                  width={48}
                  tickFormatter={valueFormatter}
                />
              </>
            )}
            {showTooltip && (
              <ChartTooltip
                cursor={{ fill: 'var(--muted)' }}
                content={<ChartTooltipContent indicator="dot" />}
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
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </RechartsBarChart>
        </ChartContainer>
      </div>
    );
  },
);

BarChart.displayName = 'BarChart';

export { BarChart };
