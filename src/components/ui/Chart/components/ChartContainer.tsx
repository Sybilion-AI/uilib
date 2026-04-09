'use client';

import cn from 'classnames';
import { ComponentProps, useId } from 'react';

import { ChartContext } from '@/components/ui/Chart/Chart.context';
import { ChartConfig, THEMES } from '@/components/ui/Chart/Chart.types';
import * as RechartsPrimitive from 'recharts';

import S from '../Chart.styl';

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ComponentProps<'div'> & {
  config: ChartConfig;
  children: ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
}) {
  const uniqueId = useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(S.chartContainer, className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartStyle = ({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) return null;

  return (
    <style>
      {Object.entries(THEMES).map(
        ([theme, prefix]) => `
          ${prefix} [data-chart=${id}] {
            ${colorConfig
              .map(([key, itemConfig]) => {
                const color =
                  itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
                  itemConfig.color;
                return color ? `  --color-${key}: ${color};` : null;
              })
              .join('\n')}
          }
        `,
      )}
    </style>
  );
};
