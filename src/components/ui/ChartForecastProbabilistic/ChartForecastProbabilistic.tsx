import cn from 'classnames';
import { useMemo } from 'react';

import { ChartConfig } from '#uilib/components/ui/Chart/Chart';

import {
  BaseChartWrapper,
  ForecastLine,
  HistoricalLine,
  formatNumber,
  useChartAnimation,
  useChartColors,
  useLegendState,
} from '../Chart/components';
import { QuantileBands } from '../Chart/components/QuantileBands';
import {
  ANIMATION_BEGIN,
  ANIMATION_DURATION,
  CHART_MARGINS,
  COLORS,
  DEFAULT_CHART_HEIGHT,
} from './ChartForecastProbabilistic.constants';
import {
  calculateXAxisRange,
  transformToChartData,
} from './ChartForecastProbabilistic.helpers';
import S from './ChartForecastProbabilistic.styl';
import type { ChartForecastProbabilisticProps } from './ChartForecastProbabilistic.types';

const chartConfig = {
  historical: {
    label: 'Historical',
  },
  forecast: {
    label: 'Forecast (Median)',
  },
} satisfies ChartConfig;

export function ChartForecastProbabilistic({
  historicalData,
  forecastData,
  showQuantiles = true,
  quantileBands,
  loading = false,
  isDarkTheme = false,
  focused = false,
  height = DEFAULT_CHART_HEIGHT,
  className,
  ...props
}: ChartForecastProbabilisticProps) {
  const { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries } =
    useLegendState();

  // Transform data for Recharts
  const chartData = useMemo(
    () => transformToChartData(historicalData, forecastData),
    [historicalData, forecastData],
  );

  // Calculate axis range
  const [xMin, xMax] = useMemo(
    () => calculateXAxisRange(chartData, focused),
    [chartData, focused],
  );

  // Animation state
  const shouldAnimate = useChartAnimation(chartData);

  // Get colors based on theme
  const colors = useChartColors(
    {
      historical: COLORS.historical,
      forecast: COLORS.forecast,
    },
    isDarkTheme,
  );

  const bandColor = isDarkTheme
    ? COLORS.quantileBands.dark
    : COLORS.quantileBands.light;

  return (
    <BaseChartWrapper
      chartData={chartData}
      chartConfig={chartConfig}
      loading={loading}
      isDarkTheme={isDarkTheme}
      height={height}
      className={cn(className, S.root)}
      xMin={xMin}
      xMax={xMax}
      formatNumber={formatNumber}
      onLegendClick={entry => toggleSeries(entry.dataKey as string)}
      hiddenSeries={hiddenSeries}
      onShowAll={clearHiddenSeries}
      onShowOnly={(dataKey, allDataKeys) =>
        showOnlySeries(dataKey, allDataKeys)
      }
      margin={CHART_MARGINS}
      quantileBands={quantileBands}
      {...props}
    >
      {/* Historical Line */}
      <HistoricalLine
        color={colors.historical}
        isDarkTheme={isDarkTheme}
        hidden={hiddenSeries.has('historical')}
        animate={shouldAnimate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
      />

      {/* Forecast Line (Median - q50) */}
      <ForecastLine
        color={colors.forecast}
        isDarkTheme={isDarkTheme}
        hidden={hiddenSeries.has('forecast')}
        animate={shouldAnimate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
        name="Forecast (Median)"
      />
    </BaseChartWrapper>
  );
}
