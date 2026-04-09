import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo } from 'react';
import { BaseChartWrapper } from '../Chart/components/BaseChartWrapper.js';
import 'recharts';
import { formatNumber } from '../Chart/tools/formatters.js';
import '../Chart/Chart.context.js';
import '../Chart/Chart.styl.js';
import { ForecastLine } from '../Chart/components/ForecastLine.js';
import { HistoricalLine } from '../Chart/components/HistoricalLine.js';
import { useChartAnimation } from '../Chart/hooks/useChartAnimation.js';
import { useChartColors } from '../Chart/hooks/useChartColors.js';
import { useLegendState } from '../Chart/hooks/useLegendState.js';
import { CHART_MARGINS, ANIMATION_DURATION, ANIMATION_BEGIN, DEFAULT_CHART_HEIGHT, COLORS } from './ChartForecastProbabilistic.constants.js';
import { transformToChartData, calculateXAxisRange } from './ChartForecastProbabilistic.helpers.js';
import S from './ChartForecastProbabilistic.styl.js';

const chartConfig = {
    historical: {
        label: 'Historical',
    },
    forecast: {
        label: 'Forecast (Median)',
    },
};
function ChartForecastProbabilistic({ historicalData, forecastData, showQuantiles = true, quantileBands, loading = false, isDarkTheme = false, focused = false, height = DEFAULT_CHART_HEIGHT, className, ...props }) {
    const { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries } = useLegendState();
    // Transform data for Recharts
    const chartData = useMemo(() => transformToChartData(historicalData, forecastData), [historicalData, forecastData]);
    // Calculate axis range
    const [xMin, xMax] = useMemo(() => calculateXAxisRange(chartData, focused), [chartData, focused]);
    // Animation state
    const shouldAnimate = useChartAnimation(chartData);
    // Get colors based on theme
    const colors = useChartColors({
        historical: COLORS.historical,
        forecast: COLORS.forecast,
    }, isDarkTheme);
    return (jsxs(BaseChartWrapper, { chartData: chartData, chartConfig: chartConfig, loading: loading, isDarkTheme: isDarkTheme, height: height, className: cn(className, S.root), xMin: xMin, xMax: xMax, formatNumber: formatNumber, onLegendClick: entry => toggleSeries(entry.dataKey), hiddenSeries: hiddenSeries, onShowAll: clearHiddenSeries, onShowOnly: (dataKey, allDataKeys) => showOnlySeries(dataKey, allDataKeys), margin: CHART_MARGINS, quantileBands: quantileBands, ...props, children: [jsx(HistoricalLine, { color: colors.historical, isDarkTheme: isDarkTheme, hidden: hiddenSeries.has('historical'), animate: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN }), jsx(ForecastLine, { color: colors.forecast, isDarkTheme: isDarkTheme, hidden: hiddenSeries.has('forecast'), animate: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN, name: "Forecast (Median)" })] }));
}

export { ChartForecastProbabilistic };
