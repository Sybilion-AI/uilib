'use client';

import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/Chart/Chart';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import { TrendAnnotations } from './components/TrendAnnotations';
import { TrendAreas } from './components/TrendAreas';
import {
  ANIMATION_BEGIN,
  ANIMATION_DURATION,
  CHART_MARGINS,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_FOCUS_YEARS,
  TREND_COLORS,
} from './ChartTrend.constants';
import {
  calculateTrendBoundaries,
  calculateYAxisRange,
  filterHistoricalByYears,
  formatDate,
  formatNumber,
  generateAnnotations,
  transformToChartData,
} from './ChartTrend.helpers';
import S from './ChartTrend.styl';
import type { ChartTrendProps } from './ChartTrend.types';

const chartConfig = {
  historical: {
    label: 'Historical',
  },
  historical_avg: {
    label: 'Historical Average',
  },
} satisfies ChartConfig;

export function ChartTrend({
  historicalData,
  meanCPD,
  slopeCPD,
  trendType = 'mean',
  showAnnotations = true,
  restricted = false,
  loading = false,
  isDarkTheme = false,
  height = DEFAULT_CHART_HEIGHT,
  focusYears = DEFAULT_FOCUS_YEARS,
  className,
  ...props
}: ChartTrendProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Filter historical data to focus period
  const filteredHistorical = useMemo(
    () => filterHistoricalByYears(historicalData, focusYears),
    [historicalData, focusYears],
  );

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!meanCPD) return [];
    return transformToChartData(filteredHistorical, meanCPD, restricted);
  }, [filteredHistorical, meanCPD, restricted]);

  // Calculate boundaries
  const boundaries = useMemo(() => {
    if (!meanCPD) return null;
    return calculateTrendBoundaries(meanCPD, filteredHistorical, restricted);
  }, [meanCPD, filteredHistorical, restricted]);

  // Generate annotations
  const annotations = useMemo(() => {
    if (!meanCPD || !boundaries || !showAnnotations) return [];
    return generateAnnotations(meanCPD, boundaries);
  }, [meanCPD, boundaries, showAnnotations]);

  // Calculate Y-axis range
  const [yMin, yMax] = useMemo(
    () => calculateYAxisRange(filteredHistorical, boundaries, restricted),
    [filteredHistorical, boundaries, restricted],
  );

  // Trigger animation on data change
  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [chartData]);

  // Get colors based on theme
  const historicalColor = isDarkTheme
    ? TREND_COLORS.historical.dark
    : TREND_COLORS.historical.light;

  const avgColor = isDarkTheme
    ? TREND_COLORS.historicalAverage.dark
    : TREND_COLORS.historicalAverage.light;

  if (!chartData.length || !meanCPD) {
    return (
      <div className={cn(S.root, className)} {...props}>
        <div className={S.errorContainer}>
          {loading ? 'Loading...' : 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(S.root, className)} {...props}>
      {loading && (
        <div className={S.loadingOverlay}>
          <div className={S.loadingSpinner} />
        </div>
      )}

      <ChartContainer
        config={chartConfig}
        className={cn(S.chartContainer, { [S.loading]: loading })}
        style={{ height: `${height}px` }}
      >
        <ComposedChart data={chartData} margin={CHART_MARGINS}>
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 6"
            stroke={isDarkTheme ? '#374151' : '#e5e7eb'}
            strokeWidth={0.6}
          />

          {/* Axes */}
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fill: isDarkTheme ? '#9ca3af' : '#6b7280' }}
            tickFormatter={value => formatDate(value as string)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fill: isDarkTheme ? '#9ca3af' : '#6b7280' }}
            tickFormatter={formatNumber}
            domain={[yMin, yMax]}
          />

          {/* Tooltip */}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={v => formatDate(v as string, true)}
                indicator="dot"
              />
            }
          />

          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            align="left"
            wrapperStyle={{ paddingTop: '24px', paddingLeft: '42px' }}
            onClick={entry => {
              const seriesName = entry.dataKey as string;
              setHiddenSeries(prev => {
                const newSet = new Set(prev);
                if (newSet.has(seriesName)) {
                  newSet.delete(seriesName);
                } else {
                  newSet.add(seriesName);
                }
                return newSet;
              });
            }}
          />

          {/* Trend Areas (risk zones) */}
          {boundaries && (
            <TrendAreas
              boundaries={boundaries}
              meanCPD={meanCPD}
              chartData={chartData}
              isDarkTheme={isDarkTheme}
              restricted={restricted}
            />
          )}

          {/* Boundary Lines */}
          {boundaries && (
            <>
              <ReferenceLine
                y={boundaries.upper[0]}
                stroke={boundaries.color}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'Upper Boundary',
                  position: 'insideTopRight',
                  fill: isDarkTheme ? '#9ca3af' : '#6b7280',
                }}
              />
              <ReferenceLine
                y={boundaries.lower[0]}
                stroke={boundaries.color}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'Lower Boundary',
                  position: 'insideBottomRight',
                  fill: isDarkTheme ? '#9ca3af' : '#6b7280',
                }}
              />
            </>
          )}

          {/* Historical Average Line */}
          <Line
            type="monotone"
            dataKey="historical_avg"
            stroke={avgColor}
            strokeWidth={2}
            dot={false}
            name="Historical Average"
            hide={hiddenSeries.has('historical_avg')}
            isAnimationActive={shouldAnimate}
            animationDuration={ANIMATION_DURATION}
            animationBegin={ANIMATION_BEGIN}
            animationEasing="ease-out"
            connectNulls
          />

          {/* Historical Line */}
          <Line
            type="monotone"
            dataKey="historical"
            stroke={historicalColor}
            strokeWidth={1.5}
            strokeOpacity={0.6}
            dot={false}
            name="Historical"
            hide={hiddenSeries.has('historical')}
            isAnimationActive={shouldAnimate}
            animationDuration={ANIMATION_DURATION}
            animationBegin={ANIMATION_BEGIN}
            animationEasing="ease-out"
            connectNulls
          />

          {/* Annotations */}
          {showAnnotations && annotations.length > 0 && (
            <TrendAnnotations annotations={annotations} />
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
