import cn from 'classnames';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ChartEmptyState } from '#uilib/components/ui/Chart/components/ChartEmptyState/ChartEmptyState';
import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import { filterDataForTimeRange } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.helpers';
import type { OverlayMode } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  FORECAST_LINE_COLORS,
  type ForecastItemData,
} from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { TextShimmer } from '#uilib/components/ui/TextShimmer/TextShimmer';
import {
  TIME_RANGES,
  type TimeRange,
} from '#uilib/components/ui/TimeRangeControls';
import type { ForecastData } from '#uilib/types/forecast-data';
import { normalizeToMonthStart } from '#uilib/utils/chartConnectionPoint';

import { HorizonsSelector } from './HorizonsSelector/HorizonsSelector';
import { MONTHS_24, MONTH_NAMES } from './PerformanceChart.constants';
import S from './PerformanceChart.styl';
import { PerformanceTable } from './PerformanceTable';
import type { AdjustParameters } from './PerformanceTable';
import { PerformanceUnderChartLegendFromItems } from './PerformanceUnderChartLegend/PerformanceUnderChartLegend';
import {
  SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE,
  SPAGHETTI_MODEL_PER_HORIZON_ID_BASE,
  averageForecastErrorsVsHistoricalForMatrixColumn,
  buildPerHorizonSpaghettiEntries,
  buildSpaghettiMergedChartData,
  calculateYRangeFromChartData,
  filterSpaghettiDataFromEarliestForecastStart,
  getForecastModelDisplayName,
  isSpaghettiDriftPerHorizonLineId,
  isSpaghettiModelPerHorizonLineId,
  mergeHistoricalIntoSpaghettiChartData,
  mergeSpaghettiMergedBases,
  mergeSpaghettiUserSeriesFromForecastData,
} from './performanceChart.helpers';
import {
  SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID,
  type SpaghettiPerformanceMatrixPayload,
  getCustomMatrixSeriesForHorizonTab,
  isSpaghettiMatrixSyntheticLineId,
} from './performanceChartUserSeries';

type PerformanceUnderChartLegendItemConfig = Parameters<
  typeof PerformanceUnderChartLegendFromItems
>[0]['items'][number];

export type PerformanceViewTab = 'perHorizon' | 'spaghetti';

export type PerformanceChartPayload = Record<
  string,
  {
    forecasts?: Record<string, Record<string, number>>;
    metrics_history?: Record<
      string,
      { mae?: Record<string, number>; mape?: Record<string, number> }
    >;
  }
>;

const SPAGHETTI_DRIFT_LINE_COLOR = FORECAST_LINE_COLORS[0];
const SPAGHETTI_MODEL_LINE_COLOR = 'var(--sb-cyan-400)';
const SPAGHETTI_CUSTOM_PERFORMANCE_LINE_COLOR = 'var(--sb-purple-400)';

function reorderSpaghettiMatrixToHorizons(
  m: SpaghettiPerformanceMatrixPayload,
  targetKeys: string[],
): SpaghettiPerformanceMatrixPayload {
  if (m.horizonKeys.length !== targetKeys.length) return m;
  const idxMap = targetKeys.map(tk => m.horizonKeys.indexOf(tk));
  if (idxMap.some(j => j < 0)) return m;
  const perHorizonDates =
    m.perHorizonDates &&
    m.perHorizonDates.length === m.grid.length &&
    m.perHorizonDates.every(
      (row, r) =>
        row.length === m.horizonKeys.length && row.length === m.grid[r].length,
    )
      ? m.perHorizonDates.map(row => idxMap.map(j => row[j]))
      : m.perHorizonDates;
  return {
    ...m,
    horizonKeys: [...targetKeys],
    grid: m.grid.map(row => idxMap.map(j => row[j])),
    perHorizonDates,
  };
}

function spaghettiForecastLineColor(id: number, index: number): string {
  if (isSpaghettiDriftPerHorizonLineId(id)) return SPAGHETTI_DRIFT_LINE_COLOR;
  if (isSpaghettiModelPerHorizonLineId(id)) return SPAGHETTI_MODEL_LINE_COLOR;
  if (isSpaghettiMatrixSyntheticLineId(id))
    return SPAGHETTI_CUSTOM_PERFORMANCE_LINE_COLOR;
  return FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length];
}

export type PerformanceChartProps = {
  performanceData: PerformanceChartPayload | null;
  historicalData?: ChartDataPoint[];
  combinedData?: ChartDataPoint[];
  forecastData?: Record<string, ForecastData>;
  userSeries?: { id: number; name?: string }[];
  spaghettiUserSeries?: { id: number; name?: string }[];
  customPerformanceMatrix?: SpaghettiPerformanceMatrixPayload | null;
  customPerformanceLabel?: string | null;

  loading?: boolean;
  chartLoading?: boolean;
  performanceSectionPending?: boolean;
  isEmpty?: boolean;
  perfFetchSettled?: boolean;
  performanceDataLoading?: boolean;
  performanceAnalysisId?: number | null;

  statusHint?: string | null;
  statusTone?: 'destructive' | 'muted';
  runAnalysisHint?: boolean;

  timeRange?: string;
  onTimeRangeChange?: (
    range: string,
    meta?: { viewTab: PerformanceViewTab },
  ) => void;

  isDarkTheme?: boolean;
  className?: string;
  seriesInitKey?: string;

  toolbarStart?: ReactNode;

  onEditCustomPerformance?: () => void;
  showAddEditCustomDataButton?: boolean;
  addEditCustomDataDisabled?: boolean;

  hiddenSeries?: Set<string>;
  onToggleLegendSeries?: (key: string) => void;
  onEnsureSeriesVisible?: (key: string) => void;
  onHiddenSeriesChange?: (
    update: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
};

export function PerformanceChart({
  performanceData,
  historicalData = [],
  combinedData = [],
  forecastData = {},
  userSeries = [],
  spaghettiUserSeries = [],
  customPerformanceMatrix = null,
  customPerformanceLabel = null,

  loading = false,
  chartLoading = false,
  performanceSectionPending = false,
  isEmpty = false,
  perfFetchSettled = true,
  performanceDataLoading = false,
  performanceAnalysisId = null,

  statusHint = null,
  statusTone = 'muted',
  runAnalysisHint = false,

  timeRange: timeRangeProp,
  onTimeRangeChange,

  isDarkTheme = false,
  className,
  seriesInitKey,

  toolbarStart,

  onEditCustomPerformance,
  showAddEditCustomDataButton = false,
  addEditCustomDataDisabled = false,

  hiddenSeries: hiddenSeriesProp,
  onToggleLegendSeries,
  onEnsureSeriesVisible,
  onHiddenSeriesChange,
}: PerformanceChartProps) {
  const [viewTab, setViewTab] = useState<PerformanceViewTab>('perHorizon');
  const [pinMonth, setPinMonth] = useState<string | undefined>(undefined);
  const [spaghettiTimeRange, setSpaghettiTimeRange] = useState<string>('All');
  const [perHorizonChartTimeRange, setPerHorizonChartTimeRange] =
    useState<string>('All');
  const [internalHiddenSeries, setInternalHiddenSeries] = useState<Set<string>>(
    new Set(),
  );

  const [adjustParameters, setAdjustParameters] = useState<AdjustParameters>({
    procurementVolume: 100000000,
    variableRawMaterialCostShare: 50,
    controllableCosts: 60,
    currentForecastAccuracy: 70,
    expectedImprovement: 10,
    analystHourlyRate: 80,
  });

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

  const toggleLegendSeriesKey = useCallback(
    (key: string) => {
      if (onToggleLegendSeries) {
        onToggleLegendSeries(key);
        return;
      }
      setHiddenSeries(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [onToggleLegendSeries, setHiddenSeries],
  );

  const ensureSeriesVisible = useCallback(
    (key: string) => {
      if (onEnsureSeriesVisible) {
        onEnsureSeriesVisible(key);
        return;
      }
      setHiddenSeries(prev => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [onEnsureSeriesVisible, setHiddenSeries],
  );

  const userSeriesForSpaghetti = useMemo(
    () => [...userSeries, ...spaghettiUserSeries],
    [userSeries, spaghettiUserSeries],
  );

  const availableHorizons = useMemo(() => {
    if (!performanceData) return [];
    const driftModelData = performanceData['drift'];
    if (!driftModelData) return [];
    const forecasts = driftModelData?.forecasts;
    if (forecasts && typeof forecasts === 'object') {
      return Object.keys(forecasts).filter(key => key.startsWith('horizon_'));
    }
    return [];
  }, [performanceData]);

  const sortedHorizonKeysForCustom = useMemo(
    () =>
      [...availableHorizons].sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return na - nb;
      }),
    [availableHorizons],
  );

  const parsedCustomMatrixForCharts = useMemo(() => {
    if (!customPerformanceMatrix) return null;
    return {
      matrix: reorderSpaghettiMatrixToHorizons(
        customPerformanceMatrix,
        sortedHorizonKeysForCustom,
      ),
      displayLabel: customPerformanceLabel?.trim() || 'Custom performance',
    };
  }, [
    customPerformanceMatrix,
    customPerformanceLabel,
    sortedHorizonKeysForCustom,
  ]);

  const [selectedHorizon, setSelectedHorizon] = useState<string>(
    availableHorizons[0] || 'horizon_1',
  );

  useEffect(() => {
    if (
      availableHorizons.length > 0 &&
      !availableHorizons.includes(selectedHorizon)
    ) {
      setSelectedHorizon(availableHorizons[0]);
    }
  }, [availableHorizons, selectedHorizon]);

  const getTimeRangeForForecastLength = useCallback(
    (mode: OverlayMode): TimeRange => {
      if (mode === 'pin') return '5y';
      if (
        performanceAnalysisId == null ||
        !forecastData[String(performanceAnalysisId)]
      ) {
        return TIME_RANGES[0];
      }
      const forecastDataForSelected =
        forecastData[String(performanceAnalysisId)];
      const dates = forecastDataForSelected.dates;
      if (!dates || dates.length === 0) return TIME_RANGES[0];
      const firstDate = new Date(dates[0]);
      const lastDate = new Date(dates[dates.length - 1]);
      const monthsDiff =
        (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (lastDate.getMonth() - firstDate.getMonth()) +
        1;
      if (monthsDiff < 6) return '6m';
      if (monthsDiff < 12) return '1y';
      if (monthsDiff < 36) return '3y';
      if (monthsDiff < 60) return '5y';
      return 'All';
    },
    [performanceAnalysisId, forecastData],
  );

  const forecastModelsData = useMemo(() => {
    if (!performanceData || !selectedHorizon) return [];
    const models: { key: string; mae: number; mape: number }[] = [];
    ['model', 'drift'].forEach(key => {
      const modelData = performanceData[key];
      const horizonMetrics = modelData?.metrics_history?.[selectedHorizon];
      if (horizonMetrics?.mae && horizonMetrics?.mape) {
        const maeValues = Object.values(horizonMetrics.mae) as number[];
        const mapeValues = Object.values(horizonMetrics.mape) as number[];
        models.push({
          key,
          mae: maeValues.reduce((sum, val) => sum + val, 0) / maeValues.length,
          mape:
            mapeValues.reduce((sum, val) => sum + val, 0) / mapeValues.length,
        });
      }
    });
    return models;
  }, [performanceData, selectedHorizon]);

  const historicalChartData = useMemo(
    () => historicalData.map(point => ({ ...point })),
    [historicalData],
  );

  const chartForecastData = useMemo((): ForecastItemData[] => {
    const forecastItems: ForecastItemData[] = [];
    if (performanceData) {
      ['model', 'drift'].forEach((key, index) => {
        const modelData = performanceData[key];
        const horizonData = modelData?.forecasts?.[selectedHorizon];
        if (horizonData) {
          forecastItems.push({
            id: index + 1000,
            name: getForecastModelDisplayName(key),
            color:
              key === 'model' ? 'var(--sb-cyan-400)' : FORECAST_LINE_COLORS[0],
          });
        }
      });
    }
    if (parsedCustomMatrixForCharts) {
      const slice = getCustomMatrixSeriesForHorizonTab(
        parsedCustomMatrixForCharts.matrix,
        selectedHorizon,
        SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID,
        forecastData,
      );
      if (slice) {
        forecastItems.push({
          id: slice.lineId,
          name: parsedCustomMatrixForCharts.displayLabel,
          color: SPAGHETTI_CUSTOM_PERFORMANCE_LINE_COLOR,
        });
      }
    }
    return forecastItems;
  }, [
    performanceData,
    selectedHorizon,
    parsedCustomMatrixForCharts,
    forecastData,
  ]);

  const forecastChartData = useMemo(() => {
    const chartDataMap = new Map<string, ChartDataPoint>();
    const modelKeys = ['model', 'drift'];
    const normalizeDate = (dateStr: string): string => dateStr.split(' ')[0];
    const latestHistoricalDate =
      historicalChartData.length > 0
        ? historicalChartData[historicalChartData.length - 1].date
        : null;

    historicalChartData.forEach(point => {
      chartDataMap.set(point.date, { ...point });
    });

    if (performanceData) {
      modelKeys.forEach(key => {
        const index = modelKeys.indexOf(key);
        const modelData = performanceData[key];
        const horizonData = modelData?.forecasts?.[selectedHorizon];
        const dataKey = `forecast_${index + 1000}`;
        if (horizonData) {
          Object.entries(horizonData).forEach(([date, value]) => {
            if (value !== null && value !== undefined) {
              const normalizedDate = normalizeDate(String(date));
              if (
                latestHistoricalDate &&
                normalizedDate > latestHistoricalDate
              ) {
                return;
              }
              const existingPoint = chartDataMap.get(normalizedDate);
              if (existingPoint) {
                chartDataMap.set(normalizedDate, {
                  ...existingPoint,
                  [dataKey]: value as number,
                });
              } else {
                chartDataMap.set(normalizedDate, {
                  date: normalizedDate,
                  [dataKey]: value as number,
                });
              }
            }
          });
        }
      });
    }

    const customSlice = parsedCustomMatrixForCharts
      ? getCustomMatrixSeriesForHorizonTab(
          parsedCustomMatrixForCharts.matrix,
          selectedHorizon,
          SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID,
          forecastData,
        )
      : null;
    if (customSlice) {
      const dataKey = `forecast_${customSlice.lineId}`;
      const n = Math.min(
        customSlice.dates.length,
        customSlice.forecastValues.length,
      );
      for (let i = 0; i < n; i++) {
        const value = customSlice.forecastValues[i];
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        const normalizedDate = normalizeDate(String(customSlice.dates[i]));
        if (latestHistoricalDate && normalizedDate > latestHistoricalDate) {
          continue;
        }
        const existingPoint = chartDataMap.get(normalizedDate);
        if (existingPoint) {
          chartDataMap.set(normalizedDate, {
            ...existingPoint,
            [dataKey]: value,
          });
        } else {
          chartDataMap.set(normalizedDate, {
            date: normalizedDate,
            [dataKey]: value,
          });
        }
      }
    }

    const sortedData = Array.from(chartDataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    if (latestHistoricalDate) {
      return sortedData.filter(point => {
        if (historicalChartData.some(h => h.date === point.date)) return true;
        return point.date <= latestHistoricalDate;
      });
    }
    return sortedData;
  }, [
    performanceData,
    selectedHorizon,
    historicalChartData,
    parsedCustomMatrixForCharts,
    forecastData,
  ]);

  const maxYScale = useMemo(() => {
    if (!performanceData || availableHorizons.length === 0) return undefined;
    const modelKeys = ['model', 'drift'];
    const normalizeDate = (dateStr: string): string => dateStr.split(' ')[0];
    const latestHistoricalDate =
      historicalChartData.length > 0
        ? historicalChartData[historicalChartData.length - 1].date
        : null;
    const allValues: number[] = [];

    availableHorizons.forEach(horizon => {
      const chartDataMap = new Map<string, ChartDataPoint>();
      historicalChartData.forEach(point => {
        chartDataMap.set(point.date, { ...point });
      });
      modelKeys.forEach(key => {
        const index = modelKeys.indexOf(key);
        const modelData = performanceData[key];
        const horizonData = modelData?.forecasts?.[horizon];
        const dataKey = `forecast_${index + 1000}`;
        if (horizonData) {
          Object.entries(horizonData).forEach(([date, value]) => {
            if (value !== null && value !== undefined) {
              const normalizedDate = normalizeDate(String(date));
              if (
                latestHistoricalDate &&
                normalizedDate > latestHistoricalDate
              ) {
                return;
              }
              const existingPoint = chartDataMap.get(normalizedDate);
              if (existingPoint) {
                chartDataMap.set(normalizedDate, {
                  ...existingPoint,
                  [dataKey]: value as number,
                });
              } else {
                chartDataMap.set(normalizedDate, {
                  date: normalizedDate,
                  [dataKey]: value as number,
                });
              }
            }
          });
        }
      });
      if (parsedCustomMatrixForCharts) {
        const customSlice = getCustomMatrixSeriesForHorizonTab(
          parsedCustomMatrixForCharts.matrix,
          horizon,
          SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID,
          forecastData,
        );
        if (customSlice) {
          const dataKey = `forecast_${customSlice.lineId}`;
          const n = Math.min(
            customSlice.dates.length,
            customSlice.forecastValues.length,
          );
          for (let i = 0; i < n; i++) {
            const value = customSlice.forecastValues[i];
            if (typeof value !== 'number' || !Number.isFinite(value)) continue;
            const normalizedDate = normalizeDate(String(customSlice.dates[i]));
            if (latestHistoricalDate && normalizedDate > latestHistoricalDate) {
              continue;
            }
            const existingPoint = chartDataMap.get(normalizedDate);
            if (existingPoint) {
              chartDataMap.set(normalizedDate, {
                ...existingPoint,
                [dataKey]: value,
              });
            } else {
              chartDataMap.set(normalizedDate, {
                date: normalizedDate,
                [dataKey]: value,
              });
            }
          }
        }
      }
      const sortedData = Array.from(chartDataMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const filteredData = latestHistoricalDate
        ? sortedData.filter(point => {
            if (historicalChartData.some(h => h.date === point.date)) {
              return true;
            }
            return point.date <= latestHistoricalDate;
          })
        : sortedData;
      if (filteredData.length > 0) {
        const cutoffDate = new Date(filteredData[filteredData.length - 1].date);
        cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_24);
        filteredData
          .filter(point => new Date(point.date) >= cutoffDate)
          .forEach(point => {
            Object.entries(point).forEach(([key, value]) => {
              if (key === 'date') return;
              if (typeof value === 'number') allValues.push(value);
            });
          });
      }
    });

    if (allValues.length === 0) return undefined;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const diff = max - min;
    return { yMin: min - diff * 0.1, yMax: max + diff * 0.1 };
  }, [
    performanceData,
    availableHorizons,
    historicalChartData,
    parsedCustomMatrixForCharts,
    forecastData,
  ]);

  const filtered24mData = useMemo(() => {
    const dataToUse =
      forecastChartData.length > 0 ? forecastChartData : combinedData;
    if (dataToUse.length === 0) return [];
    const sorted = [...dataToUse].sort((a, b) => a.date.localeCompare(b.date));
    const cutoffDate = new Date(sorted[sorted.length - 1].date);
    cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_24);
    return sorted.filter(point => new Date(point.date) >= cutoffDate);
  }, [forecastChartData, combinedData]);

  const historicalByDateForCustomMetrics = useMemo(() => {
    const norm = (d: string) =>
      normalizeToMonthStart(String(d).split(' ')[0] ?? d);
    const m = new Map<string, number>();
    historicalChartData.forEach(p => {
      const v = p.historical;
      if (typeof v === 'number' && Number.isFinite(v)) {
        m.set(norm(p.date), v);
      }
    });
    return m;
  }, [historicalChartData]);

  const customPerformanceTableRow = useMemo(() => {
    if (!parsedCustomMatrixForCharts) return null;
    const colIdx = sortedHorizonKeysForCustom.indexOf(selectedHorizon);
    if (colIdx < 0) return null;
    const errs = averageForecastErrorsVsHistoricalForMatrixColumn(
      parsedCustomMatrixForCharts.matrix,
      colIdx,
      historicalByDateForCustomMetrics,
    );
    if (!errs) return null;
    return {
      label: parsedCustomMatrixForCharts.displayLabel,
      mae: errs.mae,
      mape: errs.mape,
    };
  }, [
    parsedCustomMatrixForCharts,
    sortedHorizonKeysForCustom,
    selectedHorizon,
    historicalByDateForCustomMetrics,
  ]);

  const perHorizonWindowStart = useMemo(() => {
    if (filtered24mData.length === 0) return null;
    const sorted = [...filtered24mData].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return sorted[0]?.date ?? null;
  }, [filtered24mData]);

  const perHorizonWindowEnd = useMemo(() => {
    if (filtered24mData.length === 0) return null;
    const sorted = [...filtered24mData].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return sorted[sorted.length - 1]?.date ?? null;
  }, [filtered24mData]);

  const modelPerHorizonEntries = useMemo(
    () =>
      buildPerHorizonSpaghettiEntries(
        performanceData?.model,
        availableHorizons,
      ),
    [performanceData, availableHorizons],
  );

  const driftPerHorizonEntries = useMemo(
    () =>
      buildPerHorizonSpaghettiEntries(
        performanceData?.drift,
        availableHorizons,
      ),
    [performanceData, availableHorizons],
  );

  const spaghettiPipeline = useMemo(() => {
    if (viewTab !== 'spaghetti') {
      return {
        merged: {
          mergedData: [] as ChartDataPoint[],
          seriesMeta: [] as { id: number; label: string }[],
        },
        driftSeriesMeta: [] as { id: number; label: string }[],
      };
    }
    const driftMerged =
      driftPerHorizonEntries.length > 0
        ? buildSpaghettiMergedChartData(
            driftPerHorizonEntries,
            historicalChartData,
            SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE,
          )
        : { mergedData: [] as ChartDataPoint[], seriesMeta: [] };
    const modelMerged =
      modelPerHorizonEntries.length > 0
        ? buildSpaghettiMergedChartData(
            modelPerHorizonEntries,
            historicalChartData,
            SPAGHETTI_MODEL_PER_HORIZON_ID_BASE,
          )
        : { mergedData: [] as ChartDataPoint[], seriesMeta: [] };

    let merged: {
      mergedData: ChartDataPoint[];
      seriesMeta: { id: number; label: string }[];
    };
    if (
      driftMerged.seriesMeta.length === 0 &&
      modelMerged.seriesMeta.length === 0
    ) {
      const historicalOnly =
        historicalChartData.length > 0
          ? [...historicalChartData]
              .map(p => ({
                ...p,
                date: normalizeToMonthStart(
                  String(p.date).split(' ')[0] ?? p.date,
                ),
              }))
              .sort((a, b) => a.date.localeCompare(b.date))
          : [];
      merged = { mergedData: historicalOnly, seriesMeta: [] };
    } else if (driftMerged.seriesMeta.length === 0) {
      merged = modelMerged;
    } else if (modelMerged.seriesMeta.length === 0) {
      merged = driftMerged;
    } else {
      merged = mergeSpaghettiMergedBases(driftMerged, modelMerged);
    }
    return { merged, driftSeriesMeta: driftMerged.seriesMeta };
  }, [
    viewTab,
    driftPerHorizonEntries,
    historicalChartData,
    modelPerHorizonEntries,
  ]);

  const spaghettiWithUserSeries = useMemo(() => {
    if (viewTab !== 'spaghetti') {
      return { mergedData: [] as ChartDataPoint[], seriesMeta: [] };
    }
    return mergeSpaghettiUserSeriesFromForecastData(
      spaghettiPipeline.merged,
      userSeriesForSpaghetti,
      forecastData,
    );
  }, [viewTab, spaghettiPipeline.merged, userSeriesForSpaghetti, forecastData]);

  const spaghettiFilteredChartData = useMemo(() => {
    if (viewTab !== 'spaghetti') return [];
    const filtered = filterSpaghettiDataFromEarliestForecastStart(
      spaghettiWithUserSeries.mergedData,
      [],
      userSeriesForSpaghetti,
      forecastData,
      spaghettiPipeline.driftSeriesMeta,
      MONTHS_24,
      [...modelPerHorizonEntries, ...driftPerHorizonEntries],
      perHorizonWindowStart,
      perHorizonWindowEnd,
    );
    return mergeHistoricalIntoSpaghettiChartData(filtered, historicalChartData);
  }, [
    viewTab,
    spaghettiWithUserSeries.mergedData,
    userSeriesForSpaghetti,
    forecastData,
    spaghettiPipeline.driftSeriesMeta,
    modelPerHorizonEntries,
    driftPerHorizonEntries,
    perHorizonWindowStart,
    perHorizonWindowEnd,
    historicalChartData,
  ]);

  const spaghettiDisplayedForScale = useMemo(
    () =>
      filterDataForTimeRange(
        spaghettiFilteredChartData,
        spaghettiTimeRange,
        undefined,
      ),
    [spaghettiFilteredChartData, spaghettiTimeRange],
  );

  const spaghettiYScale = useMemo(() => {
    if (spaghettiDisplayedForScale.length === 0) return undefined;
    return calculateYRangeFromChartData(spaghettiDisplayedForScale);
  }, [spaghettiDisplayedForScale]);

  const spaghettiForecastItems = useMemo((): ForecastItemData[] => {
    return spaghettiWithUserSeries.seriesMeta.map((meta, i) => ({
      id: meta.id,
      name: meta.label,
      color: spaghettiForecastLineColor(meta.id, i),
    }));
  }, [spaghettiWithUserSeries.seriesMeta]);

  useEffect(() => {
    if (
      performanceAnalysisId != null &&
      forecastData[String(performanceAnalysisId)] &&
      performanceData
    ) {
      setSpaghettiTimeRange(getTimeRangeForForecastLength('pin'));
    }
  }, [
    performanceAnalysisId,
    forecastData,
    performanceData,
    getTimeRangeForForecastLength,
  ]);

  useEffect(() => {
    if (isEmpty && viewTab === 'spaghetti') {
      setSpaghettiTimeRange('All');
    }
  }, [isEmpty, viewTab]);

  const updatePinMonth = useCallback((month: string | undefined) => {
    if (month) setPinMonth(month);
  }, []);

  const handlePerformanceChartTimeRangeChange = useCallback(
    (val: string) => {
      if (!val) return;
      onTimeRangeChange?.(val, { viewTab });
      if (timeRangeProp === undefined) {
        if (viewTab === 'spaghetti') setSpaghettiTimeRange(val);
        else setPerHorizonChartTimeRange(val);
      }
    },
    [onTimeRangeChange, timeRangeProp, viewTab],
  );

  useEffect(() => {
    if (filtered24mData.length > 0 && historicalData.length > 0) {
      const lastHistoricalPoint = historicalData[historicalData.length - 1];
      const date = new Date(lastHistoricalPoint.date);
      updatePinMonth(`${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`);
    }
  }, [filtered24mData, historicalData, updatePinMonth]);

  useEffect(() => {
    if (hiddenSeriesControlled) return;
    if (viewTab === 'spaghetti') {
      setHiddenSeries(prev => {
        const next = new Set(prev);
        next.delete('forecast_1000');
        next.delete('forecast_1001');
        return next;
      });
    }
  }, [viewTab, hiddenSeriesControlled, setHiddenSeries]);

  useEffect(() => {
    if (hiddenSeriesControlled) return;
    if (viewTab === 'perHorizon') {
      setHiddenSeries(prev => {
        const next = new Set(prev);
        let changed = false;
        prev.forEach(k => {
          const m = /^forecast_(\d+)$/.exec(k);
          if (!m) return;
          const id = parseInt(m[1], 10);
          if (id >= 6000 && id < 9000) {
            next.delete(k);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [viewTab, hiddenSeriesControlled, setHiddenSeries]);

  const performanceLineIdsForLegend = useMemo(
    () =>
      spaghettiWithUserSeries.seriesMeta
        .filter(m => isSpaghettiModelPerHorizonLineId(m.id))
        .map(m => m.id),
    [spaghettiWithUserSeries.seriesMeta],
  );

  const driftLineIdsForLegend = useMemo(
    () =>
      spaghettiWithUserSeries.seriesMeta
        .filter(m => isSpaghettiDriftPerHorizonLineId(m.id))
        .map(m => m.id),
    [spaghettiWithUserSeries.seriesMeta],
  );

  const customMatrixLineIdsForLegend = useMemo(
    () =>
      spaghettiWithUserSeries.seriesMeta
        .filter(m => isSpaghettiMatrixSyntheticLineId(m.id))
        .map(m => m.id),
    [spaghettiWithUserSeries.seriesMeta],
  );

  const customMatrixLegendGroupLabel = useMemo(() => {
    const first = spaghettiWithUserSeries.seriesMeta.find(m =>
      isSpaghettiMatrixSyntheticLineId(m.id),
    );
    if (!first?.label) return 'Custom performance';
    const head = first.label.split(' · ')[0]?.trim();
    return head || 'Custom performance';
  }, [spaghettiWithUserSeries.seriesMeta]);

  const performanceGroupHidden = useMemo(() => {
    if (performanceLineIdsForLegend.length === 0) return false;
    return performanceLineIdsForLegend.every(id =>
      hiddenSeries.has(`forecast_${id}`),
    );
  }, [performanceLineIdsForLegend, hiddenSeries]);

  const driftGroupHidden = useMemo(() => {
    if (driftLineIdsForLegend.length === 0) return false;
    return driftLineIdsForLegend.every(id =>
      hiddenSeries.has(`forecast_${id}`),
    );
  }, [driftLineIdsForLegend, hiddenSeries]);

  const customMatrixGroupHidden = useMemo(() => {
    if (customMatrixLineIdsForLegend.length === 0) return false;
    return customMatrixLineIdsForLegend.every(id =>
      hiddenSeries.has(`forecast_${id}`),
    );
  }, [customMatrixLineIdsForLegend, hiddenSeries]);

  const toggleSpaghettiGroup = useCallback(
    (group: 'performance' | 'drift' | 'custom') => {
      const ids =
        group === 'performance'
          ? performanceLineIdsForLegend
          : group === 'drift'
            ? driftLineIdsForLegend
            : customMatrixLineIdsForLegend;
      if (ids.length === 0) return;
      setHiddenSeries(prev => {
        const next = new Set(prev);
        const allHidden = ids.every(id => next.has(`forecast_${id}`));
        if (allHidden) ids.forEach(id => next.delete(`forecast_${id}`));
        else ids.forEach(id => next.add(`forecast_${id}`));
        return next;
      });
    },
    [
      performanceLineIdsForLegend,
      driftLineIdsForLegend,
      customMatrixLineIdsForLegend,
      setHiddenSeries,
    ],
  );

  const performanceHistoricalLegendLineColor = isDarkTheme
    ? '#ffffff'
    : '#000000';

  const performanceUnderChartLegend = useMemo(() => {
    if (isEmpty) return null;
    const items: PerformanceUnderChartLegendItemConfig[] = [];
    if (historicalChartData.length > 0) {
      items.push({
        id: 'historical',
        label: 'Historical',
        lineColor: performanceHistoricalLegendLineColor,
        lineStyle: 'solid',
        hidden: hiddenSeries.has('historical'),
      });
    }
    if (viewTab === 'perHorizon') {
      chartForecastData.forEach(item => {
        items.push({
          id: `forecast-${item.id}`,
          label: item.name ?? `Series ${item.id}`,
          lineColor: String(item.color ?? 'var(--foreground)'),
          lineStyle: 'dashed',
          hidden: hiddenSeries.has(`forecast_${item.id}`),
          onToggle: () => toggleLegendSeriesKey(`forecast_${item.id}`),
        });
      });
    }
    if (viewTab === 'spaghetti') {
      if (performanceLineIdsForLegend.length > 0) {
        items.push({
          id: 'spaghetti-performance',
          label: 'Sybilion AI',
          lineColor: SPAGHETTI_MODEL_LINE_COLOR,
          lineStyle: 'dashed',
          hidden: performanceGroupHidden,
          onToggle: () => toggleSpaghettiGroup('performance'),
        });
      }
      if (driftLineIdsForLegend.length > 0) {
        items.push({
          id: 'spaghetti-drift',
          label: getForecastModelDisplayName('drift'),
          lineColor: SPAGHETTI_DRIFT_LINE_COLOR,
          lineStyle: 'dashed',
          hidden: driftGroupHidden,
          onToggle: () => toggleSpaghettiGroup('drift'),
        });
      }
      if (customMatrixLineIdsForLegend.length > 0) {
        items.push({
          id: 'spaghetti-custom-matrix',
          label: customMatrixLegendGroupLabel,
          lineColor: SPAGHETTI_CUSTOM_PERFORMANCE_LINE_COLOR,
          lineStyle: 'dashed',
          hidden: customMatrixGroupHidden,
          onToggle: () => toggleSpaghettiGroup('custom'),
        });
      }
    }
    return <PerformanceUnderChartLegendFromItems items={items} />;
  }, [
    isEmpty,
    viewTab,
    historicalChartData.length,
    chartForecastData,
    performanceHistoricalLegendLineColor,
    hiddenSeries,
    toggleLegendSeriesKey,
    performanceLineIdsForLegend.length,
    driftLineIdsForLegend.length,
    performanceGroupHidden,
    driftGroupHidden,
    toggleSpaghettiGroup,
    customMatrixLineIdsForLegend.length,
    customMatrixLegendGroupLabel,
    customMatrixGroupHidden,
  ]);

  const isSpaghettiView = viewTab === 'spaghetti';
  const hasSpaghettiPoints = spaghettiFilteredChartData.length > 0;
  const spaghettiChartLoading = isSpaghettiView && performanceSectionPending;
  const spaghettiTabShowsChartData = isSpaghettiView && hasSpaghettiPoints;
  const spaghettiOverridesPerformanceEmpty =
    isSpaghettiView &&
    (hasSpaghettiPoints || performanceDataLoading || spaghettiChartLoading);

  const isLoaded = useMemo(
    () =>
      !loading &&
      !performanceDataLoading &&
      perfFetchSettled &&
      (!isEmpty || spaghettiOverridesPerformanceEmpty),
    [
      loading,
      performanceDataLoading,
      perfFetchSettled,
      isEmpty,
      spaghettiOverridesPerformanceEmpty,
    ],
  );

  const spaghettiNoDataMessage =
    isSpaghettiView &&
    perfFetchSettled &&
    !performanceDataLoading &&
    spaghettiFilteredChartData.length === 0
      ? 'No spaghetti plot data for this dataset.'
      : undefined;

  const activeTimeRange =
    timeRangeProp ??
    (isSpaghettiView ? spaghettiTimeRange : perHorizonChartTimeRange);

  const perHorizonChartProps =
    viewTab === 'perHorizon'
      ? {
          chartData: filtered24mData,
          forecastData: chartForecastData,
          yMin: maxYScale?.yMin,
          yMax: maxYScale?.yMax,
          loading: performanceSectionPending,
          noDataMessage: undefined as string | undefined,
          noDataStatusTone: undefined as 'muted' | 'destructive' | undefined,
          hasCombinedData: undefined as boolean | undefined,
        }
      : {
          chartData: spaghettiFilteredChartData,
          forecastData: spaghettiForecastItems,
          yMin: spaghettiYScale?.yMin ?? maxYScale?.yMin,
          yMax: spaghettiYScale?.yMax ?? maxYScale?.yMax,
          loading: spaghettiChartLoading,
          noDataMessage: spaghettiNoDataMessage,
          noDataStatusTone: spaghettiNoDataMessage
            ? ('destructive' as const)
            : undefined,
          hasCombinedData: spaghettiFilteredChartData.length > 0,
        };

  const showEmptyOverlay =
    (runAnalysisHint || Boolean(statusHint) || isEmpty) && !loading;

  return (
    <div
      className={cn(
        S.root,
        performanceSectionPending && !spaghettiTabShowsChartData && S.loading,
        isLoaded && S.loaded,
        isEmpty && S.isEmpty,
        className,
      )}
    >
      <Tabs
        variant="button"
        value={viewTab}
        onValueChange={v => {
          if (v === 'perHorizon' || v === 'spaghetti') {
            setViewTab(v);
          }
        }}
        className={S.viewTabs}
      >
        <div className={S.toolbarRow}>
          {toolbarStart}
          <TabsList className={S.viewTabsList}>
            <TabsTrigger value="perHorizon">Per horizon plot</TabsTrigger>
            <TabsTrigger value="spaghetti">Spaghetti plots</TabsTrigger>
          </TabsList>
          <div className={S.toolBarRight}>
            {viewTab === 'perHorizon' && performanceData && (
              <HorizonsSelector
                selectedHorizon={selectedHorizon}
                onHorizonChange={setSelectedHorizon}
                availableHorizons={availableHorizons}
              />
            )}
          </div>
        </div>

        <div
          className={cn(
            S.perHorizonChartWrap,
            performanceSectionPending && S.perHorizonChartWrapLoading,
          )}
        >
          <ChartAreaInteractive
            disableHistoricalAnimation
            disableTimeRangeSelector
            enableTimeRangeBrush
            disableAnimation={isSpaghettiView}
            chartContainerClassName={S.chartContainer}
            chartData={perHorizonChartProps.chartData}
            forecastData={perHorizonChartProps.forecastData}
            timeRange={activeTimeRange}
            onTimeRangeChange={handlePerformanceChartTimeRangeChange}
            pinMonth={pinMonth}
            onPinMonthChange={updatePinMonth}
            isDarkTheme={isDarkTheme}
            loading={perHorizonChartProps.loading || chartLoading}
            yMin={perHorizonChartProps.yMin}
            yMax={perHorizonChartProps.yMax}
            autoScaleYAxis={false}
            maxVisibleItems={2}
            preventDeselection
            showLegend={false}
            footerActions={performanceUnderChartLegend ?? undefined}
            hasCombinedData={perHorizonChartProps.hasCombinedData}
            hiddenSeries={hiddenSeries}
            toggleLegendSeries={toggleLegendSeriesKey}
            ensureAnalysisSeriesVisible={ensureSeriesVisible}
          />

          {showEmptyOverlay && (
            <div
              className={S.chartEmptyOverlay}
              role="status"
              aria-live="polite"
            >
              <ChartEmptyState
                variant="inline"
                hint={
                  runAnalysisHint ? (
                    'Run a completed analysis to load performance data for an analysis.'
                  ) : isEmpty ? (
                    <>
                      No performance data for this dataset.
                      <br />
                      Please contact{' '}
                      <a href="mailto:support@sybilion.com">support team</a> to
                      gain access to the latest performance data.
                    </>
                  ) : undefined
                }
                status={statusHint ?? undefined}
                statusTone={statusTone}
              />
            </div>
          )}

          {performanceSectionPending && (
            <div
              className={S.performanceLoadingLayer}
              aria-busy="true"
              aria-live="polite"
            >
              <div className={S.emptyState}>
                <TextShimmer as="span" className={S.performanceLoadingText}>
                  Loading performance data…
                </TextShimmer>
              </div>
            </div>
          )}
        </div>

        {!performanceDataLoading && performanceData && (
          <PerformanceTable
            forecastModels={forecastModelsData}
            adjustParameters={adjustParameters}
            onAdjustParametersChange={setAdjustParameters}
            customPerformance={customPerformanceTableRow}
            onEditCustomPerformance={onEditCustomPerformance}
            showAddEditCustomDataButton={showAddEditCustomDataButton}
            addEditCustomDataDisabled={addEditCustomDataDisabled}
          />
        )}
      </Tabs>
    </div>
  );
}
