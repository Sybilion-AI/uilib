import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChartEmptyState } from '../../ui/Chart/components/ChartEmptyState/ChartEmptyState.js';
import { ChartAreaInteractive } from '../../ui/ChartAreaInteractive/ChartAreaInteractive.js';
import { getForecastColor } from '../../ui/ChartAreaInteractive/ChartLines.js';
import '../../ui/Page/AppShell/AppShell.js';
import 'react-router-dom';
import '../../ui/Sidebar/Sidebar.js';
import 'lucide-react';
import '../../ui/Page/Breadcrumbs/Breadcrumbs.styl.js';
import '../../ui/Page/pageContext.js';
import '@radix-ui/react-tooltip';
import '../../ui/Tooltip/Tooltip.styl.js';
import '../../ui/Page/PageHeader/PageHeader.styl.js';
import '../../ui/Page/PageEmptyCanvas/PageEmptyCanvas.styl.js';
import '../../ui/Page/PageContent/PageContent.styl.js';
import '@homecode/ui';
import '../../ui/Page/PageScroll/PageScroll.styl.js';
import { PageXScroll } from '../../ui/Page/PageXScroll/PageXScroll.js';
import '../../ui/Page/PageFooter/PageFooter.styl.js';
import '@radix-ui/react-tabs';
import '../../ui/Tabs/Tabs.styl.js';
import '../../ui/Page/PageTabs/PageTabs.styl.js';
import '../../ui/Page/PageColumns/PageColumns.styl.js';
import '../../ui/Page/SectionHeader/SectionHeader.styl.js';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../ui/Table/Table.js';
import { TextShimmer } from '../../ui/TextShimmer/TextShimmer.js';
import { TIME_RANGES } from '../../ui/TimeRangeControls/TimeRangeControls.constants.js';
import S from './DriversComparisonChart.styl.js';
import { mergeBacktestsChartData, mergeDatasetHistoricalWithBacktestsChartData, DRIVER_FORECAST_ID_BASE, INITIAL_VISIBLE_SERIES_COUNT, buildDriversComparisonChartData, formatSeriesImportance } from './driversComparisonChart.helpers.js';

const ALL_TIME_RANGE = TIME_RANGES[TIME_RANGES.length - 1];
function toForecastDataKey(id) {
    const s = String(id);
    return s.startsWith('forecast_') ? s : `forecast_${id}`;
}
function DriversComparisonChart({ payload, datasetHistorical = [], loading = false, chartLoading = false, statusHint = null, statusTone = 'muted', runAnalysisHint = false, timeRange: timeRangeProp, onTimeRangeChange, isDarkTheme = false, className, seriesInitKey, }) {
    const [internalTimeRange, setInternalTimeRange] = useState(ALL_TIME_RANGE);
    const [hiddenSeries, setHiddenSeries] = useState(new Set());
    const timeRange = timeRangeProp ?? internalTimeRange;
    const handleTimeRangeChange = useCallback((val) => {
        if (!val)
            return;
        onTimeRangeChange?.(val);
        if (timeRangeProp === undefined) {
            setInternalTimeRange(val);
        }
    }, [onTimeRangeChange, timeRangeProp]);
    const toggleSeries = useCallback((id) => {
        const key = toForecastDataKey(id);
        setHiddenSeries(prev => {
            const next = new Set(prev);
            if (next.has(key))
                next.delete(key);
            else
                next.add(key);
            return next;
        });
    }, []);
    const showSeries = useCallback((id) => {
        const key = toForecastDataKey(id);
        setHiddenSeries(prev => {
            if (!prev.has(key))
                return prev;
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    }, []);
    const sortedDriversWithData = useMemo(() => {
        const driversList = payload?.drivers ?? [];
        if (!driversList.length)
            return [];
        return [...driversList]
            .filter(d => d.normalized_series &&
            Object.keys(d.normalized_series).some(key => d.normalized_series[key] != null))
            .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }, [payload?.drivers]);
    const mergedChartData = useMemo(() => mergeBacktestsChartData(payload), [payload]);
    const mergedWithHistorical = useMemo(() => mergeDatasetHistoricalWithBacktestsChartData(datasetHistorical, mergedChartData), [datasetHistorical, mergedChartData]);
    const chartForecastData = useMemo(() => {
        if (!payload?.target?.normalized_series)
            return [];
        return sortedDriversWithData.map((driver, idx) => ({
            id: DRIVER_FORECAST_ID_BASE + idx,
            name: driver.name || String(driver.id),
            color: getForecastColor(idx + 1),
        }));
    }, [payload?.target?.normalized_series, sortedDriversWithData]);
    const tableSeriesRows = useMemo(() => {
        if (sortedDriversWithData.length === 0)
            return [];
        return sortedDriversWithData.map((driver, idx) => {
            const raw = driver.importance;
            const importance = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
            return {
                id: DRIVER_FORECAST_ID_BASE + idx,
                name: driver.name || String(driver.id),
                color: getForecastColor(idx + 1),
                importance,
                lag: driver.lag,
            };
        });
    }, [sortedDriversWithData]);
    const seriesInitKeyResolved = seriesInitKey ?? `${tableSeriesRows.map(r => r.id).join(',') || 'none'}`;
    const backtestsSeriesInitKeyRef = useRef('');
    useEffect(() => {
        if (tableSeriesRows.length === 0)
            return;
        const initKey = seriesInitKeyResolved;
        if (backtestsSeriesInitKeyRef.current === initKey)
            return;
        backtestsSeriesInitKeyRef.current = initKey;
        setHiddenSeries(() => {
            const next = new Set();
            tableSeriesRows.forEach((row, idx) => {
                const key = toForecastDataKey(row.id);
                if (idx >= INITIAL_VISIBLE_SERIES_COUNT) {
                    next.add(key);
                }
            });
            return next;
        });
    }, [seriesInitKeyResolved, tableSeriesRows]);
    const driversComparisonChartData = useMemo(() => buildDriversComparisonChartData(mergedWithHistorical, datasetHistorical, chartForecastData.map(f => f.id)), [chartForecastData, datasetHistorical, mergedWithHistorical]);
    const showEmptyOverlay = (runAnalysisHint || Boolean(statusHint)) && !loading;
    return (jsxs("div", { className: cn(S.root, className), children: [jsxs("div", { className: cn(S.chartShell, loading && S.chartShellLoading), children: [jsx("div", { className: S.chartSlot, children: jsxs("div", { className: S.chartWithOverlay, children: [jsx("div", { className: cn(S.chartInteractiveLayer, showEmptyOverlay && S.chartInteractiveDimmed), children: jsx(ChartAreaInteractive, { disableHistoricalAnimation: true, disableTimeRangeSelector: true, enableTimeRangeBrush: true, chartContainerClassName: S.chartContainer, chartData: driversComparisonChartData, forecastData: chartForecastData, timeRange: timeRange, onTimeRangeChange: handleTimeRangeChange, pinMonth: undefined, onPinMonthChange: () => { }, isDarkTheme: isDarkTheme, loading: chartLoading, hasCombinedData: mergedWithHistorical.length > 0, forecastLineStyle: "solid", showLegend: false, hiddenSeries: hiddenSeries, toggleLegendSeries: toggleSeries, ensureAnalysisSeriesVisible: showSeries }) }), showEmptyOverlay && (jsx("div", { className: S.chartEmptyOverlay, role: "status", "aria-live": "polite", children: jsx("div", { className: S.chartEmptyBlurb, children: jsx(ChartEmptyState, { variant: "inline", hint: runAnalysisHint
                                                ? 'Run a completed analysis to load the drivers comparison chart for an analysis.'
                                                : undefined, status: statusHint ?? undefined, statusTone: statusTone }) }) }))] }) }), loading && (jsx("div", { className: S.loadingLayer, "aria-busy": "true", "aria-live": "polite", children: jsx("div", { className: S.loadingMessage, children: jsx(TextShimmer, { as: "span", className: S.loadingText, children: "Loading drivers comparison\u2026" }) }) }))] }), jsx("div", { className: S.seriesSection, children: tableSeriesRows.length === 0 ? (jsx("div", { className: S.seriesEmptyWrap, children: jsx("div", { className: S.chartEmptyBlurb, children: jsx(ChartEmptyState, { variant: "inline", align: "center", status: "No series" }) }) })) : (jsx("div", { className: S.seriesTableWrapper, children: jsx(PageXScroll, { size: "md", fullWidth: true, innerClassName: S.seriesTableContainer, scrollbarClassName: S.seriesScrollbar, children: jsxs(Table, { withBackground: true, withPaddings: true, className: S.seriesTable, children: [jsx(TableHeader, { children: jsxs(TableRow, { children: [jsx(TableHead, { className: S.seriesColSeries, children: "Driver name" }), jsx(TableHead, { children: "Importance" }), jsx(TableHead, { children: "Lag" })] }) }), jsx(TableBody, { children: tableSeriesRows.map(row => {
                                        const dataKey = toForecastDataKey(row.id);
                                        const hidden = hiddenSeries.has(dataKey);
                                        return (jsxs(TableRow, { className: cn(hidden && S.rowHidden), onClick: () => toggleSeries(row.id), children: [jsx(TableCell, { children: jsxs("span", { className: S.seriesLabel, children: [jsx("span", { className: S.colorSwatch, style: {
                                                                    backgroundColor: row.color,
                                                                } }), row.name ?? String(row.id)] }) }), jsx(TableCell, { children: formatSeriesImportance(row.importance) }), jsx(TableCell, { children: row.lag ?? '—' })] }, row.id));
                                    }) })] }) }) })) })] }));
}

export { DriversComparisonChart };
