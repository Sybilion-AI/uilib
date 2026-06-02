import cn from 'classnames';
import {
  ComponentProps,
  ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  ChartLines,
  ForecastItemData,
  getForecastColor,
} from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { Skeleton } from '#uilib/components/ui/Skeleton';
import { chartRenderQueue } from '#uilib/utils/chartRenderQueue';
import { Tooltip as ChartTooltip, ComposedChart, LineChart } from 'recharts';
import { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

import type { ChartConfig } from '../Chart.types';
import { getPlotViewBox, resolveChartMargin } from '../tools/chartPlotGeometry';
import { formatDate } from '../tools/formatters';
import S from './BaseChartWrapper.styl';
import { ChartAxes } from './ChartAxes';
import { ChartContainer } from './ChartContainer';
import { ChartGrid } from './ChartGrid';
import { ChartTooltipContent } from './ChartTooltipContent';
import { CustomChartLegend } from './CustomChartLegend/CustomChartLegend';
import { LegendSvg } from './LegendSvg/LegendSvg';
import { QuantileBands } from './QuantileBands';

function clampTooltipTranslate(args: {
  coordinate: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
  tooltipWidth: number;
  tooltipHeight: number;
  offset: number;
  edgeMargin: number;
}): { x: number; y: number } {
  const {
    coordinate,
    viewBox,
    tooltipWidth: tw,
    tooltipHeight: th,
    offset,
    edgeMargin,
  } = args;

  const minX = viewBox.x + edgeMargin;
  const maxX = viewBox.x + viewBox.width - tw - edgeMargin;
  const minY = viewBox.y + edgeMargin;
  const maxY = viewBox.y + viewBox.height - th - edgeMargin;

  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), Math.max(lo, hi));

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

export interface BaseChartWrapperProps {
  renderId?: string; // unique id for the render, used to identify the render in the render queue
  chartConfig?: ChartConfig;
  chartData: ChartDataPoint[];
  historicalLineColor?: string;
  forecastData?: ForecastItemData[];
  loading: boolean;
  hasCombinedData?: boolean; // Indicates if combinedData is available (for cache hits)
  isDarkTheme: boolean;
  height?: number;
  className?: string;
  loadingComponentClassName?: string;
  footerClassName?: string;
  chartClassName?: string;
  xAxisClassName?: string;
  yAxisClassName?: string;
  legendClassName?: string;
  footerActions?: ReactNode;
  quantileBands?: QuantileBandConfig[];
  quantileBandKey?: string;
  xMin?: string | number;
  xMax?: string | number;
  yMin?: number;
  yMax?: number;
  autoScaleYAxis?: boolean;
  formatNumber?: (value: number) => string;
  formatDate?: (value: string, detailed?: boolean) => string;
  labelFormatter?: (value: unknown) => string;
  onLegendClick?: (data: LegendPayload, index: number, event: any) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
  children?: ReactNode;
  chartType?: 'composed' | 'line';
  disableAnimation?: boolean;
  /**
   * Skip left-to-right line path draw; still animate Y on data updates.
   * Independent of `disableAnimation` (full off).
   */
  disableLineDrawAnimation?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showChartAxesLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showActiveDots?: boolean;
  overlayElements?: ReactNode;
  hiddenSeries?: Set<string>;
  /** When false (default), hidden series values are excluded from Y-axis domain calculation. */
  includeHiddenInYScale?: boolean;
  excludeLegendIds?: number[];
  onAnalysisSelect?: (analysisId: number | string) => void;
  onFailedAnalysisClick?: (analysisId?: number | string) => void;
  maxVisibleItems?: number;
  preventDeselection?: boolean;
  legendVariant?: 'default' | 'svg';
  legendWidth?: number;
  legendMarginLeft?: number;
  containerProps?: Omit<
    ComponentProps<typeof ChartContainer>,
    'config' | 'className' | 'children'
  >;
  error?: string | null;
  loadingMessage?: ReactNode;
  noDataMessage?: string;
  onGridHeightChange?: (height: number) => void;
  forecastLineStyle?: 'dashed' | 'solid';
  disableHistoricalAnimation?: boolean;
  /** Clear all hidden series (legend “show all”). */
  onShowAll?: () => void;
  /** Isolate a single series by data key; `allDataKeys` lists every toggleable key. */
  onShowOnly?: (dataKey: string, allDataKeys: string[]) => void;
}

/**
 * Simple loading component without hooks for better performance
 * Rendered when chart is waiting in render queue
 */
const BaseChartWrapperLoading = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    height?: number;
    loadingMessage?: ReactNode;
  }
>(({ className, height, loadingMessage }, ref) => {
  return (
    <div ref={ref} className={cn(S.root, className)}>
      <div
        className={S.chartLoadingContainer}
        style={height ? { height: `${height}px` } : undefined}
      >
        {loadingMessage || (
          <div className={S.loadingOverlay}>
            <Skeleton style={{ width: '100%', height: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
});
BaseChartWrapperLoading.displayName = 'BaseChartWrapperLoading';

/**
 * Chart content component with all hooks and logic
 * Separated to maintain hook order consistency
 */
const BaseChartWrapperContent = forwardRef<
  HTMLDivElement,
  BaseChartWrapperProps
>((props, ref) => {
  const {
    chartConfig = {},
    chartData,
    historicalLineColor,
    forecastData = [],
    loading,
    hasCombinedData,
    renderId,
    isDarkTheme,
    height,
    className,
    loadingComponentClassName,
    footerClassName,
    chartClassName,
    xAxisClassName,
    yAxisClassName,
    legendClassName,
    footerActions,
    quantileBands,
    quantileBandKey,
    xMin,
    xMax,
    yMin,
    yMax,
    autoScaleYAxis = true,
    formatNumber,
    formatDate: formatDateFn = formatDate,
    labelFormatter,
    onLegendClick,
    margin,
    chartType = 'composed',
    disableAnimation = false,
    disableLineDrawAnimation = false,
    showGrid = true,
    showAxes = true,
    showTooltip = true,
    showLegend = true,
    showChartAxesLegend = true,
    xAxisLabel,
    yAxisLabel,
    showActiveDots = true,
    overlayElements,
    hiddenSeries,
    includeHiddenInYScale = false,
    excludeLegendIds,
    onAnalysisSelect,
    onFailedAnalysisClick,
    containerProps,
    error,
    loadingMessage,
    noDataMessage = 'No data available',
    onGridHeightChange,
    forecastLineStyle = 'dashed',
    disableHistoricalAnimation = false,
    onShowAll: _onShowAll,
    onShowOnly: _onShowOnly,
    maxVisibleItems,
    preventDeselection,
    legendVariant = 'default',
    legendWidth = 1000,
    legendMarginLeft = 0,
  } = props;

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lineDataInitializedRef = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const resolvedChartMargin = useMemo(
    () => resolveChartMargin(margin),
    [margin?.top, margin?.right, margin?.bottom, margin?.left],
  );

  const TOOLTIP_EDGE_MARGIN = 8;
  const TOOLTIP_OFFSET = 10;

  const tooltipWrapperRef = useRef<HTMLElement | null>(null);
  const rawTooltipCoordinateRef = useRef<{ x: number; y: number } | null>(null);
  const tooltipSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const tooltipResizeObserverRef = useRef<ResizeObserver | null>(null);
  const tooltipResizeObservedTargetRef = useRef<Element | null>(null);

  const applyTooltipPosition = () => {
    const wrapper = tooltipWrapperRef.current;
    const coord = rawTooltipCoordinateRef.current;
    const chartWrapper = rootRef.current?.querySelector('.recharts-wrapper');

    if (!wrapper || !coord || !(chartWrapper instanceof HTMLElement)) return;

    const measured = wrapper.getBoundingClientRect();
    const width = tooltipSizeRef.current.width || measured.width;
    const height = tooltipSizeRef.current.height || measured.height;

    if (width <= 0 || height <= 0) return;

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
    const connectResizeObserver = (wrapperEl: Element) => {
      if (tooltipResizeObservedTargetRef.current === wrapperEl) {
        return;
      }
      const resizeRo =
        tooltipResizeObserverRef.current ??
        new ResizeObserver(entries => {
          const entry = entries[0];
          if (!entry) return;
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
      const wrapper = rootRef.current?.querySelector(
        '.recharts-tooltip-wrapper',
      );
      if (wrapper) connectResizeObserver(wrapper);
    };

    tryObserveTooltipWrapper();

    const observer = new MutationObserver(mutations => {
      tryObserveTooltipWrapper();

      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style' &&
          mutation.target === tooltipWrapperRef.current
        ) {
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

  const renderTooltipContent = (props: any) => {
    // Filter payload to exclude items with null/undefined values
    // This prevents showing stale data when hovering on dates without data points
    const filteredPayload = props.payload?.filter(
      (item: any) =>
        item.value !== null && item.value !== undefined && item.type !== 'none',
    );

    // If no valid payload items, render ChartTooltipContent with active=false and empty payload
    // This allows ChartTooltipContent to clear its lastTooltipData state
    if (!filteredPayload || filteredPayload.length === 0) {
      return (
        <ChartTooltipContent
          active={false}
          payload={[]}
          label={props.label}
          labelFormatter={labelFormatter || defaultLabelFormatter}
          indicator="dot"
        />
      );
    }

    const isActive = props.active === true;

    if (isActive && props.coordinate) {
      rawTooltipCoordinateRef.current = {
        x: props.coordinate.x,
        y: props.coordinate.y,
      };
      requestAnimationFrame(() => applyTooltipPositionRef.current());
    } else {
      rawTooltipCoordinateRef.current = null;
    }

    return (
      <ChartTooltipContent
        active={props.active}
        payload={filteredPayload}
        label={props.label}
        labelFormatter={labelFormatter || defaultLabelFormatter}
        indicator="dot"
      />
    );
  };

  // Extract only line data (historical and forecast_* properties) for animation trigger
  // This prevents re-animation when only quantile band data changes
  // Use a stable reference based on actual line data values, not chartData reference
  const lineDataKey = useMemo(() => {
    const lineData = chartData.map(point => {
      const linePoint: Record<string, unknown> = { date: point.date };
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
      const linePoint: Record<string, unknown> = { date: point.date };
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
    if (!showLegend) return [];

    return forecastData
      .filter((item: ForecastItemData) =>
        excludeLegendIds ? !excludeLegendIds.includes(item.id) : true,
      )
      .map((item: ForecastItemData, index: number) => ({
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
    if (disableAnimation) {
      setShouldAnimate(false);
      return;
    }
    if (disableLineDrawAnimation && !lineDataInitializedRef.current) {
      lineDataInitializedRef.current = true;
      setShouldAnimate(false);
      return;
    }
    // Enable animation briefly when line data changes (not quantile band data)
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [lineDataForAnimation, disableAnimation, disableLineDrawAnimation]);

  const isLoaded = useMemo(
    () => !loading && chartData.length > 0,
    [loading, chartData.length],
  );

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
    return (
      <div className={cn(S.root, className)}>
        <div className={S.errorContainer}>
          <div className={S.errorMessage}>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (loadingMessage !== undefined) {
    return (
      <div className={cn(S.root, className)}>
        <div className={S.chartLoadingContainer}>{loadingMessage}</div>
      </div>
    );
  }

  if (!chartData.length) {
    // If hasCombinedData is true but chartData is empty, data is being processed - wait instead of showing "No data"
    if (hasCombinedData) {
      // Return empty div to wait for chartData to be populated
      return <div className={cn(S.root, className)}></div>;
    }
    // If renderId is undefined/null, we're still initializing - wait instead of showing "No data"
    if (!renderId) {
      // Return empty div to wait for initialization to complete
      return <div className={cn(S.root, className)}></div>;
    }
    return (
      <div className={cn(S.root, className)}>
        <div className={S.errorContainer}>{noDataMessage}</div>
      </div>
    );
  }

  // Smart auto-scaling: detect when explicit bounds are too wide
  // Only apply smart auto-scaling if autoScaleYAxis is not explicitly set to false
  // When autoScaleYAxis is explicitly false, respect it (e.g., for IntervalsOverlay quantile dragging)
  let effectiveAutoScale = autoScaleYAxis;
  if (autoScaleYAxis !== false && yMin !== undefined && yMax !== undefined) {
    const dataKeys = chartData.length > 0 ? Object.keys(chartData[0]) : [];
    const historicalValues =
      !includeHiddenInYScale && hiddenSeries?.has('historical')
        ? []
        : chartData
            .map(p => p.historical)
            .filter(v => v !== null && v !== undefined);
    const forecastKeys = dataKeys.filter(k => k.startsWith('forecast_'));
    const visibleForecastKeys =
      !includeHiddenInYScale && hiddenSeries
        ? forecastKeys.filter(k => !hiddenSeries.has(k))
        : forecastKeys;
    const forecastValues = chartData
      .flatMap(p => visibleForecastKeys.map(k => p[k]))
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
  const defaultLabelFormatter = (v: unknown) => formatDateFn(v as string, true);

  return (
    <div
      className={cn(
        S.root,
        !showLegend && S.noLegend,
        !showChartAxesLegend && S.hideChartAxesLegend,
        disableLineDrawAnimation && S.noLineDrawAnimation,
        isLoaded && S.loaded,
        className,
      )}
      ref={setRefs}
    >
      {loading && (
        <div className={S.loadingOverlay}>
          <Skeleton />
        </div>
      )}

      {/* Background grid layer - rendered first in DOM */}
      {showGrid && (
        <ChartContainer
          config={chartConfig}
          className={cn(S.gridLayer, chartClassName)}
          style={height ? { height: `${height}px` } : undefined}
        >
          <ChartComponent data={chartData} margin={margin}>
            <ChartGrid />
            {showAxes && (
              <ChartAxes
                formatDate={formatDateFn}
                formatNumber={formatNumber}
                xAxisClassName={xAxisClassName}
                yAxisClassName={yAxisClassName}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                xMin={xMin}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
                autoScaleYAxis={effectiveAutoScale}
              />
            )}
          </ChartComponent>
        </ChartContainer>
      )}

      {/* Main chart layer - rendered last, appears on top */}
      <ChartContainer
        config={chartConfig}
        className={cn(S.chartLayer, chartClassName)}
        style={height ? { height: `${height}px` } : undefined}
        {...containerProps}
      >
        <ChartComponent data={chartData} margin={margin}>
          {/* Render invisible axes for coordinate system, but hide labels */}
          {showAxes && (
            <ChartAxes
              formatDate={formatDateFn}
              formatNumber={formatNumber}
              xAxisClassName={cn(xAxisClassName)}
              yAxisClassName={cn(yAxisClassName)}
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
              xMin={xMin}
              xMax={xMax}
              yMin={yMin}
              yMax={yMax}
              autoScaleYAxis={effectiveAutoScale}
            />
          )}

          {/* Quantile Bands (widest to narrowest) */}
          {quantileBands?.[0] && (
            <QuantileBands
              hiddenBands={hiddenSeries}
              quantileBandKey={quantileBandKey}
              animate
              animationDuration={150}
              animationBegin={0}
              customBands={quantileBands}
              showLegend={showLegend}
            />
          )}

          <ChartLines
            historicalLineColor={historicalLineColor}
            chartData={chartData}
            forecastData={forecastData}
            hiddenSeries={hiddenSeries}
            isDarkTheme={isDarkTheme}
            shouldAnimate={shouldAnimate}
            disableAnimation={disableAnimation}
            disableHistoricalAnimation={disableHistoricalAnimation}
            showLegend={showLegend}
            forecastLineStyle={forecastLineStyle}
          />

          {showTooltip && (
            <div>
              <ChartTooltip
                cursor={false}
                offset={TOOLTIP_OFFSET}
                allowEscapeViewBox={{ x: false, y: false }}
                content={renderTooltipContent}
              />
            </div>
          )}
        </ChartComponent>
      </ChartContainer>

      {overlayElements}

      <div className={cn(S.footer, footerClassName)}>
        {showLegend &&
          (legendVariant === 'svg' ? (
            <LegendSvg
              payload={legendPayload.map(p => ({
                value: p.value,
                color: p.color,
                dataKey: p.dataKey,
              }))}
              width={legendWidth}
              marginLeft={legendMarginLeft}
            />
          ) : (
            <CustomChartLegend
              className={legendClassName}
              payload={legendPayload}
              onClick={onLegendClick}
              hiddenSeries={hiddenSeries}
              onAnalysisSelect={onAnalysisSelect}
              onFailedAnalysisClick={onFailedAnalysisClick}
              maxVisibleItems={maxVisibleItems}
              preventDeselection={preventDeselection}
            />
          ))}

        {footerActions}
      </div>

      {/* render active dots over the overlay elements */}
      {/* {showActiveDots && (
        <ActiveDotsLayer data={activeDotsData} isDarkTheme={isDarkTheme} />
      )} */}
    </div>
  );
});
BaseChartWrapperContent.displayName = 'BaseChartWrapperContent';

/**
 * Base chart wrapper component with common structure
 * Handles container, grid, axes, tooltip, and legend
 */
export function BaseChartWrapper(props: BaseChartWrapperProps) {
  const { renderId, chartData, loading, hasCombinedData, legendVariant } =
    props;
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

    let observer: IntersectionObserver | null = null;

    // Wait for DOM to be ready before checking visibility
    const checkAndRegister = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Check if element is already visible
      const rect = container.getBoundingClientRect();
      const isVisible =
        rect.width > 0 &&
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
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            // Element is visible, register callback
            chartRenderQueue.registerCallback(() => {
              setIsReadyToRender(true);
            });
            observer?.disconnect();
          }
        },
        {
          threshold: 0.01, // Trigger when at least 1% of the element is visible
        },
      );

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
    return (
      <BaseChartWrapperLoading
        ref={containerRef}
        className={cn(props.className, props.loadingComponentClassName)}
        height={props.height}
        loadingMessage={props.loadingMessage}
      />
    );
  }

  // If not ready to render, show loading component (no hooks initialized)
  if (!isReadyToRender) {
    return (
      <BaseChartWrapperLoading
        ref={containerRef}
        className={cn(props.className, props.loadingComponentClassName)}
        height={props.height}
        loadingMessage={props.loadingMessage}
      />
    );
  }

  // Render chart content with all hooks
  return <BaseChartWrapperContent ref={containerRef} {...props} />;
}
