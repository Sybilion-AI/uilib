import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChartEmptyState } from '#uilib/components/ui/Chart/components/ChartEmptyState/ChartEmptyState';
import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  type ForecastItemData,
  getForecastColor,
} from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { PageXScroll } from '#uilib/components/ui/Page';
import {
  Table,
  TableBody,
  TableCell,
  TableCellValue,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';
import { TextShimmer } from '#uilib/components/ui/TextShimmer/TextShimmer';
import { TIME_RANGES } from '#uilib/components/ui/TimeRangeControls/TimeRangeControls.constants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import type { BacktestsComponentPayload } from '@sybilion/platform-sdk';
import { InfoIcon } from 'lucide-react';

import S from './DriversComparisonChart.styl';
import {
  DRIVER_FORECAST_ID_BASE,
  type DriversComparisonViewTab,
  INITIAL_VISIBLE_SERIES_COUNT,
  applyDriversComparisonViewToPayload,
  buildDriversComparisonChartData,
  computeDriversComparisonHistoricalWindowFloor,
  formatSeriesImportance,
  getLagDisplayForView,
  mergeBacktestsChartData,
  mergeDatasetHistoricalWithBacktestsChartData,
  resolveDriverLagLabel,
} from './driversComparisonChart.helpers';

const ALL_TIME_RANGE = TIME_RANGES[TIME_RANGES.length - 1];

function toForecastDataKey(id: number | string): string {
  const s = String(id);
  return s.startsWith('forecast_') ? s : `forecast_${id}`;
}

export type DriversComparisonChartProps = {
  payload: BacktestsComponentPayload | null;
  datasetHistorical?: ChartDataPoint[];
  loading?: boolean;
  chartLoading?: boolean;
  statusHint?: string | null;
  statusTone?: 'destructive' | 'muted';
  runAnalysisHint?: boolean;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  isDarkTheme?: boolean;
  className?: string;
  /** Resets visible series when this key changes (e.g. selected analysis id). */
  seriesInitKey?: string;
  viewTab?: DriversComparisonViewTab;
  onViewTabChange?: (tab: DriversComparisonViewTab) => void;
  hiddenSeries?: Set<string>;
  onHiddenSeriesChange?: (
    update: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
};

export type { DriversComparisonViewTab } from './driversComparisonChart.helpers';

export function DriversComparisonChart({
  payload,
  datasetHistorical = [],
  loading = false,
  chartLoading = false,
  statusHint = null,
  statusTone = 'muted',
  runAnalysisHint = false,
  timeRange: timeRangeProp,
  onTimeRangeChange,
  isDarkTheme = false,
  className,
  seriesInitKey,
  viewTab: viewTabProp,
  onViewTabChange,
  hiddenSeries: hiddenSeriesProp,
  onHiddenSeriesChange,
}: DriversComparisonChartProps) {
  const [internalTimeRange, setInternalTimeRange] =
    useState<string>(ALL_TIME_RANGE);
  const [internalViewTab, setInternalViewTab] =
    useState<DriversComparisonViewTab>('overlapped');
  const [internalHiddenSeries, setInternalHiddenSeries] = useState<Set<string>>(
    new Set(),
  );

  const viewTab = viewTabProp ?? internalViewTab;
  const hiddenSeriesControlled = hiddenSeriesProp !== undefined;
  const hiddenSeries = hiddenSeriesProp ?? internalHiddenSeries;

  const setHiddenSeries = useCallback(
    (update: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      if (onHiddenSeriesChange) {
        onHiddenSeriesChange(update);
        return;
      }
      setInternalHiddenSeries(update);
    },
    [onHiddenSeriesChange],
  );

  const timeRange = timeRangeProp ?? internalTimeRange;
  const handleTimeRangeChange = useCallback(
    (val: string) => {
      if (!val) return;
      onTimeRangeChange?.(val);
      if (timeRangeProp === undefined) {
        setInternalTimeRange(val);
      }
    },
    [onTimeRangeChange, timeRangeProp],
  );

  const toggleSeries = useCallback(
    (id: number | string) => {
      const key = toForecastDataKey(id);
      setHiddenSeries(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [setHiddenSeries],
  );

  const showSeries = useCallback(
    (id: number | string) => {
      const key = toForecastDataKey(id);
      setHiddenSeries(prev => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [setHiddenSeries],
  );

  const payloadForView = useMemo(
    () => applyDriversComparisonViewToPayload(payload, viewTab),
    [payload, viewTab],
  );

  const sortedDriversWithData = useMemo(() => {
    const driversList = payloadForView?.drivers ?? [];
    if (!driversList.length) return [];
    return [...driversList]
      .filter(
        d =>
          d.normalized_series &&
          Object.keys(d.normalized_series).some(
            key => d.normalized_series![key] != null,
          ),
      )
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }, [payloadForView?.drivers]);

  const mergedChartData = useMemo(
    () => mergeBacktestsChartData(payloadForView),
    [payloadForView],
  );

  const mergedWithHistorical = useMemo(
    () =>
      mergeDatasetHistoricalWithBacktestsChartData(
        datasetHistorical,
        mergedChartData,
      ),
    [datasetHistorical, mergedChartData],
  );

  const historicalWindowFloor = useMemo(() => {
    const laggedMerged = mergeBacktestsChartData(payload);
    const merged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      laggedMerged,
    );
    const sortedDrivers = [...(payload?.drivers ?? [])]
      .filter(
        d =>
          d.normalized_series &&
          Object.keys(d.normalized_series).some(
            key => d.normalized_series![key] != null,
          ),
      )
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const forecastIds = sortedDrivers.map(
      (_, idx) => DRIVER_FORECAST_ID_BASE + idx,
    );
    return computeDriversComparisonHistoricalWindowFloor(merged, forecastIds);
  }, [payload, datasetHistorical]);

  const chartForecastData = useMemo((): ForecastItemData[] => {
    if (!payloadForView?.target?.normalized_series) return [];
    return sortedDriversWithData.map((driver, idx) => ({
      id: DRIVER_FORECAST_ID_BASE + idx,
      name: driver.name || String(driver.id),
      color: getForecastColor(idx + 1),
    }));
  }, [payloadForView?.target?.normalized_series, sortedDriversWithData]);

  const originalDriversById = useMemo(() => {
    const map = new Map<string, (typeof sortedDriversWithData)[number]>();
    for (const driver of payload?.drivers ?? []) {
      map.set(String(driver.id), driver);
    }
    return map;
  }, [payload?.drivers]);

  const tableSeriesRows = useMemo(() => {
    if (sortedDriversWithData.length === 0) return [];
    return sortedDriversWithData
      .map((driver, idx) => {
        const raw = driver.importance;
        const importance =
          typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
        const lagSource = originalDriversById.get(String(driver.id)) ?? driver;
        return {
          id: DRIVER_FORECAST_ID_BASE + idx,
          name: driver.name || String(driver.id),
          color: getForecastColor(idx + 1),
          importance,
          lag: getLagDisplayForView(resolveDriverLagLabel(lagSource), viewTab),
        };
      })
      .sort((a, b) => b.importance - a.importance);
  }, [originalDriversById, sortedDriversWithData, viewTab]);

  const seriesInitKeyResolved =
    seriesInitKey ?? `${tableSeriesRows.map(r => r.id).join(',') || 'none'}`;

  const backtestsSeriesInitKeyRef = useRef<string>('');

  useEffect(() => {
    if (hiddenSeriesControlled) return;
    if (tableSeriesRows.length === 0) return;
    const initKey = seriesInitKeyResolved;
    if (backtestsSeriesInitKeyRef.current === initKey) return;
    backtestsSeriesInitKeyRef.current = initKey;

    setHiddenSeries(() => {
      const next = new Set<string>();
      tableSeriesRows.forEach((row, idx) => {
        const key = toForecastDataKey(row.id);
        if (idx >= INITIAL_VISIBLE_SERIES_COUNT) {
          next.add(key);
        }
      });
      return next;
    });
  }, [
    hiddenSeriesControlled,
    seriesInitKeyResolved,
    setHiddenSeries,
    tableSeriesRows,
  ]);

  const driversComparisonChartData = useMemo(
    () =>
      buildDriversComparisonChartData(
        mergedWithHistorical,
        datasetHistorical,
        chartForecastData.map(f => f.id),
        historicalWindowFloor,
      ),
    [
      chartForecastData,
      datasetHistorical,
      historicalWindowFloor,
      mergedWithHistorical,
    ],
  );

  const showEmptyOverlay = (runAnalysisHint || Boolean(statusHint)) && !loading;

  return (
    <div className={cn(S.root, className)}>
      <div className={cn(S.chartShell, loading && S.chartShellLoading)}>
        <div className={S.chartSlot}>
          <div className={S.chartWithOverlay}>
            <div
              className={cn(
                S.chartInteractiveLayer,
                showEmptyOverlay && S.chartInteractiveDimmed,
              )}
            >
              <ChartAreaInteractive
                chartRenderId="drivers-comparison"
                disableLineDrawAnimation
                disableHistoricalAnimation
                disableTimeRangeSelector
                enableTimeRangeBrush
                chartContainerClassName={S.chartContainer}
                chartData={driversComparisonChartData}
                forecastData={chartForecastData}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                pinMonth={undefined}
                onPinMonthChange={() => {}}
                isDarkTheme={isDarkTheme}
                loading={chartLoading}
                hasCombinedData={mergedWithHistorical.length > 0}
                forecastLineStyle="solid"
                showLegend={false}
                hiddenSeries={hiddenSeries}
                toggleLegendSeries={toggleSeries}
                ensureAnalysisSeriesVisible={showSeries}
              />
            </div>
            {showEmptyOverlay && (
              <div
                className={S.chartEmptyOverlay}
                role="status"
                aria-live="polite"
              >
                <div className={S.chartEmptyBlurb}>
                  <ChartEmptyState
                    variant="inline"
                    hint={
                      runAnalysisHint
                        ? 'Run a completed analysis to load the drivers comparison chart for an analysis.'
                        : undefined
                    }
                    status={statusHint ?? undefined}
                    statusTone={statusTone}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {loading && (
          <div className={S.loadingLayer} aria-busy="true" aria-live="polite">
            <div className={S.loadingMessage}>
              <TextShimmer as="span" className={S.loadingText}>
                Loading drivers comparison…
              </TextShimmer>
            </div>
          </div>
        )}
      </div>

      <div className={S.seriesSection}>
        {tableSeriesRows.length === 0 ? (
          <div className={S.seriesEmptyWrap}>
            <div className={S.chartEmptyBlurb}>
              <ChartEmptyState
                variant="inline"
                align="center"
                status="No series"
              />
            </div>
          </div>
        ) : (
          <div className={S.seriesTableWrapper}>
            <PageXScroll
              size="md"
              fullWidth
              innerClassName={S.seriesTableContainer}
              scrollbarClassName={S.seriesScrollbar}
            >
              <Table withBackground withPaddings className={S.seriesTable}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={S.seriesColSeries}>
                      Driver name
                    </TableHead>
                    <TableHead>
                      <TableCellValue>
                        Importance
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <InfoIcon size={16} style={{ cursor: 'help' }} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" maxWidth={300}>
                            How much this driver contributes to price movements
                            in the forecast model. Higher = stronger influence.
                            Reflects relative weight of each driver, scored from
                            0% to 100%.
                          </TooltipContent>
                        </Tooltip>
                      </TableCellValue>
                    </TableHead>
                    <TableHead>
                      <TableCellValue>
                        Lag
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <InfoIcon size={16} style={{ cursor: 'help' }} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" maxWidth={300}>
                            Lag shows how far ahead this driver predicts price
                            movement. A range (e.g. 9–12 months) means the
                            predictive signal is strongest somewhere in that
                            window — not at a single fixed point.
                          </TooltipContent>
                        </Tooltip>
                      </TableCellValue>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableSeriesRows.map(row => {
                    const dataKey = toForecastDataKey(row.id);
                    const hidden = hiddenSeries.has(dataKey);
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(hidden && S.rowHidden)}
                        onClick={() => toggleSeries(row.id)}
                      >
                        <TableCell>
                          <span className={S.seriesLabel}>
                            <span
                              className={S.colorSwatch}
                              style={{
                                backgroundColor: row.color,
                              }}
                            />
                            {row.name ?? String(row.id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatSeriesImportance(row.importance)}
                        </TableCell>
                        <TableCell>{row.lag}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </PageXScroll>
          </div>
        )}
      </div>
    </div>
  );
}
