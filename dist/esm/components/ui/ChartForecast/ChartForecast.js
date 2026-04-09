import { jsxs, jsx } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { BaseChartWrapper } from '../Chart/components/BaseChartWrapper.js';
import 'recharts';
import { formatNumber } from '../Chart/tools/formatters.js';
import 'classnames';
import '../Chart/Chart.context.js';
import '../Chart/Chart.styl.js';
import { ForecastLine } from '../Chart/components/ForecastLine.js';
import { HistoricalLine } from '../Chart/components/HistoricalLine.js';
import { useChartAnimation } from '../Chart/hooks/useChartAnimation.js';
import { useChartColors } from '../Chart/hooks/useChartColors.js';
import { useLegendState } from '../Chart/hooks/useLegendState.js';
import { ConfidenceBands } from '../Chart/components/ConfidenceBands.js';
import { ForecastBoundaries } from '../Chart/components/ForecastBoundaries.js';
import { CHART_MARGINS, ANIMATION_DURATION, ANIMATION_BEGIN, DEFAULT_CHART_HEIGHT, FORECAST_COLORS } from './ChartForecast.constants.js';
import { transformToChartData } from './ChartForecast.helpers.js';

const chartConfig = {
    historical: {
        label: 'Historical',
    },
    forecast: {
        label: 'Forecast',
    },
};
function ChartForecast({ historicalData, forecastData, changePoints, mode = 'deterministic', showConfidenceBands = true, showBoundaries = false, loading = false, isDarkTheme = false, focused = false, height = DEFAULT_CHART_HEIGHT, className, ...props }) {
    const { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries } = useLegendState();
    // Transform data for Recharts
    const chartData = useMemo(() => transformToChartData(historicalData, forecastData, '24m'), [historicalData, forecastData]);
    // Calculate axis range
    // const [xMin, xMax] = useMemo(
    //   () => calculateXAxisRange(chartData, focused),
    //   [chartData, focused],
    // );
    // Animation state
    const shouldAnimate = useChartAnimation(chartData);
    // Get colors based on theme
    const colors = useChartColors(FORECAST_COLORS, isDarkTheme);
    return (jsxs(BaseChartWrapper, { chartData: chartData, chartConfig: chartConfig, loading: loading, isDarkTheme: isDarkTheme, height: height, className: className, 
        // xMin={xMin}
        // xMax={xMax}
        formatNumber: formatNumber, onLegendClick: entry => toggleSeries(entry.dataKey), hiddenSeries: hiddenSeries, 
        // onShowAll={clearHiddenSeries}
        // onShowOnly={(dataKey, allDataKeys) =>
        //   showOnlySeries(dataKey, allDataKeys)
        // }
        margin: CHART_MARGINS, ...props, children: [showConfidenceBands && mode === 'deterministic' && (jsx(ConfidenceBands, { color: colors.confidence, hidden: hiddenSeries.has('confidence'), animate: shouldAnimate })), showBoundaries && changePoints && (jsx(ForecastBoundaries, { changePoints: changePoints, chartData: chartData, isDarkTheme: isDarkTheme })), jsx(ForecastLine, { color: colors.forecast, isDarkTheme: isDarkTheme, hidden: hiddenSeries.has('forecast'), animate: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN }), jsx(HistoricalLine, { color: colors.historical, isDarkTheme: isDarkTheme, hidden: hiddenSeries.has('historical'), animate: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN })] }));
}

export { ChartForecast };
