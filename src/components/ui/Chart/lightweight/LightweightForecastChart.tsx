import cn from 'classnames';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ChartContext } from '#uilib/components/ui/Chart/Chart.context';
import type { ChartConfig } from '#uilib/components/ui/Chart/Chart.types';
import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import { ChartStyle } from '#uilib/components/ui/Chart/components/ChartContainer';
import { ChartTooltipContent } from '#uilib/components/ui/Chart/components/ChartTooltipContent';
import { CustomChartLegend } from '#uilib/components/ui/Chart/components/CustomChartLegend/CustomChartLegend';
import { formatDate as formatDateDefault } from '#uilib/components/ui/Chart/tools/formatters';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  ForecastItemData,
  getForecastColor,
  resolveQuantileBandFillForForecastLine,
} from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { Skeleton } from '#uilib/components/ui/Skeleton';
import { ensureChartForecastBridge } from '#uilib/utils/chartConnectionPoint';
import type {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  UTCTimestamp,
} from 'lightweight-charts';
import {
  LineSeries,
  LineStyle,
  LineType,
  createChart,
} from 'lightweight-charts';

import S from './LightweightForecastChart.styl';
import {
  buildForecastLineData,
  buildHistoricalLineData,
  buildLightweightChartOptions,
  buildQuantileBandCustomData,
  findNearestChartRow,
} from './lightweightForecastChart.helpers';
import { QuantileBandPaneView } from './quantileBandCustomSeries';

type TooltipRow = {
  type: string;
  name: string;
  value: number | [number, number];
  payload: unknown;
  color: string;
  dataKey?: string;
};

function forecastIndexForQuantileBand(
  band: QuantileBandConfig,
  forecastData: ForecastItemData[],
): number {
  if (!forecastData.length) return 0;
  if (band.forecastSeriesId != null) {
    const idx = forecastData.findIndex(f => f.id === band.forecastSeriesId);
    if (idx !== -1) return idx;
  }
  return 0;
}

function quantileBandFillForConfig(
  band: QuantileBandConfig,
  forecastData: ForecastItemData[],
): string {
  const fi = forecastIndexForQuantileBand(band, forecastData);
  const lineColor = forecastData[fi]?.color?.toString() ?? getForecastColor(fi);
  return resolveQuantileBandFillForForecastLine(lineColor, fi);
}

function clampTooltipTranslate(args: {
  coordinate: { x: number; y: number };
  viewW: number;
  viewH: number;
  tooltipWidth: number;
  tooltipHeight: number;
  offset: number;
  edgeMargin: number;
}): { x: number; y: number } {
  const {
    coordinate,
    viewW,
    viewH,
    tooltipWidth: tw,
    tooltipHeight: th,
    offset,
    edgeMargin,
  } = args;

  const minX = edgeMargin;
  const maxX = Math.max(edgeMargin, viewW - tw - edgeMargin);
  const minY = edgeMargin;
  const maxY = Math.max(edgeMargin, viewH - th - edgeMargin);

  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), Math.max(lo, hi));

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

function scheduleFitTimeScale(chart: IChartApi): void {
  requestAnimationFrame(() => {
    chart.timeScale().fitContent();
  });
}

type LwModel = {
  chart: IChartApi;
  historical: ISeriesApi<'Line'> | null;
  forecasts: Map<string, ISeriesApi<'Line'>>;
  bands: Map<string, { api: ISeriesApi<'Custom'>; view: QuantileBandPaneView }>;
};

export interface LightweightForecastChartProps {
  chartData: ChartDataPoint[];
  forecastData?: ForecastItemData[];
  quantileBands?: QuantileBandConfig[];
  chartConfig?: ChartConfig;
  historicalLineColor?: string;
  isDarkTheme: boolean;
  height?: number;
  className?: string;
  hiddenSeries?: Set<string>;
  onLegendClick?: (data: unknown, index: number, event: unknown) => void;
  disableForecastHistoricalBridge?: boolean;
  forecastLineStyle?: 'dashed' | 'solid';
  formatDate?: (value: string, detailed?: boolean) => string;
  formatNumber?: (value: number) => string;
  loading?: boolean;
  error?: string | null;
  noDataMessage?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function LightweightForecastChart(props: LightweightForecastChartProps) {
  const {
    chartData,
    forecastData = [],
    quantileBands,
    chartConfig: chartConfigProp = {},
    historicalLineColor: historicalLineColorProp,
    isDarkTheme,
    height,
    className,
    hiddenSeries: hiddenSeriesProp,
    onLegendClick,
    disableForecastHistoricalBridge = false,
    forecastLineStyle = 'dashed',
    formatDate: formatDateFn = formatDateDefault,
    formatNumber,
    loading = false,
    error = null,
    noDataMessage = 'No data available',
    showLegend = true,
    showTooltip = true,
  } = props;

  const chartId = useId().replace(/:/g, '');
  const shellRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<LwModel | null>(null);
  const bridgedRef = useRef<ChartDataPoint[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipSizeRef = useRef({ width: 0, height: 0 });

  const [localHidden, setLocalHidden] = useState(() => new Set<string>());
  const hiddenSeries = hiddenSeriesProp ?? localHidden;
  const hiddenControlled = hiddenSeriesProp !== undefined;

  const pixelHeight = height ?? 280;

  const historicalLineColor =
    historicalLineColorProp ?? (isDarkTheme ? '#ffffff' : '#000000');

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
  const mergedChartConfig: ChartConfig = useMemo(() => {
    const base: ChartConfig = {
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

    quantileBands?.forEach(band => {
      base[band.key] = {
        label: band.name,
        color: quantileBandFillForConfig(band, forecastData),
      };
    });

    return base;
  }, [chartConfigProp, forecastData, historicalLineColor, quantileBands]);

  const legendPayload = useMemo(() => {
    if (!showLegend) return [];
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

  const structureKey = useMemo(
    () =>
      [
        quantileBands?.map(b => b.key).join(',') ?? '',
        forecastData.map(f => f.id).join(','),
      ].join('|'),
    [forecastData, quantileBands],
  );

  const [tooltipState, setTooltipState] = useState<{
    active: boolean;
    x: number;
    y: number;
    label: string;
    payload: TooltipRow[];
  }>({
    active: false,
    x: 0,
    y: 0,
    label: '',
    payload: [],
  });

  const applyTooltipPosition = useCallback(() => {
    const shell = shellRef.current;
    const wrapper = tooltipRef.current;
    if (!shell || !wrapper) return;

    const tw = tooltipSizeRef.current.width || wrapper.offsetWidth;
    const th = tooltipSizeRef.current.height || wrapper.offsetHeight;
    if (tw <= 0 || th <= 0) return;

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
    if (!tooltipState.active) return;
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
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height: h } = entry.contentRect;
      tooltipSizeRef.current = { width, height: h };
      requestAnimationFrame(() => applyTooltipPosition());
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyTooltipPosition]);

  useEffect(() => {
    const onWin = () =>
      requestAnimationFrame(() => {
        applyTooltipPosition();
      });
    window.addEventListener('resize', onWin);
    return () => window.removeEventListener('resize', onWin);
  }, [applyTooltipPosition]);

  // Structural chart lifecycle
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!bridgedChartData.length) {
      modelRef.current?.chart.remove();
      modelRef.current = null;
      return;
    }

    const iw = Math.max(
      1,
      Math.floor(host.clientWidth || host.offsetWidth || 640),
    );
    const ih = Math.max(1, Math.floor(pixelHeight));

    const chart = createChart(host, {
      ...buildLightweightChartOptions({
        isDarkTheme,
        width: iw,
        height: ih,
      }),
    });

    const bands = new Map<
      string,
      { api: ISeriesApi<'Custom'>; view: QuantileBandPaneView }
    >();

    quantileBands?.forEach(band => {
      const fill = quantileBandFillForConfig(band, forecastData);
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

    const forecasts = new Map<string, ISeriesApi<'Line'>>();
    forecastData.forEach((f, index) => {
      const key = `forecast_${f.id}`;
      const color = f.color?.toString() ?? getForecastColor(index);
      const api = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        lineType: LineType.Curved,
        lineStyle:
          forecastLineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid,
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

    const onMove = (param: MouseEventParams) => {
      if (!showTooltip) {
        setTooltipState(s => ({ ...s, active: false, payload: [] }));
        return;
      }

      const rows = bridgedRef.current;
      if (!param.point || param.time === undefined || rows.length === 0) {
        setTooltipState(s => ({ ...s, active: false, payload: [] }));
        return;
      }

      const time = param.time as UTCTimestamp;
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

      const payload: TooltipRow[] = [];

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
        if (hid.has(forecastKey)) return;
        const value = row[forecastKey];
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
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

      bandsCfg?.forEach(band => {
        if (hid.has(band.key)) return;
        const tuple = row[band.key];
        if (
          Array.isArray(tuple) &&
          tuple.length === 2 &&
          typeof tuple[0] === 'number' &&
          typeof tuple[1] === 'number'
        ) {
          const color = quantileBandFillForConfig(band, forecastsList);
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

    let resizeObserver: ResizeObserver | undefined;
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
    if (!model) return;

    model.historical?.setData(buildHistoricalLineData(bridgedChartData));

    for (const [key, api] of model.forecasts.entries()) {
      api.setData(buildForecastLineData(bridgedChartData, key));
    }

    quantileBands?.forEach(band => {
      const entry = model.bands.get(band.key);
      if (!entry) return;
      const fill = quantileBandFillForConfig(band, forecastData);
      entry.view.updateStyle({
        fill,
        stroke: band.strokeWidth ? fill : undefined,
        strokeWidth: band.strokeWidth ?? 0,
        strokeDasharray: band.strokeDasharray,
        strokeOpacity: band.strokeOpacity,
      });
      entry.api.applyOptions({ color: fill });
      entry.api.setData(
        buildQuantileBandCustomData(bridgedChartData, band.key),
      );
    });

    scheduleFitTimeScale(model.chart);
  }, [bridgedChartData, quantileBands, forecastData]);

  // Visibility toggles
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

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
    if (!model?.historical) return;
    model.historical.applyOptions({ color: historicalLineColor });
  }, [historicalLineColor]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    const style =
      forecastLineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid;
    for (const api of model.forecasts.values()) {
      api.applyOptions({ lineStyle: style });
    }
  }, [forecastLineStyle]);

  const handleLegendClick = useCallback(
    (data: unknown, index: number, event: unknown) => {
      const payloadItem = data as { dataKey?: string };
      const key = payloadItem.dataKey;
      if (key) {
        if (!hiddenControlled) {
          setLocalHidden(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }
      }
      onLegendClick?.(data, index, event);
    },
    [hiddenControlled, onLegendClick],
  );

  if (error) {
    return (
      <div className={cn(S.root, className)}>
        <div style={{ color: 'var(--destructive, #f43f5e)' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(S.root, className)}>
        <div style={{ height: pixelHeight }}>
          <Skeleton style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }

  if (!bridgedChartData.length) {
    return (
      <div className={cn(S.root, className)}>
        <div style={{ height: pixelHeight }}>{noDataMessage}</div>
      </div>
    );
  }

  return (
    <ChartContext.Provider value={{ config: mergedChartConfig }}>
      <div className={cn(S.root, className)}>
        <div
          data-slot="chart"
          data-chart={`chart-${chartId}`}
          className={S.shell}
          ref={shellRef}
          style={{ position: 'relative', width: '100%' }}
        >
          <ChartStyle id={`chart-${chartId}`} config={mergedChartConfig} />
          <div
            ref={hostRef}
            className={S.host}
            style={{ width: '100%', height: pixelHeight }}
          />

          {showTooltip ? (
            <div
              ref={tooltipRef}
              className={S.tooltipMove}
              style={{
                opacity:
                  tooltipState.active && tooltipState.payload.length ? 1 : 0,
              }}
            >
              <ChartTooltipContent
                active={tooltipState.active && tooltipState.payload.length > 0}
                label={tooltipState.label}
                payload={
                  tooltipState.active && tooltipState.payload.length
                    ? (tooltipState.payload as never)
                    : ([] as never)
                }
                labelFormatter={lbl =>
                  formatDateFn(
                    typeof lbl === 'string' ? lbl : String(lbl),
                    true,
                  )
                }
                formatter={
                  formatNumber
                    ? (value, name) => {
                        const v =
                          typeof value === 'number'
                            ? formatNumber(value)
                            : Array.isArray(value)
                              ? `${formatNumber(value[0])} – ${formatNumber(value[1])}`
                              : String(value ?? '');
                        return (
                          <>
                            <span>{name}: </span>
                            <span>{v}</span>
                          </>
                        );
                      }
                    : undefined
                }
              />
            </div>
          ) : null}
        </div>

        {showLegend ? (
          <div className={S.footer}>
            <CustomChartLegend
              payload={legendPayload}
              hiddenSeries={hiddenSeries}
              onClick={handleLegendClick}
            />
          </div>
        ) : null}
      </div>
    </ChartContext.Provider>
  );
}
