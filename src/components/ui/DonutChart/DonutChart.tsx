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
import { Cell, Label, Pie, PieChart } from 'recharts';
import type { ViewBox } from 'recharts/types/util/types';

import S from './DonutChart.styl';
import { DonutChartDatum, DonutChartProps } from './DonutChart.types';

function buildChartConfig(data: DonutChartDatum[]): ChartConfig {
  const config: ChartConfig = {};

  data.forEach((datum, index) => {
    config[datum.key] = {
      label: datum.label ?? datum.key,
      color: datum.color ?? getChartSeriesColor(index),
    };
  });

  return config;
}

const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      className,
      data,
      innerRadius = '62%',
      outerRadius = '85%',
      centerValue,
      centerCaption,
      showLegend = true,
      showTooltip = true,
      height,
      ...props
    },
    ref,
  ) => {
    const config = useMemo(() => buildChartConfig(data), [data]);

    const renderCenterLabel = ({ viewBox }: { viewBox?: ViewBox }) => {
      if (centerValue === undefined || !viewBox || !('cx' in viewBox)) {
        return null;
      }

      const { cx, cy } = viewBox;

      return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
          <tspan x={cx} y={cy} className={S.centerValue}>
            {centerValue}
          </tspan>
          {centerCaption && (
            <tspan x={cx} y={cy + 22} className={S.centerCaption}>
              {centerCaption}
            </tspan>
          )}
        </text>
      );
    };

    return (
      <div ref={ref} className={cn(S.root, className)} {...props}>
        <ChartContainer
          config={config}
          className={S.chart}
          style={height ? { height: `${height}px` } : undefined}
        >
          <PieChart accessibilityLayer>
            {showTooltip && (
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="key" hideLabel />}
              />
            )}
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={1}
            >
              {data.map(datum => (
                <Cell key={datum.key} fill={`var(--color-${datum.key})`} />
              ))}
              {centerValue !== undefined && (
                <Label content={renderCenterLabel} />
              )}
            </Pie>
            {showLegend && (
              <ChartLegend content={<ChartLegendContent nameKey="key" />} />
            )}
          </PieChart>
        </ChartContainer>
      </div>
    );
  },
);

DonutChart.displayName = 'DonutChart';

export { DonutChart };
