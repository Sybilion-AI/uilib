import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useEffect, useMemo } from 'react';
import { BaseChartWrapper } from '../Chart/components/BaseChartWrapper.js';
import { InteractionOverlay } from '../InteractionOverlay/InteractionOverlay.js';
import { TimeRangeControls } from '../TimeRangeControls/TimeRangeControls.js';
import { ensureChartForecastBridge } from '../../../utils/chartConnectionPoint.js';
import { CHART_MARGINS } from './ChartAreaInteractive.constants.js';
import { filterDataForTimeRange, shortDateFormatter, longDateFormatter } from './ChartAreaInteractive.helpers.js';
import S from './ChartAreaInteractive.styl.js';
import { TimeRangeBrushHost } from './TimeRangeBrushLayer.js';
import { PinOverlay } from './overlays/PinOverlay/PinOverlay.js';
import { IntervalsOverlay } from './overlays/IntervalsOverlay/IntervalsOverlay.js';
import { ThresholdsOverlay } from './overlays/ThresholdsOverlay/ThresholdsOverlay.js';

const chartConfig = {
// Chart now supports light/dark themes with dynamic colors
};
function ChartAreaInteractive({ className, chartContainerClassName, legendClassName, xAxisClassName, yAxisClassName, timeRange, onTimeRangeChange, pinMonth, onPinMonthChange, onPreviewMonthChange, chartData, forecastData, error, loading = false, isDarkTheme = false, footerActions, mode, selectedForecast, upperQuantiles, lowerQuantiles, selectedLowerQuantile, selectedUpperQuantile, onLowerQuantileChange, onUpperQuantileChange, lowerThreshold, upperThreshold, onLowerThresholdChange, onUpperThresholdChange, discreteThresholdValues, headerActions, excludeLegendIds, loadingAnalyses, onLegendClick, onAnalysisSelect, disableTimeRangeSelector, enableTimeRangeBrush = false, forecastLineStyle = 'dashed', selectedAnalysisId, chartRenderId, toggleLegendSeries, ensureAnalysisSeriesVisible, overlayForecastData = {}, hiddenSeries, disableForecastHistoricalBridge, overlayElements: overlayElementsProp, ...restProps }) {
    const seriesHidden = hiddenSeries ?? new Set();
    const hiddenSeriesRef = useRef(seriesHidden);
    const prevSelectedAnalysisIdRef = useRef(selectedAnalysisId);
    // Keep ref in sync with hiddenSeries (use seriesHidden so ref is always a Set)
    useEffect(() => {
        hiddenSeriesRef.current = seriesHidden;
    }, [seriesHidden]);
    // When analysis selected in CardTable, ensure it's visible in chart legend
    // Only run when selectedAnalysisId changes, not when hiddenSeries changes
    // This allows users to manually hide selected analyses via legend toggle
    useEffect(() => {
        // Only run when selectedAnalysisId actually changes
        if (prevSelectedAnalysisIdRef.current === selectedAnalysisId)
            return;
        prevSelectedAnalysisIdRef.current = selectedAnalysisId;
        if (selectedAnalysisId == null)
            return;
        const dataKey = `forecast_${selectedAnalysisId}`;
        if (hiddenSeriesRef.current.has(dataKey)) {
            ensureAnalysisSeriesVisible(selectedAnalysisId);
        }
    }, [selectedAnalysisId, ensureAnalysisSeriesVisible]);
    const timeFilteredChartData = useMemo(() => {
        const raw = selectedAnalysisId ?? selectedForecast?.id ?? null;
        const anchorId = raw == null ? null : typeof raw === 'number' ? raw : Number(raw);
        const opts = anchorId != null && Number.isFinite(anchorId)
            ? { endDateAnchorAnalysisId: anchorId }
            : undefined;
        return filterDataForTimeRange(chartData, timeRange, opts);
    }, [chartData, timeRange, selectedAnalysisId, selectedForecast?.id]);
    const bridgedChartData = useMemo(() => disableForecastHistoricalBridge
        ? timeFilteredChartData
        : ensureChartForecastBridge(timeFilteredChartData, {
            forecastSeriesIds: forecastData?.map(f => f.id),
        }), [timeFilteredChartData, disableForecastHistoricalBridge, forecastData]);
    // Extract quantileBands from restProps
    // const quantileBands = (restProps as any).quantileBands;
    const getLoadingMessage = () => {
        // Always return undefined - BaseChartWrapper will handle loading state
        // This prevents showing spinner when data is cached but timeRangedChartData hasn't been computed yet
        return undefined;
    };
    const handleLegendClick = data => {
        const seriesName = data.dataKey;
        if (onLegendClick?.(data) === false)
            return;
        toggleLegendSeries(seriesName);
    };
    const loadingMessage = getLoadingMessage();
    const baseChartProps = {
        renderId: chartRenderId?.toString(),
        xAxisClassName,
        yAxisClassName,
        chartData: bridgedChartData,
        chartClassName: S.chartContainer,
        // chartClassName: cn(S.chartContainer, chartContainerClassName),
        legendClassName,
        forecastData,
        loading,
        hasCombinedData: restProps.hasCombinedData,
        isDarkTheme,
        // formatNumber,
        formatDate: shortDateFormatter,
        labelFormatter: (v) => longDateFormatter(v),
        chartType: 'composed',
        margin: { ...CHART_MARGINS },
        hiddenSeries: seriesHidden,
        onLegendClick: handleLegendClick,
        onAnalysisSelect: onAnalysisSelect,
        error,
        footerActions,
        loadingMessage,
        excludeLegendIds,
        forecastLineStyle,
        overlayElements: overlayElementsProp,
        // loadingAnalyses,
        ...restProps,
    };
    const brushEnabled = (!disableTimeRangeSelector || enableTimeRangeBrush) &&
        !loading &&
        bridgedChartData.length > 1;
    const renderChart = () => {
        const overlayClassName = cn(chartContainerClassName);
        switch (mode) {
            case 'pin':
                return (jsx(PinOverlay, { className: overlayClassName, baseChartProps: baseChartProps, pinMonth: pinMonth, onPinMonthChange: onPinMonthChange, onPreviewMonthChange: onPreviewMonthChange }));
            case 'intervals':
                return (jsx(IntervalsOverlay, { className: overlayClassName, baseChartProps: baseChartProps, selectedForecast: selectedForecast, upperQuantiles: upperQuantiles, lowerQuantiles: lowerQuantiles, selectedLowerQuantile: selectedLowerQuantile, selectedUpperQuantile: selectedUpperQuantile, onLowerQuantileChange: onLowerQuantileChange, onUpperQuantileChange: onUpperQuantileChange, overlayForecastData: overlayForecastData }));
            case 'thresholds':
                return (jsx(ThresholdsOverlay, { className: overlayClassName, baseChartProps: baseChartProps, selectedForecast: selectedForecast, lowerThreshold: lowerThreshold, upperThreshold: upperThreshold, onLowerThresholdChange: onLowerThresholdChange, onUpperThresholdChange: onUpperThresholdChange, discreteThresholdValues: discreteThresholdValues, overlayForecastData: overlayForecastData }));
            default:
                return (jsx(BaseChartWrapper, { ...baseChartProps, chartClassName: cn(S.chartContainer, chartContainerClassName) }));
        }
    };
    return (jsxs(InteractionOverlay, { className: cn(className, loading && S.loading), disabled: loading, children: [(!disableTimeRangeSelector || headerActions) && (jsxs("div", { className: S.chartHeaderContainer, children: [!disableTimeRangeSelector && (jsx(TimeRangeControls, { timeRange: timeRange, onTimeRangeChange: onTimeRangeChange, loading: loading })), headerActions] })), jsx(TimeRangeBrushHost, { chartData: bridgedChartData, onTimeRangeChange: onTimeRangeChange, enabled: brushEnabled, layoutKey: chartRenderId ?? null, children: renderChart() })] }));
}

export { ChartAreaInteractive, chartConfig };
