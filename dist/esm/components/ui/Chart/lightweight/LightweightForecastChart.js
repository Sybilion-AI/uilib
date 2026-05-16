import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useId, useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { ChartContext } from '../Chart.context.js';
import { ChartStyle } from '../components/ChartContainer.js';
import { ChartTooltipContent } from '../components/ChartTooltipContent.js';
import { CustomChartLegend } from '../components/CustomChartLegend/CustomChartLegend.js';
import { formatDate } from '../tools/formatters.js';
import { getForecastColor, getForecastQuantileBandColor } from '../../ChartAreaInteractive/ChartLines.js';
import { Skeleton } from '../../Skeleton/Skeleton.js';
import { ensureChartForecastBridge } from '../../../../utils/chartConnectionPoint.js';
import { createChart, LineSeries, LineType, LineStyle } from 'lightweight-charts';
import S from './LightweightForecastChart.styl.js';
import { buildLightweightChartOptions, buildHistoricalLineData, buildForecastLineData, buildQuantileBandCustomData, findNearestChartRow } from './lightweightForecastChart.helpers.js';
import { QuantileBandPaneView } from './quantileBandCustomSeries.js';

function clampTooltipTranslate(args) {
    const { coordinate, viewW, viewH, tooltipWidth: tw, tooltipHeight: th, offset, edgeMargin, } = args;
    const minX = edgeMargin;
    const maxX = Math.max(edgeMargin, viewW - tw - edgeMargin);
    const minY = edgeMargin;
    const maxY = Math.max(edgeMargin, viewH - th - edgeMargin);
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
    let tx = coordinate.x + offset;
    if (tx + tw > viewW - edgeMargin) {
        tx = coordinate.x - tw - offset;
    }
    tx = clamp(tx, minX, maxX);
    let ty = coordinate.y + offset;
    if (ty + th > viewH - edgeMargin) {
        ty = coordinate.y - th - offset;
    }
    ty = clamp(ty, minY, maxY);
    return { x: tx, y: ty };
}
function scheduleFitTimeScale(chart) {
    requestAnimationFrame(() => {
        chart.timeScale().fitContent();
    });
}
function LightweightForecastChart(props) {
    const { chartData, forecastData = [], quantileBands, chartConfig: chartConfigProp = {}, historicalLineColor: historicalLineColorProp, isDarkTheme, height, className, hiddenSeries: hiddenSeriesProp, onLegendClick, disableForecastHistoricalBridge = false, forecastLineStyle = 'dashed', formatDate: formatDateFn = formatDate, formatNumber, loading = false, error = null, noDataMessage = 'No data available', showLegend = true, showTooltip = true, } = props;
    const chartId = useId().replace(/:/g, '');
    const shellRef = useRef(null);
    const hostRef = useRef(null);
    const modelRef = useRef(null);
    const bridgedRef = useRef([]);
    const tooltipRef = useRef(null);
    const tooltipSizeRef = useRef({ width: 0, height: 0 });
    const [localHidden, setLocalHidden] = useState(() => new Set());
    const hiddenSeries = hiddenSeriesProp ?? localHidden;
    const hiddenControlled = hiddenSeriesProp !== undefined;
    const pixelHeight = height ?? 280;
    const historicalLineColor = historicalLineColorProp ?? (isDarkTheme ? '#ffffff' : '#000000');
    const bridgedChartData = useMemo(() => {
        if (disableForecastHistoricalBridge) {
            return chartData;
        }
        return ensureChartForecastBridge(chartData, {
            forecastSeriesIds: forecastData?.map(f => f.id),
        });
    }, [chartData, disableForecastHistoricalBridge, forecastData]);
    bridgedRef.current = bridgedChartData;
    const hiddenRef = useRef(hiddenSeries);
    const forecastRef = useRef(forecastData);
    const quantileBandsRef = useRef(quantileBands);
    const formatDateRef = useRef(formatDateFn);
    const histColorRef = useRef(historicalLineColor);
    useEffect(() => {
        hiddenRef.current = hiddenSeries;
    }, [hiddenSeries]);
    useEffect(() => {
        forecastRef.current = forecastData;
    }, [forecastData]);
    useEffect(() => {
        quantileBandsRef.current = quantileBands;
    }, [quantileBands]);
    useEffect(() => {
        formatDateRef.current = formatDateFn;
    }, [formatDateFn]);
    useEffect(() => {
        histColorRef.current = historicalLineColor;
    }, [historicalLineColor]);
    const mergedChartConfig = useMemo(() => {
        const base = {
            historical: { label: 'Historical Data', color: historicalLineColor },
            ...chartConfigProp,
        };
        forecastData.forEach((f, index) => {
            const key = `forecast_${f.id}`;
            base[key] = {
                label: f.name?.toString() ?? key,
                color: f.color?.toString() ?? getForecastColor(index),
            };
        });
        quantileBands?.forEach((band, index) => {
            base[band.key] = {
                label: band.name,
                color: band.color ?? getForecastQuantileBandColor(index),
            };
        });
        return base;
    }, [chartConfigProp, forecastData, historicalLineColor, quantileBands]);
    const legendPayload = useMemo(() => {
        if (!showLegend)
            return [];
        return forecastData.map((item, index) => ({
            value: item.name?.toString() || item.id?.toString() || '',
            color: item.color?.toString() || getForecastColor(index),
            dataKey: `forecast_${item.id}`,
            icon: item.icon,
            status: item.status,
            dimmed: item.dimmed,
            updated_at: item.updated_at,
        }));
    }, [forecastData, showLegend]);
    const structureKey = useMemo(() => [
        quantileBands?.map(b => b.key).join(',') ?? '',
        forecastData.map(f => f.id).join(','),
    ].join('|'), [forecastData, quantileBands]);
    const [tooltipState, setTooltipState] = useState({
        active: false,
        x: 0,
        y: 0,
        label: '',
        payload: [],
    });
    const applyTooltipPosition = useCallback(() => {
        const shell = shellRef.current;
        const wrapper = tooltipRef.current;
        if (!shell || !wrapper)
            return;
        const tw = tooltipSizeRef.current.width || wrapper.offsetWidth;
        const th = tooltipSizeRef.current.height || wrapper.offsetHeight;
        if (tw <= 0 || th <= 0)
            return;
        const { width: viewW, height: viewH } = shell.getBoundingClientRect();
        const next = clampTooltipTranslate({
            coordinate: { x: tooltipState.x, y: tooltipState.y },
            viewW,
            viewH,
            tooltipWidth: tw,
            tooltipHeight: th,
            offset: 10,
            edgeMargin: 8,
        });
        wrapper.style.transform = `translate(${next.x}px, ${next.y}px)`;
    }, [tooltipState.x, tooltipState.y]);
    useEffect(() => {
        if (!tooltipState.active)
            return;
        applyTooltipPosition();
    }, [
        applyTooltipPosition,
        tooltipState.active,
        tooltipState.payload,
        tooltipState.label,
        tooltipState.x,
        tooltipState.y,
    ]);
    useEffect(() => {
        const el = tooltipRef.current;
        if (!el || typeof ResizeObserver === 'undefined')
            return;
        const ro = new ResizeObserver(entries => {
            const entry = entries[0];
            if (!entry)
                return;
            const { width, height: h } = entry.contentRect;
            tooltipSizeRef.current = { width, height: h };
            requestAnimationFrame(() => applyTooltipPosition());
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [applyTooltipPosition]);
    useEffect(() => {
        const onWin = () => requestAnimationFrame(() => {
            applyTooltipPosition();
        });
        window.addEventListener('resize', onWin);
        return () => window.removeEventListener('resize', onWin);
    }, [applyTooltipPosition]);
    // Structural chart lifecycle
    useEffect(() => {
        const host = hostRef.current;
        if (!host)
            return;
        if (!bridgedChartData.length) {
            modelRef.current?.chart.remove();
            modelRef.current = null;
            return;
        }
        const iw = Math.max(1, Math.floor(host.clientWidth || host.offsetWidth || 640));
        const ih = Math.max(1, Math.floor(pixelHeight));
        const chart = createChart(host, {
            ...buildLightweightChartOptions({
                isDarkTheme,
                width: iw,
                height: ih,
            }),
        });
        const bands = new Map();
        quantileBands?.forEach((band, index) => {
            const fill = band.color ?? getForecastQuantileBandColor(index);
            const view = new QuantileBandPaneView({
                fill,
                stroke: band.strokeWidth ? fill : undefined,
                strokeWidth: band.strokeWidth ?? 0,
                strokeDasharray: band.strokeDasharray,
                strokeOpacity: band.strokeOpacity,
            });
            const api = chart.addCustomSeries(view, {
                color: fill,
                lastValueVisible: false,
                priceLineVisible: false,
                visible: !hiddenRef.current.has(band.key),
            });
            bands.set(band.key, { api, view });
        });
        const forecasts = new Map();
        forecastData.forEach((f, index) => {
            const key = `forecast_${f.id}`;
            const color = f.color?.toString() ?? getForecastColor(index);
            const api = chart.addSeries(LineSeries, {
                color,
                lineWidth: 1,
                lineType: LineType.Curved,
                lineStyle: forecastLineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid,
                lastValueVisible: false,
                priceLineVisible: false,
                visible: !hiddenRef.current.has(key),
            });
            forecasts.set(key, api);
        });
        const historical = chart.addSeries(LineSeries, {
            color: historicalLineColor,
            lineWidth: 1,
            lineType: LineType.Curved,
            lineStyle: LineStyle.Solid,
            lastValueVisible: false,
            priceLineVisible: false,
            visible: !hiddenRef.current.has('historical'),
        });
        modelRef.current = {
            chart,
            historical,
            forecasts,
            bands,
        };
        const onMove = (param) => {
            if (!showTooltip) {
                setTooltipState(s => ({ ...s, active: false, payload: [] }));
                return;
            }
            const rows = bridgedRef.current;
            if (!param.point || param.time === undefined || rows.length === 0) {
                setTooltipState(s => ({ ...s, active: false, payload: [] }));
                return;
            }
            const time = param.time;
            const row = findNearestChartRow(rows, time);
            if (!row) {
                setTooltipState(s => ({ ...s, active: false, payload: [] }));
                return;
            }
            const forecastsList = forecastRef.current;
            const bandsCfg = quantileBandsRef.current;
            const hid = hiddenRef.current;
            const fmt = formatDateRef.current;
            const histColor = histColorRef.current;
            const payload = [];
            const hVal = row.historical;
            if (typeof hVal === 'number' && Number.isFinite(hVal)) {
                payload.push({
                    type: 'line',
                    name: 'Historical Data',
                    value: hVal,
                    color: histColor,
                    dataKey: 'historical',
                    payload: row,
                });
            }
            forecastsList.forEach((f, index) => {
                const forecastKey = `forecast_${f.id}`;
                if (hid.has(forecastKey))
                    return;
                const value = row[forecastKey];
                if (typeof value !== 'number' || !Number.isFinite(value))
                    return;
                const color = f.color?.toString() ?? getForecastColor(index);
                payload.push({
                    type: 'line',
                    name: f.name?.toString() ?? forecastKey,
                    value,
                    color,
                    dataKey: forecastKey,
                    payload: row,
                });
            });
            bandsCfg?.forEach((band, index) => {
                if (hid.has(band.key))
                    return;
                const tuple = row[band.key];
                if (Array.isArray(tuple) &&
                    tuple.length === 2 &&
                    typeof tuple[0] === 'number' &&
                    typeof tuple[1] === 'number') {
                    const color = band.color ?? getForecastQuantileBandColor(index);
                    payload.push({
                        type: 'line',
                        name: band.name,
                        value: [tuple[0], tuple[1]],
                        color,
                        dataKey: band.key,
                        payload: row,
                    });
                }
            });
            if (!payload.length) {
                setTooltipState(s => ({ ...s, active: false, payload: [] }));
                return;
            }
            const label = fmt(row.date, true);
            setTooltipState({
                active: true,
                x: param.point.x,
                y: param.point.y,
                label,
                payload,
            });
        };
        chart.subscribeCrosshairMove(onMove);
        const resizeToHost = () => {
            const ww = Math.max(1, Math.floor(host.clientWidth));
            const hh = Math.max(1, Math.floor(host.clientHeight));
            chart.resize(ww, hh);
            scheduleFitTimeScale(chart);
        };
        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(resizeToHost);
            });
            resizeObserver.observe(host);
        }
        requestAnimationFrame(resizeToHost);
        return () => {
            resizeObserver?.disconnect();
            chart.unsubscribeCrosshairMove(onMove);
            chart.remove();
            modelRef.current = null;
        };
    }, [
        structureKey,
        isDarkTheme,
        pixelHeight,
        showTooltip,
        bridgedChartData.length,
    ]);
    // Push data / band styles
    useEffect(() => {
        const model = modelRef.current;
        if (!model)
            return;
        model.historical?.setData(buildHistoricalLineData(bridgedChartData));
        for (const [key, api] of model.forecasts.entries()) {
            api.setData(buildForecastLineData(bridgedChartData, key));
        }
        quantileBands?.forEach((band, index) => {
            const entry = model.bands.get(band.key);
            if (!entry)
                return;
            const fill = band.color ?? getForecastQuantileBandColor(index);
            entry.view.updateStyle({
                fill,
                stroke: band.strokeWidth ? fill : undefined,
                strokeWidth: band.strokeWidth ?? 0,
                strokeDasharray: band.strokeDasharray,
                strokeOpacity: band.strokeOpacity,
            });
            entry.api.applyOptions({ color: fill });
            entry.api.setData(buildQuantileBandCustomData(bridgedChartData, band.key));
        });
        scheduleFitTimeScale(model.chart);
    }, [bridgedChartData, quantileBands]);
    // Visibility toggles
    useEffect(() => {
        const model = modelRef.current;
        if (!model)
            return;
        model.historical?.applyOptions({
            visible: !hiddenSeries.has('historical'),
        });
        for (const [key, api] of model.forecasts.entries()) {
            api.applyOptions({ visible: !hiddenSeries.has(key) });
        }
        for (const [key, { api }] of model.bands.entries()) {
            api.applyOptions({ visible: !hiddenSeries.has(key) });
        }
        scheduleFitTimeScale(model.chart);
    }, [hiddenSeries]);
    // Line styling updates without structural rebuild
    useEffect(() => {
        const model = modelRef.current;
        if (!model?.historical)
            return;
        model.historical.applyOptions({ color: historicalLineColor });
    }, [historicalLineColor]);
    useEffect(() => {
        const model = modelRef.current;
        if (!model)
            return;
        const style = forecastLineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid;
        for (const api of model.forecasts.values()) {
            api.applyOptions({ lineStyle: style });
        }
    }, [forecastLineStyle]);
    const handleLegendClick = useCallback((data, index, event) => {
        const payloadItem = data;
        const key = payloadItem.dataKey;
        if (key) {
            if (!hiddenControlled) {
                setLocalHidden(prev => {
                    const next = new Set(prev);
                    if (next.has(key))
                        next.delete(key);
                    else
                        next.add(key);
                    return next;
                });
            }
        }
        onLegendClick?.(data, index, event);
    }, [hiddenControlled, onLegendClick]);
    if (error) {
        return (jsx("div", { className: cn(S.root, className), children: jsxs("div", { style: { color: 'var(--destructive, #f43f5e)' }, children: ["Error: ", error] }) }));
    }
    if (loading) {
        return (jsx("div", { className: cn(S.root, className), children: jsx("div", { style: { height: pixelHeight }, children: jsx(Skeleton, { style: { width: '100%', height: '100%' } }) }) }));
    }
    if (!bridgedChartData.length) {
        return (jsx("div", { className: cn(S.root, className), children: jsx("div", { style: { height: pixelHeight }, children: noDataMessage }) }));
    }
    return (jsx(ChartContext.Provider, { value: { config: mergedChartConfig }, children: jsxs("div", { className: cn(S.root, className), children: [jsxs("div", { "data-slot": "chart", "data-chart": `chart-${chartId}`, className: S.shell, ref: shellRef, style: { position: 'relative', width: '100%' }, children: [jsx(ChartStyle, { id: `chart-${chartId}`, config: mergedChartConfig }), jsx("div", { ref: hostRef, className: S.host, style: { width: '100%', height: pixelHeight } }), showTooltip ? (jsx("div", { ref: tooltipRef, className: S.tooltipMove, style: {
                                opacity: tooltipState.active && tooltipState.payload.length ? 1 : 0,
                            }, children: jsx(ChartTooltipContent, { active: tooltipState.active && tooltipState.payload.length > 0, label: tooltipState.label, payload: tooltipState.active && tooltipState.payload.length
                                    ? tooltipState.payload
                                    : [], labelFormatter: lbl => formatDateFn(typeof lbl === 'string' ? lbl : String(lbl), true), formatter: formatNumber
                                    ? (value, name) => {
                                        const v = typeof value === 'number'
                                            ? formatNumber(value)
                                            : Array.isArray(value)
                                                ? `${formatNumber(value[0])} – ${formatNumber(value[1])}`
                                                : String(value ?? '');
                                        return (jsxs(Fragment, { children: [jsxs("span", { children: [name, ": "] }), jsx("span", { children: v })] }));
                                    }
                                    : undefined }) })) : null] }), showLegend ? (jsx("div", { className: S.footer, children: jsx(CustomChartLegend, { payload: legendPayload, hiddenSeries: hiddenSeries, onClick: handleLegendClick }) })) : null] }) }));
}

export { LightweightForecastChart };
