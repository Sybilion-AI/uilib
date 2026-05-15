'use client';

import cn from 'classnames';
import { useMemo } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartEmptyState,
} from '../../ui/Chart/Chart';
import type { DriverData } from '../DriverMap/driverMapGeography';
import S from './DriverPerformanceChart.styl';
import { generateDriverChartData } from './driverPerformanceChartData';

const driverChartConfig = {
  value: {
    label: 'Performance',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export interface DriverPerformanceChartProps {
  driver: DriverData;
}

export function DriverPerformanceChart({
  driver,
}: DriverPerformanceChartProps) {
  const precision = useMemo(() => {
    if (!driver.normalized_series) return 7;

    const values = Object.values(driver.normalized_series).filter(
      (v): v is number => typeof v === 'number' && v !== null,
    );

    if (values.length === 0) return 7;

    const absoluteValues = values.map(Math.abs).filter(v => v > 0);
    if (absoluteValues.length === 0) return 7;

    const minAbs = Math.min(...absoluteValues);

    if (minAbs < 0.0001) return 7;
    if (minAbs < 0.001) return 6;
    if (minAbs < 0.01) return 5;
    if (minAbs < 0.1) return 4;
    if (minAbs < 1) return 3;
    return 2;
  }, [driver.normalized_series]);

  const chartData = useMemo(
    () => generateDriverChartData(driver, precision),
    [driver, precision],
  );

  const noSeriesData = useMemo(() => {
    if (!driver.normalized_series) return false;
    return Object.values(driver.normalized_series).every(
      value => value === null,
    );
  }, [driver.normalized_series]);

  const renderTooltipContent = ({
    active,
    payload,
  }: TooltipContentProps<number, string>) => {
    if (active && payload?.length) {
      const dataPoint = payload[0];
      const row = dataPoint?.payload as
        | { date?: Date; value?: number }
        | undefined;
      const date = row?.date;
      const value = dataPoint?.value;

      return (
        <div className={S.chartTooltip}>
          <div className={S.tooltipDate}>
            {date instanceof Date
              ? date.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : 'Unknown Date'}
          </div>
          <div className={S.tooltipPerformance}>
            Performance:{' '}
            {typeof value === 'number'
              ? value.toFixed(precision)
              : String(value ?? '')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={S.driverChartContainer}>
      <ChartContainer
        config={driverChartConfig}
        className={cn(
          S.chartContainer,
          noSeriesData && S.chartContainerDisabled,
        )}
      >
        <LineChart
          data={chartData}
          margin={{ left: 8, right: 8, top: 8, bottom: -20 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={false}
            tickMargin={0}
            minTickGap={0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={false}
            tickMargin={0}
            minTickGap={0}
            width={0}
            domain={['dataMin', 'dataMax']}
          />
          <RechartsTooltip cursor={false} content={renderTooltipContent} />
          <Line dataKey="value" type="natural" stroke="var(--color-value)" />
        </LineChart>
      </ChartContainer>
      {noSeriesData && (
        <ChartEmptyState
          variant="inline"
          align="center"
          status="No series data"
          className={S.noDataMessage}
        />
      )}
    </div>
  );
}
