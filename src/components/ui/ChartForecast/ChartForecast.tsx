import { useMemo } from 'react';

import { ChartConfig } from '#uilib/components/ui/Chart';

import {
  BaseChartWrapper,
  ForecastLine,
  HistoricalLine,
  formatNumber,
  useChartAnimation,
  useChartColors,
  useLegendState,
} from '../Chart/components';
import { ConfidenceBands } from '../Chart/components/ConfidenceBands';
import { ForecastBoundaries } from '../Chart/components/ForecastBoundaries';
import {
  ANIMATION_BEGIN,
  ANIMATION_DURATION,
  CHART_MARGINS,
  DEFAULT_CHART_HEIGHT,
  FORECAST_COLORS,
} from './ChartForecast.constants';
import {
  calculateXAxisRange,
  transformToChartData,
} from './ChartForecast.helpers';
import type { ChartForecastProps } from './ChartForecast.types';

const chartConfig = {
  historical: {
    label: 'Historical',
  },
  forecast: {
    label: 'Forecast',
  },
} satisfies ChartConfig;

export function ChartForecast({
  historicalData,
  forecastData,
  changePoints,
  mode = 'deterministic',
  showConfidenceBands = true,
  showBoundaries = false,
  loading = false,
  isDarkTheme = false,
  focused = false,
  height = DEFAULT_CHART_HEIGHT,
  className,
  ...props
}: ChartForecastProps) {
  const { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries } =
    useLegendState();

  // Transform data for Recharts
  const chartData = useMemo(
    () => transformToChartData(historicalData, forecastData, '24m'),
    [historicalData, forecastData],
  );

  // Calculate axis range
  // const [xMin, xMax] = useMemo(
  //   () => calculateXAxisRange(chartData, focused),
  //   [chartData, focused],
  // );

  // Animation state
  const shouldAnimate = useChartAnimation(chartData);

  // Get colors based on theme
  const colors = useChartColors(FORECAST_COLORS, isDarkTheme);

  return (
    <BaseChartWrapper
      chartData={chartData}
      chartConfig={chartConfig}
      loading={loading}
      isDarkTheme={isDarkTheme}
      height={height}
      className={className}
      // xMin={xMin}
      // xMax={xMax}
      formatNumber={formatNumber}
      onLegendClick={entry => toggleSeries(entry.dataKey as string)}
      hiddenSeries={hiddenSeries}
      // onShowAll={clearHiddenSeries}
      // onShowOnly={(dataKey, allDataKeys) =>
      //   showOnlySeries(dataKey, allDataKeys)
      // }
      margin={CHART_MARGINS}
      {...props}
    >
      {/* Confidence Bands */}
      {showConfidenceBands && mode === 'deterministic' && (
        <ConfidenceBands
          color={colors.confidence!}
          hidden={hiddenSeries.has('confidence')}
          animate={shouldAnimate}
        />
      )}

      {/* Forecast Boundaries (Guard Rails) */}
      {showBoundaries && changePoints && (
        <ForecastBoundaries
          changePoints={changePoints}
          chartData={chartData}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Forecast Line */}
      <ForecastLine
        color={colors.forecast}
        isDarkTheme={isDarkTheme}
        hidden={hiddenSeries.has('forecast')}
        animate={shouldAnimate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
      />

      {/* Historical Line */}
      <HistoricalLine
        color={colors.historical}
        isDarkTheme={isDarkTheme}
        hidden={hiddenSeries.has('historical')}
        animate={shouldAnimate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
      />
    </BaseChartWrapper>
  );
}
