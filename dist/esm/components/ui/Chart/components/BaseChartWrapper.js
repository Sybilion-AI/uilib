import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { forwardRef, useState, useRef, useMemo, useEffect } from 'react';
import { ChartTooltip } from '../Chart.js';
import { QuantileBands } from './QuantileBands.js';
import { getForecastColor, ChartLines } from '../../ChartAreaInteractive/ChartLines.js';
import { Skeleton } from '../../Skeleton/Skeleton.js';
import { chartRenderQueue } from '../../../../utils/chartRenderQueue.js';
import { LineChart, ComposedChart } from 'recharts';
import { formatDate } from '../tools/formatters.js';
import S from './BaseChartWrapper.styl.js';
import { ChartAxes } from './ChartAxes.js';
import { ChartGrid } from './ChartGrid.js';
import { LegendSvg } from './LegendSvg/LegendSvg.js';
import { ChartContainer } from './ChartContainer.js';
import { CustomChartLegend } from './CustomChartLegend/CustomChartLegend.js';
import { ChartTooltipContent } from './ChartTooltipContent.js';

const DEFAULT_CHART_MARGIN = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
};
function resolveChartMargin(margin) {
    return {
        top: margin?.top ?? DEFAULT_CHART_MARGIN.top,
        right: margin?.right ?? DEFAULT_CHART_MARGIN.right,
        bottom: margin?.bottom ?? DEFAULT_CHART_MARGIN.bottom,
        left: margin?.left ?? DEFAULT_CHART_MARGIN.left,
    };
}
/** Plot box inside `.recharts-wrapper`, same convention as Recharts cartesian viewBox. */
function getPlotViewBox(wrapper, m) {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    return {
        x: m.left,
        y: m.top,
        width: Math.max(0, w - m.left - m.right),
        height: Math.max(0, h - m.top - m.bottom),
    };
}
function clampTooltipTranslate(args) {
    const { coordinate, viewBox, tooltipWidth: tw, tooltipHeight: th, offset, edgeMargin, } = args;
    const minX = viewBox.x + edgeMargin;
    const maxX = viewBox.x + viewBox.width - tw - edgeMargin;
    const minY = viewBox.y + edgeMargin;
    const maxY = viewBox.y + viewBox.height - th - edgeMargin;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
    let tx = coordinate.x + offset;
    if (tx + tw > viewBox.x + viewBox.width - edgeMargin) {
        tx = coordinate.x - tw - offset;
    }
    tx = clamp(tx, minX, maxX);
    let ty = coordinate.y + offset;
    if (ty + th > viewBox.y + viewBox.height - edgeMargin) {
        ty = coordinate.y - th - offset;
    }
    ty = clamp(ty, minY, maxY);
    return { x: tx, y: ty };
}
/**
 * Simple loading component without hooks for better performance
 * Rendered when chart is waiting in render queue
 */
const BaseChartWrapperLoading = forwardRef(({ className, height, loadingMessage }, ref) => {
    return (jsx("div", { ref: ref, className: cn(S.root, className), children: jsx("div", { className: S.chartLoadingContainer, style: height ? { height: `${height}px` } : undefined, children: loadingMessage || (jsx("div", { className: S.loadingOverlay, children: jsx(Skeleton, { style: { width: '100%', height: '100%' } }) })) }) }));
});
BaseChartWrapperLoading.displayName = 'BaseChartWrapperLoading';
/**
 * Chart content component with all hooks and logic
 * Separated to maintain hook order consistency
 */
const BaseChartWrapperContent = forwardRef((props, ref) => {
    const { chartConfig = {}, chartData, historicalLineColor, forecastData = [], loading, hasCombinedData, renderId, isDarkTheme, height, className, loadingComponentClassName, footerClassName, chartClassName, xAxisClassName, yAxisClassName, legendClassName, footerActions, quantileBands, quantileBandKey, xMin, xMax, yMin, yMax, autoScaleYAxis = true, formatNumber, formatDate: formatDateFn = formatDate, labelFormatter, onLegendClick, margin, chartType = 'composed', disableAnimation = false, showGrid = true, showAxes = true, showTooltip = true, showLegend = true, showChartAxesLegend = true, xAxisLabel, yAxisLabel, showActiveDots = true, overlayElements, hiddenSeries, excludeLegendIds, onAnalysisSelect, onFailedAnalysisClick, containerProps, error, loadingMessage, noDataMessage = 'No data available', onGridHeightChange, forecastLineStyle = 'dashed', disableHistoricalAnimation = false, onShowAll: _onShowAll, onShowOnly: _onShowOnly, maxVisibleItems, preventDeselection, legendVariant = 'default', legendWidth = 1000, legendMarginLeft = 0, } = props;
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const rootRef = useRef(null);
    const setRefs = (node) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        }
        else if (ref) {
            ref.current = node;
        }
    };
    const resolvedChartMargin = useMemo(() => resolveChartMargin(margin), [margin?.top, margin?.right, margin?.bottom, margin?.left]);
    const TOOLTIP_EDGE_MARGIN = 8;
    const TOOLTIP_OFFSET = 10;
    const tooltipWrapperRef = useRef(null);
    const rawTooltipCoordinateRef = useRef(null);
    const tooltipSizeRef = useRef({
        width: 0,
        height: 0,
    });
    const tooltipResizeObserverRef = useRef(null);
    const tooltipResizeObservedTargetRef = useRef(null);
    const applyTooltipPosition = () => {
        const wrapper = tooltipWrapperRef.current;
        const coord = rawTooltipCoordinateRef.current;
        const chartWrapper = rootRef.current?.querySelector('.recharts-wrapper');
        if (!wrapper || !coord || !(chartWrapper instanceof HTMLElement))
            return;
        const measured = wrapper.getBoundingClientRect();
        const width = tooltipSizeRef.current.width || measured.width;
        const height = tooltipSizeRef.current.height || measured.height;
        if (width <= 0 || height <= 0)
            return;
        tooltipSizeRef.current = { width, height };
        const next = clampTooltipTranslate({
            coordinate: coord,
            viewBox: getPlotViewBox(chartWrapper, resolvedChartMargin),
            tooltipWidth: width,
            tooltipHeight: height,
            offset: TOOLTIP_OFFSET,
            edgeMargin: TOOLTIP_EDGE_MARGIN,
        });
        wrapper.style.transform = `translate(${next.x}px, ${next.y}px)`;
    };
    const applyTooltipPositionRef = useRef(applyTooltipPosition);
    applyTooltipPositionRef.current = applyTooltipPosition;
    // Own only the final transform: smooth follow cursor, but clamp in local chart coords first.
    useEffect(() => {
        const connectResizeObserver = (wrapperEl) => {
            if (tooltipResizeObservedTargetRef.current === wrapperEl) {
                return;
            }
            const resizeRo = tooltipResizeObserverRef.current ??
                new ResizeObserver(entries => {
                    const entry = entries[0];
                    if (!entry)
                        return;
                    const { width, height } = entry.contentRect;
                    tooltipSizeRef.current = { width, height };
                    requestAnimationFrame(() => applyTooltipPositionRef.current());
                });
            tooltipResizeObserverRef.current = resizeRo;
            const prevObserved = tooltipResizeObservedTargetRef.current;
            if (prevObserved && prevObserved !== wrapperEl) {
                resizeRo.unobserve(prevObserved);
            }
            tooltipResizeObservedTargetRef.current = wrapperEl;
            resizeRo.observe(wrapperEl);
            if (wrapperEl instanceof HTMLElement) {
                tooltipWrapperRef.current = wrapperEl;
                wrapperEl.style.transition =
                    'transform 0.2s ease-out, opacity 0.2s ease-out';
                requestAnimationFrame(() => applyTooltipPositionRef.current());
            }
        };
        const tryObserveTooltipWrapper = () => {
            const wrapper = rootRef.current?.querySelector('.recharts-tooltip-wrapper');
            if (wrapper)
                connectResizeObserver(wrapper);
        };
        tryObserveTooltipWrapper();
        const observer = new MutationObserver(mutations => {
            tryObserveTooltipWrapper();
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'style' &&
                    mutation.target === tooltipWrapperRef.current) {
                    requestAnimationFrame(() => applyTooltipPositionRef.current());
                }
            });
        });
        if (rootRef.current) {
            observer.observe(rootRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style'],
            });
        }
        const onWinResize = () => {
            requestAnimationFrame(() => applyTooltipPositionRef.current());
        };
        window.addEventListener('resize', onWinResize);
        return () => {
            observer.disconnect();
            tooltipResizeObserverRef.current?.disconnect();
            tooltipResizeObserverRef.current = null;
            tooltipResizeObservedTargetRef.current = null;
            tooltipWrapperRef.current = null;
            window.removeEventListener('resize', onWinResize);
        };
    }, []);
    const renderTooltipContent = (props) => {
        // Filter payload to exclude items with null/undefined values
        // This prevents showing stale data when hovering on dates without data points
        const filteredPayload = props.payload?.filter((item) => item.value !== null && item.value !== undefined && item.type !== 'none');
        // If no valid payload items, render ChartTooltipContent with active=false and empty payload
        // This allows ChartTooltipContent to clear its lastTooltipData state
        if (!filteredPayload || filteredPayload.length === 0) {
            return (jsx(ChartTooltipContent, { active: false, payload: [], label: props.label, labelFormatter: labelFormatter || defaultLabelFormatter, indicator: "dot" }));
        }
        const isActive = props.active === true;
        if (isActive && props.coordinate) {
            rawTooltipCoordinateRef.current = {
                x: props.coordinate.x,
                y: props.coordinate.y,
            };
            requestAnimationFrame(() => applyTooltipPositionRef.current());
        }
        else {
            rawTooltipCoordinateRef.current = null;
        }
        return (jsx(ChartTooltipContent, { active: props.active, payload: filteredPayload, label: props.label, labelFormatter: labelFormatter || defaultLabelFormatter, indicator: "dot" }));
    };
    // Extract only line data (historical and forecast_* properties) for animation trigger
    // This prevents re-animation when only quantile band data changes
    // Use a stable reference based on actual line data values, not chartData reference
    const lineDataKey = useMemo(() => {
        const lineData = chartData.map(point => {
            const linePoint = { date: point.date };
            if (point.historical !== undefined) {
                linePoint.historical = point.historical;
            }
            // Include all forecast_* properties but exclude quantile band properties
            Object.keys(point).forEach(key => {
                if (key.startsWith('forecast_')) {
                    linePoint[key] = point[key];
                }
            });
            return linePoint;
        });
        // Create a stable key based on actual line data values
        return JSON.stringify(lineData);
    }, [chartData]);
    const lineDataForAnimation = useMemo(() => {
        const lineData = chartData.map(point => {
            const linePoint = { date: point.date };
            if (point.historical !== undefined) {
                linePoint.historical = point.historical;
            }
            // Include all forecast_* properties but exclude quantile band properties
            Object.keys(point).forEach(key => {
                if (key.startsWith('forecast_')) {
                    linePoint[key] = point[key];
                }
            });
            return linePoint;
        });
        return lineData;
    }, [lineDataKey]);
    const legendPayload = useMemo(() => {
        if (!showLegend)
            return [];
        return forecastData
            .filter((item) => excludeLegendIds ? !excludeLegendIds.includes(item.id) : true)
            .map((item, index) => ({
            value: item.name?.toString() || item.id?.toString() || '',
            // type: item.id?.toString() || '',
            color: item.color?.toString() || getForecastColor(index),
            dataKey: `forecast_${item.id}`,
            icon: item.icon,
            status: item.status,
            // pending: item.pending,
            // tooltip: item.tooltip,
            dimmed: item.dimmed,
            updated_at: item.updated_at,
        }));
    }, [forecastData, excludeLegendIds, showLegend]);
    useEffect(() => {
        if (disableAnimation)
            return;
        // Enable animation briefly when line data changes (not quantile band data)
        setShouldAnimate(true);
        const timer = setTimeout(() => setShouldAnimate(false), 1000);
        return () => clearTimeout(timer);
    }, [lineDataForAnimation, disableAnimation]);
    const isLoaded = useMemo(() => !loading && chartData.length > 0, [loading, chartData.length]);
    // const resizePinContainer = useThrottleCallback(() => {
    //   const grid = rootRef.current?.querySelector('.recharts-cartesian-grid');
    //   if (grid && rootRef.current) {
    //     const rect = grid.getBoundingClientRect();
    //     // Check if height changed for backward compatibility
    //     if (rect.height !== prevGridHeightRef.current) {
    //       onGridHeightChange?.(rect.height);
    //       prevGridHeightRef.current = rect.height;
    //     }
    //   }
    // }, 1000);
    // useResizeObserver(rootRef, resizePinContainer);
    if (error) {
        return (jsx("div", { className: cn(S.root, className), children: jsx("div", { className: S.errorContainer, children: jsxs("div", { className: S.errorMessage, children: ["Error: ", error] }) }) }));
    }
    if (loadingMessage !== undefined) {
        return (jsx("div", { className: cn(S.root, className), children: jsx("div", { className: S.chartLoadingContainer, children: loadingMessage }) }));
    }
    if (!chartData.length) {
        // If hasCombinedData is true but chartData is empty, data is being processed - wait instead of showing "No data"
        if (hasCombinedData) {
            // Return empty div to wait for chartData to be populated
            return jsx("div", { className: cn(S.root, className) });
        }
        // If renderId is undefined/null, we're still initializing - wait instead of showing "No data"
        if (!renderId) {
            // Return empty div to wait for initialization to complete
            return jsx("div", { className: cn(S.root, className) });
        }
        return (jsx("div", { className: cn(S.root, className), children: jsx("div", { className: S.errorContainer, children: noDataMessage }) }));
    }
    // Smart auto-scaling: detect when explicit bounds are too wide
    // Only apply smart auto-scaling if autoScaleYAxis is not explicitly set to false
    // When autoScaleYAxis is explicitly false, respect it (e.g., for IntervalsOverlay quantile dragging)
    let effectiveAutoScale = autoScaleYAxis;
    if (autoScaleYAxis !== false && yMin !== undefined && yMax !== undefined) {
        const dataKeys = chartData.length > 0 ? Object.keys(chartData[0]) : [];
        const historicalValues = chartData
            .map(p => p.historical)
            .filter(v => v !== null && v !== undefined);
        const forecastKeys = dataKeys.filter(k => k.startsWith('forecast_'));
        const forecastValues = chartData
            .flatMap(p => forecastKeys.map(k => p[k]))
            .filter(v => v !== null && v !== undefined);
        const allLineValues = [...historicalValues, ...forecastValues];
        if (allLineValues.length > 0) {
            // @ts-ignore
            const dataMin = Math.min(...allLineValues);
            // @ts-ignore
            const dataMax = Math.max(...allLineValues);
            const explicitRange = yMax - yMin;
            const dataRange = dataMax - dataMin;
            const wastedSpaceRatio = (explicitRange - dataRange) / dataRange;
            // If more than 30% of the chart is empty space, switch to auto-scaling
            if (wastedSpaceRatio > 0.3) {
                effectiveAutoScale = true;
            }
        }
    }
    const ChartComponent = chartType === 'line' ? LineChart : ComposedChart;
    const defaultLabelFormatter = (v) => formatDateFn(v, true);
    return (jsxs("div", { className: cn(S.root, !showLegend && S.noLegend, !showChartAxesLegend && S.hideChartAxesLegend, isLoaded && S.loaded, className), ref: setRefs, children: [loading && (jsx("div", { className: S.loadingOverlay, children: jsx(Skeleton, {}) })), showGrid && (jsx(ChartContainer, { config: chartConfig, className: cn(S.gridLayer, chartClassName), style: height ? { height: `${height}px` } : undefined, children: jsxs(ChartComponent, { data: chartData, margin: margin, children: [jsx(ChartGrid, {}), showAxes && (jsx(ChartAxes, { formatDate: formatDateFn, formatNumber: formatNumber, xAxisClassName: xAxisClassName, yAxisClassName: yAxisClassName, xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel, xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax, autoScaleYAxis: effectiveAutoScale }))] }) })), jsx(ChartContainer, { config: chartConfig, className: cn(S.chartLayer, chartClassName), style: height ? { height: `${height}px` } : undefined, ...containerProps, children: jsxs(ChartComponent, { data: chartData, margin: margin, children: [showAxes && (jsx(ChartAxes, { formatDate: formatDateFn, formatNumber: formatNumber, xAxisClassName: cn(xAxisClassName), yAxisClassName: cn(yAxisClassName), xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel, xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax, autoScaleYAxis: effectiveAutoScale })), quantileBands?.[0] && (jsx(QuantileBands, { hiddenBands: hiddenSeries, quantileBandKey: quantileBandKey, animate: true, animationDuration: 150, animationBegin: 0, customBands: quantileBands, showLegend: showLegend })), jsx(ChartLines, { historicalLineColor: historicalLineColor, chartData: chartData, forecastData: forecastData, hiddenSeries: hiddenSeries, isDarkTheme: isDarkTheme, shouldAnimate: shouldAnimate, showLegend: showLegend, forecastLineStyle: forecastLineStyle }), showTooltip && (jsx("div", { children: jsx(ChartTooltip, { cursor: false, offset: TOOLTIP_OFFSET, allowEscapeViewBox: { x: false, y: false }, content: renderTooltipContent }) }))] }) }), overlayElements, jsxs("div", { className: cn(S.footer, footerClassName), children: [showLegend &&
                        (legendVariant === 'svg' ? (jsx(LegendSvg, { payload: legendPayload.map(p => ({
                                value: p.value,
                                color: p.color,
                                dataKey: p.dataKey,
                            })), width: legendWidth, marginLeft: legendMarginLeft })) : (jsx(CustomChartLegend, { className: legendClassName, payload: legendPayload, onClick: onLegendClick, hiddenSeries: hiddenSeries, onAnalysisSelect: onAnalysisSelect, onFailedAnalysisClick: onFailedAnalysisClick, maxVisibleItems: maxVisibleItems, preventDeselection: preventDeselection }))), footerActions] })] }));
});
BaseChartWrapperContent.displayName = 'BaseChartWrapperContent';
/**
 * Base chart wrapper component with common structure
 * Handles container, grid, axes, tooltip, and legend
 */
function BaseChartWrapper(props) {
    const { renderId, chartData, loading, hasCombinedData, legendVariant } = props;
    const [isReadyToRender, setIsReadyToRender] = useState(false);
    const containerRef = useRef(null);
    // Register callback in render queue on mount, only if chart is visible
    useEffect(() => {
        // Export mode (legendVariant=svg): render immediately, skip queue
        if (legendVariant === 'svg') {
            setIsReadyToRender(true);
            return;
        }
        // Skip render queue if data is available from cache, chartData is ready, and not loading
        if (hasCombinedData && chartData.length > 0 && !loading) {
            setIsReadyToRender(true);
            return;
        }
        let observer = null;
        // Wait for DOM to be ready before checking visibility
        const checkAndRegister = () => {
            const container = containerRef.current;
            if (!container) {
                return;
            }
            // Check if element is already visible
            const rect = container.getBoundingClientRect();
            const isVisible = rect.width > 0 &&
                rect.height > 0 &&
                rect.top < window.innerHeight &&
                rect.bottom > 0 &&
                rect.left < window.innerWidth &&
                rect.right > 0;
            if (isVisible) {
                chartRenderQueue.registerCallback(() => {
                    setIsReadyToRender(true);
                });
                return;
            }
            // Otherwise, wait for element to become visible using IntersectionObserver
            observer = new IntersectionObserver(entries => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    // Element is visible, register callback
                    chartRenderQueue.registerCallback(() => {
                        setIsReadyToRender(true);
                    });
                    observer?.disconnect();
                }
            }, {
                threshold: 0.01, // Trigger when at least 1% of the element is visible
            });
            observer.observe(container);
        };
        // Use requestAnimationFrame to ensure DOM is ready
        const rafId = requestAnimationFrame(() => {
            checkAndRegister();
        });
        return () => {
            cancelAnimationFrame(rafId);
            observer?.disconnect();
        };
    }, [renderId, chartData.length, loading, hasCombinedData, legendVariant]);
    // Show loading skeleton when datasets list is loading (after all hooks are called)
    if (loading) {
        return (jsx(BaseChartWrapperLoading, { ref: containerRef, className: cn(props.className, props.loadingComponentClassName), height: props.height, loadingMessage: props.loadingMessage }));
    }
    // If not ready to render, show loading component (no hooks initialized)
    if (!isReadyToRender) {
        return (jsx(BaseChartWrapperLoading, { ref: containerRef, className: cn(props.className, props.loadingComponentClassName), height: props.height, loadingMessage: props.loadingMessage }));
    }
    // Render chart content with all hooks
    return jsx(BaseChartWrapperContent, { ref: containerRef, ...props });
}

export { BaseChartWrapper };
