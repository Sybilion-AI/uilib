import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useMemo, useEffect } from 'react';
import { ChartTooltip } from '../Chart/Chart.js';
import { ComposedChart, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine, Line } from 'recharts';
import { CHART_MARGINS, ANIMATION_DURATION, ANIMATION_BEGIN, DEFAULT_CHART_HEIGHT, DEFAULT_FOCUS_YEARS, TREND_COLORS } from './ChartTrend.constants.js';
import { filterHistoricalByYears, transformToChartData, calculateTrendBoundaries, generateAnnotations, calculateYAxisRange, formatDate, formatNumber } from './ChartTrend.helpers.js';
import S from './ChartTrend.styl.js';
import { TrendAnnotations } from './components/TrendAnnotations.js';
import { TrendAreas } from './components/TrendAreas.js';
import { ChartContainer } from '../Chart/components/ChartContainer.js';
import { ChartTooltipContent } from '../Chart/components/ChartTooltipContent.js';

const chartConfig = {
    historical: {
        label: 'Historical',
    },
    historical_avg: {
        label: 'Historical Average',
    },
};
function ChartTrend({ historicalData, meanCPD, slopeCPD, trendType = 'mean', showAnnotations = true, restricted = false, loading = false, isDarkTheme = false, height = DEFAULT_CHART_HEIGHT, focusYears = DEFAULT_FOCUS_YEARS, className, ...props }) {
    const [hiddenSeries, setHiddenSeries] = useState(new Set());
    const [shouldAnimate, setShouldAnimate] = useState(false);
    // Filter historical data to focus period
    const filteredHistorical = useMemo(() => filterHistoricalByYears(historicalData, focusYears), [historicalData, focusYears]);
    // Transform data for Recharts
    const chartData = useMemo(() => {
        if (!meanCPD)
            return [];
        return transformToChartData(filteredHistorical, meanCPD, restricted);
    }, [filteredHistorical, meanCPD, restricted]);
    // Calculate boundaries
    const boundaries = useMemo(() => {
        if (!meanCPD)
            return null;
        return calculateTrendBoundaries(meanCPD, filteredHistorical, restricted);
    }, [meanCPD, filteredHistorical, restricted]);
    // Generate annotations
    const annotations = useMemo(() => {
        if (!meanCPD || !boundaries || !showAnnotations)
            return [];
        return generateAnnotations(meanCPD, boundaries);
    }, [meanCPD, boundaries, showAnnotations]);
    // Calculate Y-axis range
    const [yMin, yMax] = useMemo(() => calculateYAxisRange(filteredHistorical, boundaries, restricted), [filteredHistorical, boundaries, restricted]);
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
        return (jsx("div", { className: cn(S.root, className), ...props, children: jsx("div", { className: S.errorContainer, children: loading ? 'Loading...' : 'No data available' }) }));
    }
    return (jsxs("div", { className: cn(S.root, className), ...props, children: [loading && (jsx("div", { className: S.loadingOverlay, children: jsx("div", { className: S.loadingSpinner }) })), jsx(ChartContainer, { config: chartConfig, className: cn(S.chartContainer, { [S.loading]: loading }), style: { height: `${height}px` }, children: jsxs(ComposedChart, { data: chartData, margin: CHART_MARGINS, children: [jsx(CartesianGrid, { strokeDasharray: "3 6", stroke: isDarkTheme ? '#374151' : '#e5e7eb', strokeWidth: 0.6 }), jsx(XAxis, { dataKey: "date", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 32, tick: { fill: isDarkTheme ? '#9ca3af' : '#6b7280' }, tickFormatter: value => formatDate(value) }), jsx(YAxis, { tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 32, tick: { fill: isDarkTheme ? '#9ca3af' : '#6b7280' }, tickFormatter: formatNumber, domain: [yMin, yMax] }), jsx(ChartTooltip, { cursor: false, content: jsx(ChartTooltipContent, { labelFormatter: v => formatDate(v, true), indicator: "dot" }) }), jsx(Legend, { verticalAlign: "bottom", align: "left", wrapperStyle: { paddingTop: '24px', paddingLeft: '42px' }, onClick: entry => {
                                const seriesName = entry.dataKey;
                                setHiddenSeries(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(seriesName)) {
                                        newSet.delete(seriesName);
                                    }
                                    else {
                                        newSet.add(seriesName);
                                    }
                                    return newSet;
                                });
                            } }), boundaries && (jsx(TrendAreas, { boundaries: boundaries, meanCPD: meanCPD, chartData: chartData, isDarkTheme: isDarkTheme, restricted: restricted })), boundaries && (jsxs(Fragment, { children: [jsx(ReferenceLine, { y: boundaries.upper[0], stroke: boundaries.color, strokeDasharray: "5 5", strokeWidth: 2, label: {
                                        value: 'Upper Boundary',
                                        position: 'insideTopRight',
                                        fill: isDarkTheme ? '#9ca3af' : '#6b7280',
                                    } }), jsx(ReferenceLine, { y: boundaries.lower[0], stroke: boundaries.color, strokeDasharray: "5 5", strokeWidth: 2, label: {
                                        value: 'Lower Boundary',
                                        position: 'insideBottomRight',
                                        fill: isDarkTheme ? '#9ca3af' : '#6b7280',
                                    } })] })), jsx(Line, { type: "monotone", dataKey: "historical_avg", stroke: avgColor, strokeWidth: 2, dot: false, name: "Historical Average", hide: hiddenSeries.has('historical_avg'), isAnimationActive: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN, animationEasing: "ease-out", connectNulls: true }), jsx(Line, { type: "monotone", dataKey: "historical", stroke: historicalColor, strokeWidth: 1.5, strokeOpacity: 0.6, dot: false, name: "Historical", hide: hiddenSeries.has('historical'), isAnimationActive: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN, animationEasing: "ease-out", connectNulls: true }), showAnnotations && annotations.length > 0 && (jsx(TrendAnnotations, { annotations: annotations }))] }) })] }));
}

export { ChartTrend };
