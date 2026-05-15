import cn from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

import { ChartConfig } from '#uilib/components/ui/Chart/Chart';
import {
  BaseChartWrapper,
  BaseChartWrapperProps,
} from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { InteractionOverlay } from '#uilib/components/ui/InteractionOverlay/InteractionOverlay';
import { TimeRangeControls } from '#uilib/components/ui/TimeRangeControls/TimeRangeControls';
import { ensureChartForecastBridge } from '#uilib/utils/chartConnectionPoint';

import { CHART_MARGINS } from './ChartAreaInteractive.constants';
import {
  filterDataForTimeRange,
  longDateFormatter,
  shortDateFormatter,
} from './ChartAreaInteractive.helpers';
import S from './ChartAreaInteractive.styl';
import { ChartAreaInteractiveProps } from './ChartAreaInteractive.types';
import { TimeRangeBrushHost } from './TimeRangeBrushLayer';
import { IntervalsOverlay, PinOverlay, ThresholdsOverlay } from './overlays';

export const chartConfig = {
  // Chart now supports light/dark themes with dynamic colors
} satisfies ChartConfig;

export function ChartAreaInteractive({
  className,
  chartContainerClassName,
  legendClassName,
  xAxisClassName,
  yAxisClassName,
  timeRange,
  onTimeRangeChange,
  pinMonth,
  onPinMonthChange,
  onPreviewMonthChange,
  chartData,
  forecastData,
  error,
  loading = false,
  isDarkTheme = false,
  footerActions,
  mode,
  selectedForecast,
  upperQuantiles,
  lowerQuantiles,
  selectedLowerQuantile,
  selectedUpperQuantile,
  onLowerQuantileChange,
  onUpperQuantileChange,
  lowerThreshold,
  upperThreshold,
  onLowerThresholdChange,
  onUpperThresholdChange,
  discreteThresholdValues,
  headerActions,
  excludeLegendIds,
  loadingAnalyses,
  onLegendClick,
  onAnalysisSelect,
  disableTimeRangeSelector,
  forecastLineStyle = 'dashed',
  selectedAnalysisId,
  chartRenderId,
  toggleLegendSeries,
  ensureAnalysisSeriesVisible,
  overlayForecastData = {},
  hiddenSeries,
  disableForecastHistoricalBridge,
  overlayElements: overlayElementsProp,
  ...restProps
}: ChartAreaInteractiveProps) {
  const seriesHidden = hiddenSeries ?? new Set<string>();
  const hiddenSeriesRef = useRef(seriesHidden);
  const prevSelectedAnalysisIdRef = useRef<number | string | null | undefined>(
    selectedAnalysisId,
  );

  // Keep ref in sync with hiddenSeries (use seriesHidden so ref is always a Set)
  useEffect(() => {
    hiddenSeriesRef.current = seriesHidden;
  }, [seriesHidden]);

  // When analysis selected in CardTable, ensure it's visible in chart legend
  // Only run when selectedAnalysisId changes, not when hiddenSeries changes
  // This allows users to manually hide selected analyses via legend toggle
  useEffect(() => {
    // Only run when selectedAnalysisId actually changes
    if (prevSelectedAnalysisIdRef.current === selectedAnalysisId) return;
    prevSelectedAnalysisIdRef.current = selectedAnalysisId;

    if (selectedAnalysisId == null) return;
    const dataKey = `forecast_${selectedAnalysisId}`;
    if (hiddenSeriesRef.current.has(dataKey)) {
      ensureAnalysisSeriesVisible(selectedAnalysisId);
    }
  }, [selectedAnalysisId, ensureAnalysisSeriesVisible]);

  const timeFilteredChartData = useMemo(() => {
    const raw = selectedAnalysisId ?? selectedForecast?.id ?? null;
    const anchorId =
      raw == null ? null : typeof raw === 'number' ? raw : Number(raw);
    const opts =
      anchorId != null && Number.isFinite(anchorId)
        ? { endDateAnchorAnalysisId: anchorId }
        : undefined;
    return filterDataForTimeRange(chartData, timeRange, opts);
  }, [chartData, timeRange, selectedAnalysisId, selectedForecast?.id]);

  const bridgedChartData = useMemo(
    () =>
      disableForecastHistoricalBridge
        ? timeFilteredChartData
        : ensureChartForecastBridge(timeFilteredChartData, {
            forecastSeriesIds: forecastData?.map(f => f.id),
          }),
    [timeFilteredChartData, disableForecastHistoricalBridge, forecastData],
  );

  // Extract quantileBands from restProps
  // const quantileBands = (restProps as any).quantileBands;

  const getLoadingMessage = () => {
    // Always return undefined - BaseChartWrapper will handle loading state
    // This prevents showing spinner when data is cached but timeRangedChartData hasn't been computed yet
    return undefined;
  };

  const handleLegendClick = data => {
    const seriesName = data.dataKey as string;

    if (onLegendClick?.(data) === false) return;

    toggleLegendSeries(seriesName);
  };

  const loadingMessage = getLoadingMessage();

  const baseChartProps: BaseChartWrapperProps = {
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
    labelFormatter: (v: unknown) => longDateFormatter(v as string),
    chartType: 'composed' as const,
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

  const brushEnabled =
    !disableTimeRangeSelector &&
    !loading &&
    bridgedChartData.length > 1 &&
    mode == null;

  const renderChart = () => {
    const overlayClassName = cn(chartContainerClassName);

    switch (mode) {
      case 'pin':
        return (
          <PinOverlay
            className={overlayClassName}
            baseChartProps={baseChartProps}
            pinMonth={pinMonth}
            onPinMonthChange={onPinMonthChange}
            onPreviewMonthChange={onPreviewMonthChange}
          />
        );

      case 'intervals':
        return (
          <IntervalsOverlay
            className={overlayClassName}
            baseChartProps={baseChartProps}
            selectedForecast={selectedForecast}
            upperQuantiles={upperQuantiles}
            lowerQuantiles={lowerQuantiles}
            selectedLowerQuantile={selectedLowerQuantile}
            selectedUpperQuantile={selectedUpperQuantile}
            onLowerQuantileChange={onLowerQuantileChange}
            onUpperQuantileChange={onUpperQuantileChange}
            overlayForecastData={overlayForecastData}
          />
        );

      case 'thresholds':
        return (
          <ThresholdsOverlay
            className={overlayClassName}
            baseChartProps={baseChartProps}
            selectedForecast={selectedForecast}
            lowerThreshold={lowerThreshold}
            upperThreshold={upperThreshold}
            onLowerThresholdChange={onLowerThresholdChange}
            onUpperThresholdChange={onUpperThresholdChange}
            discreteThresholdValues={discreteThresholdValues}
            overlayForecastData={overlayForecastData}
          />
        );

      default:
        return (
          <TimeRangeBrushHost
            chartData={bridgedChartData}
            onTimeRangeChange={onTimeRangeChange}
            enabled={brushEnabled}
            layoutKey={chartRenderId ?? null}
          >
            <BaseChartWrapper
              {...baseChartProps}
              chartClassName={cn(S.chartContainer, chartContainerClassName)}
            />
          </TimeRangeBrushHost>
        );
    }
  };

  return (
    <InteractionOverlay className={cn(className, loading && S.loading)}>
      {(!disableTimeRangeSelector || headerActions) && (
        <div className={S.chartHeaderContainer}>
          {!disableTimeRangeSelector && (
            <TimeRangeControls
              timeRange={timeRange}
              onTimeRangeChange={onTimeRangeChange}
              loading={loading}
            />
          )}

          {headerActions}
        </div>
      )}

      {renderChart()}
    </InteractionOverlay>
  );
}
