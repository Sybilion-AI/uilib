/**
 * Helper functions for Performance Tab calculations
 * Note: ROI/calculatons.ts is only for reference/example
 */
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastData } from '#uilib/types/forecast-data';
import {
  getNextMonth,
  getPreviousMonth,
  normalizeToMonthStart,
} from '#uilib/utils/chartConnectionPoint';

import type { SpaghettiPerformanceMatrixPayload } from './performanceChartUserSeries';

export type RealBacktestsEntry = {
  forecast_start: string;
  forecast_end: string;
  forecast_series: Record<string, number>;
};

/** Legacy: API backtest spaghetti lines used `SPAGHETTI_FORECAST_ID_BASE + i` (spaghetti view now uses drift per-horizon instead). */
export const SPAGHETTI_FORECAST_ID_BASE = 6000;

/** Model PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_MODEL_PER_HORIZON_ID_BASE + i`. */
export const SPAGHETTI_MODEL_PER_HORIZON_ID_BASE = 7000;

/** Drift PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE + i`. */
export const SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE = 8000;

const SPAGHETTI_DRIFT_ID_RANGE_END = 9000;

export function isSpaghettiModelPerHorizonLineId(id: number): boolean {
  return (
    id >= SPAGHETTI_MODEL_PER_HORIZON_ID_BASE &&
    id < SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE
  );
}

export function isSpaghettiDriftPerHorizonLineId(id: number): boolean {
  return (
    id >= SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE &&
    id < SPAGHETTI_DRIFT_ID_RANGE_END
  );
}

/**
 * Anchor a spaghetti forecast line to the historical curve at the month before
 * the earliest forecast point (same strategy as ensureForecastConnectionPoint).
 */
function addSpaghettiHistoricalBridgeForSeries(
  map: Map<string, ChartDataPoint>,
  dataKey: string,
  earliestForecastDate: string | null,
): void {
  if (earliestForecastDate === null) return;
  const connectionDate = normalizeToMonthStart(
    getPreviousMonth(earliestForecastDate),
  );
  const row = map.get(connectionDate);
  if (row === undefined) return;
  const hist = row.historical;
  if (typeof hist !== 'number' || !Number.isFinite(hist)) return;
  const existingVal = row[dataKey];
  if (typeof existingVal === 'number' && Number.isFinite(existingVal)) {
    return;
  }
  row[dataKey] = hist;
  map.set(connectionDate, row);
}

type PerHorizonForecastRoot = {
  forecasts?: Record<string, Record<string, number>>;
};

/** When horizons have different lengths, align on the latest `n` months (suffix), not the oldest. */
function perHorizonSortedKeyLists(
  forecastRoot: PerHorizonForecastRoot,
  horizonKeys: string[],
): { sortedHorizons: string[]; perHorizonKeyLists: string[][] } | null {
  if (!forecastRoot.forecasts || horizonKeys.length === 0) return null;

  const forecasts = forecastRoot.forecasts;
  const sortedHorizons = [...horizonKeys].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return na - nb;
  });

  const normalizeDateKey = (d: string) => d.split(' ')[0];

  const perHorizonKeyLists: string[][] = sortedHorizons.map(h => {
    const m = forecasts[h];
    if (!m || typeof m !== 'object') return [];
    return Object.keys(m).sort((a, b) =>
      normalizeDateKey(a).localeCompare(normalizeDateKey(b)),
    );
  });

  const lengths = perHorizonKeyLists.map(l => l.length).filter(l => l > 0);
  if (lengths.length === 0) return null;

  return { sortedHorizons, perHorizonKeyLists };
}

function alignedHorizonRowCount(perHorizonKeyLists: string[][]): number {
  const lengths = perHorizonKeyLists.map(l => l.length).filter(l => l > 0);
  if (lengths.length === 0) return 0;
  return Math.min(...lengths);
}

function horizonDateKeyAtRow(
  perHorizonKeyLists: string[][],
  horizonIndex: number,
  rowIndex: number,
  rowCount: number,
): string | undefined {
  const keys = perHorizonKeyLists[horizonIndex];
  if (!keys?.length) return undefined;
  const offset = keys.length - rowCount;
  return keys[offset + rowIndex];
}

/**
 * Converts `performance.model` / `performance.drift` per-horizon forecasts into synthetic
 * backtest-shaped entries: each line is [horizon_1[i], …, horizon_n[i]] as date→value points
 * (aligned on the latest shared months per horizon).
 */
export function buildPerHorizonSpaghettiEntries(
  forecastRoot:
    | { forecasts?: Record<string, Record<string, number>> }
    | null
    | undefined,
  horizonKeys: string[],
): RealBacktestsEntry[] {
  const aligned = perHorizonSortedKeyLists(forecastRoot ?? {}, horizonKeys);
  if (!aligned) return [];

  const { sortedHorizons, perHorizonKeyLists } = aligned;
  const forecasts = forecastRoot!.forecasts!;
  const normalizeDateKey = (d: string) => d.split(' ')[0];
  const n = alignedHorizonRowCount(perHorizonKeyLists);
  if (n === 0) return [];

  const entries: RealBacktestsEntry[] = [];
  for (let i = 0; i < n; i++) {
    const forecast_series: Record<string, number> = {};
    for (let hi = 0; hi < sortedHorizons.length; hi++) {
      const h = sortedHorizons[hi];
      const dateKey = horizonDateKeyAtRow(perHorizonKeyLists, hi, i, n);
      if (!dateKey) continue;
      const rawVal = forecasts[h]?.[dateKey];
      if (typeof rawVal !== 'number' || !Number.isFinite(rawVal)) continue;
      const norm = normalizeToMonthStart(normalizeDateKey(dateKey));
      forecast_series[norm] = rawVal;
    }
    const dates = Object.keys(forecast_series).sort();
    if (dates.length === 0) continue;
    entries.push({
      forecast_start: dates[0],
      forecast_end: dates[dates.length - 1],
      forecast_series,
    });
  }
  return entries;
}

/**
 * Same row alignment as {@link buildPerHorizonSpaghettiEntries}: row `i` uses each horizon's
 * latest-aligned forecast month; `dates[i]` is horizon_1's month at that row (Date column).
 * Use this for custom dialog seed + “copy statistical baseline (drift)” prefill.
 */
export function buildDriftSpaghettiMatrixForCustomDialog(
  driftRoot:
    | { forecasts?: Record<string, Record<string, number>> }
    | null
    | undefined,
  horizonKeys: string[],
): {
  dates: string[];
  grid: number[][];
  perHorizonDates: string[][];
} | null {
  const aligned = perHorizonSortedKeyLists(driftRoot ?? {}, horizonKeys);
  if (!aligned) return null;

  const { sortedHorizons, perHorizonKeyLists } = aligned;
  const forecasts = driftRoot!.forecasts!;
  const normalizeDateKey = (d: string) => d.split(' ')[0];
  const n = alignedHorizonRowCount(perHorizonKeyLists);
  if (n === 0) return null;

  const dates: string[] = [];
  const grid: number[][] = [];
  const perHorizonDates: string[][] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    const dateRow: string[] = [];
    for (let hi = 0; hi < sortedHorizons.length; hi++) {
      const h = sortedHorizons[hi];
      const dateKey = horizonDateKeyAtRow(perHorizonKeyLists, hi, i, n);
      if (!dateKey) {
        row.push(0);
        dateRow.push('');
        continue;
      }
      dateRow.push(normalizeToMonthStart(normalizeDateKey(dateKey)));
      const rawVal = forecasts[h]?.[dateKey];
      const v =
        typeof rawVal === 'number' && Number.isFinite(rawVal) ? rawVal : NaN;
      row.push(v);
    }
    const d0 = horizonDateKeyAtRow(perHorizonKeyLists, 0, i, n);
    dates.push(d0 ? normalizeToMonthStart(normalizeDateKey(d0)) : '');
    perHorizonDates.push(dateRow);
    grid.push(row.map(c => (Number.isFinite(c) ? c : 0)));
  }

  return {
    dates,
    grid,
    perHorizonDates,
  };
}

export function latestHistoricalMonthKey(
  historicalByDate: Map<string, number>,
): string | null {
  let latest: string | null = null;
  historicalByDate.forEach((_, d) => {
    if (!latest || d.localeCompare(latest) > 0) latest = d;
  });
  return latest;
}

/**
 * Append monthly spaghetti rows after drift backtests so the dialog (and chart) reach the latest
 * historical month (e.g. Apr 2026), not only the last drift origin (e.g. Nov 2025).
 */
export function extendCustomPerformanceDriftSeedToHistoricalEnd(
  seed: {
    dates: string[];
    grid: number[][];
    perHorizonDates: string[][];
  },
  historicalByDate: Map<string, number>,
): {
  dates: string[];
  grid: number[][];
  perHorizonDates: string[][];
} {
  const latest = latestHistoricalMonthKey(historicalByDate);
  if (!latest || seed.dates.length === 0) return seed;

  const norm = (d: string) =>
    normalizeToMonthStart(String(d).split(' ')[0] ?? d);

  const dates = seed.dates.map(d => norm(d));
  const grid = seed.grid.map(r => [...r]);
  const perHorizonDates = seed.perHorizonDates.map(row =>
    row.map(d => norm(String(d))),
  );
  const horizonCount = grid[0]?.length ?? perHorizonDates[0]?.length ?? 0;
  if (horizonCount === 0) return seed;

  let lastOrigin = dates[dates.length - 1];
  if (!lastOrigin) return seed;

  const MAX_MONTH_EXTENSIONS = 500;
  let iterations = 0;

  while (lastOrigin.localeCompare(latest) < 0) {
    iterations += 1;
    if (iterations > MAX_MONTH_EXTENSIONS) {
      console.warn(
        'extendCustomPerformanceDriftSeedToHistoricalEnd: exceeded max month extensions',
        { lastOrigin, latest },
      );
      break;
    }

    const nextOrigin = norm(getNextMonth(lastOrigin));
    if (
      nextOrigin === lastOrigin ||
      nextOrigin.localeCompare(lastOrigin) <= 0
    ) {
      console.warn(
        'extendCustomPerformanceDriftSeedToHistoricalEnd: month did not advance',
        { lastOrigin, nextOrigin, latest },
      );
      break;
    }

    const prevPh = perHorizonDates[perHorizonDates.length - 1];
    const newPh =
      prevPh.length === horizonCount
        ? prevPh.map(d => norm(getNextMonth(norm(d))))
        : Array.from({ length: horizonCount }, () => nextOrigin);

    perHorizonDates.push(newPh);
    dates.push(nextOrigin);

    const baselineRow = spaghettiGridFromHistoricalPreviousMonth(
      [newPh],
      horizonCount,
      historicalByDate,
    );
    grid.push(baselineRow[0] ?? Array.from({ length: horizonCount }, () => 0));

    lastOrigin = nextOrigin;
  }

  return { dates, grid, perHorizonDates };
}

/** Pad a saved custom matrix with drift/baseline rows so edit + chart cover latest backtest months. */
export function extendCustomPerformanceMatrixWithDriftSeed(
  saved: SpaghettiPerformanceMatrixPayload,
  driftSeed: {
    dates: string[];
    grid: number[][];
    perHorizonDates: string[][];
  },
  baselineGrid?: number[][],
): SpaghettiPerformanceMatrixPayload {
  const norm = (d: string) =>
    normalizeToMonthStart(String(d).split(' ')[0] ?? d);
  const horizonCount = saved.horizonKeys.length;

  const savedByDate = new Map<
    string,
    { grid: number[]; perHorizon?: string[] }
  >();
  for (let r = 0; r < saved.dates.length; r++) {
    savedByDate.set(norm(saved.dates[r]), {
      grid: saved.grid[r],
      perHorizon: saved.perHorizonDates?.[r],
    });
  }

  const dates: string[] = [];
  const grid: number[][] = [];
  const perHorizonDates: string[][] = [];

  for (let i = 0; i < driftSeed.dates.length; i++) {
    const d = norm(driftSeed.dates[i]);
    if (!d) continue;
    dates.push(d);
    const existing = savedByDate.get(d);
    if (existing) {
      grid.push([...existing.grid]);
      const ph =
        existing.perHorizon && existing.perHorizon.length === horizonCount
          ? existing.perHorizon.map(c => norm(String(c)))
          : (driftSeed.perHorizonDates[i]?.map(c => norm(String(c))) ?? []);
      perHorizonDates.push(ph);
      continue;
    }
    grid.push(
      baselineGrid?.[i] ? [...baselineGrid[i]] : [...driftSeed.grid[i]],
    );
    perHorizonDates.push(
      (driftSeed.perHorizonDates[i] ?? []).map(c => norm(String(c))),
    );
  }

  return {
    v: saved.v,
    dates,
    horizonKeys: [...saved.horizonKeys],
    grid,
    perHorizonDates,
  };
}

/**
 * Prefill for custom performance when copying drift layout: each spaghetti row is flat at the
 * historical value for the month before the earliest forecast month in that row (same anchor as
 * chart connection-point logic).
 */
export function spaghettiGridFromHistoricalPreviousMonth(
  perHorizonDates: string[][],
  horizonCount: number,
  historicalByDate: Map<string, number>,
): number[][] {
  const norm = (d: string) =>
    normalizeToMonthStart(String(d).split(' ')[0] ?? d);
  return perHorizonDates.map(row => {
    if (!Array.isArray(row) || row.length === 0) {
      return Array.from({ length: horizonCount }, () => 0);
    }
    const sorted = [...row]
      .map(d => norm(String(d)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    const earliest = sorted[0];
    if (!earliest) {
      return Array.from({ length: horizonCount }, () => 0);
    }
    const prevMonth = normalizeToMonthStart(getPreviousMonth(earliest));
    const v = historicalByDate.get(prevMonth);
    const flat = typeof v === 'number' && Number.isFinite(v) ? v : 0;
    return Array.from({ length: horizonCount }, () => flat);
  });
}

/** Mean absolute error / MAPE vs historical for one horizon column of a spaghetti matrix (aligned by month). */
export function averageForecastErrorsVsHistoricalForMatrixColumn(
  matrix: SpaghettiPerformanceMatrixPayload,
  horizonColumnIndex: number,
  historicalByDate: Map<string, number>,
): { mae: number; mape: number } | null {
  const norm = (d: string) =>
    normalizeToMonthStart(String(d).split(' ')[0] ?? d);
  const maeList: number[] = [];
  const mapeList: number[] = [];
  const nR = matrix.grid.length;
  for (let r = 0; r < nR; r++) {
    const dSrc =
      matrix.perHorizonDates?.[r]?.[horizonColumnIndex] ?? matrix.dates[r];
    const d = norm(String(dSrc));
    const actual = historicalByDate.get(d);
    const fc = matrix.grid[r]?.[horizonColumnIndex];
    if (
      actual === undefined ||
      typeof fc !== 'number' ||
      !Number.isFinite(fc)
    ) {
      continue;
    }
    const err = Math.abs(fc - actual);
    maeList.push(err);
    if (Math.abs(actual) > 1e-9) mapeList.push(err / Math.abs(actual));
  }
  if (maeList.length === 0) return null;
  return {
    mae: maeList.reduce((a, b) => a + b, 0) / maeList.length,
    mape:
      mapeList.length > 0
        ? mapeList.reduce((a, b) => a + b, 0) / mapeList.length
        : 0,
  };
}

/** @deprecated Use {@link buildPerHorizonSpaghettiEntries} (same implementation). */
export const buildModelPerHorizonSpaghettiEntries =
  buildPerHorizonSpaghettiEntries;

export function mergeSpaghettiMergedBases(
  a: {
    mergedData: ChartDataPoint[];
    seriesMeta: { id: number; label: string }[];
  },
  b: {
    mergedData: ChartDataPoint[];
    seriesMeta: { id: number; label: string }[];
  },
): {
  mergedData: ChartDataPoint[];
  seriesMeta: { id: number; label: string }[];
} {
  const norm = (d: string) => normalizeToMonthStart(d);
  const map = new Map<string, ChartDataPoint>();

  const mergePoints = (points: ChartDataPoint[]) => {
    points.forEach(point => {
      const k = norm(point.date);
      const prev = map.get(k);
      if (!prev) {
        map.set(k, { ...point, date: k });
        return;
      }
      const merged: ChartDataPoint = { ...prev };
      Object.keys(point).forEach(key => {
        if (key === 'date') return;
        if (key.startsWith('forecast_')) {
          merged[key] = point[key];
        }
      });
      if (point.historical !== undefined) {
        merged.historical = point.historical;
      }
      map.set(k, merged);
    });
  };

  mergePoints(a.mergedData);
  mergePoints(b.mergedData);

  const mergedData = Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    mergedData,
    seriesMeta: [...a.seriesMeta, ...b.seriesMeta],
  };
}

export function buildSpaghettiMergedChartData(
  entries: RealBacktestsEntry[],
  historicalChartData: ChartDataPoint[],
  idBase: number = SPAGHETTI_FORECAST_ID_BASE,
): {
  mergedData: ChartDataPoint[];
  seriesMeta: { id: number; label: string }[];
} {
  const norm = (d: string) => normalizeToMonthStart(d);
  const map = new Map<string, ChartDataPoint>();

  historicalChartData.forEach(point => {
    const k = norm(point.date);
    map.set(k, { ...point, date: k });
  });

  const seriesMeta: { id: number; label: string }[] = [];

  entries.forEach((entry, i) => {
    const id = idBase + i;
    const dataKey = `forecast_${id}`;
    seriesMeta.push({
      id,
      label: `${entry.forecast_start} – ${entry.forecast_end}`,
    });
    let earliestForecastDate: string | null = null;
    Object.entries(entry.forecast_series).forEach(([dateStr, val]) => {
      if (typeof val !== 'number' || !Number.isFinite(val)) return;
      const k = norm(dateStr);
      if (
        earliestForecastDate === null ||
        k.localeCompare(earliestForecastDate) < 0
      ) {
        earliestForecastDate = k;
      }
      const existing = map.get(k) ?? { date: k };
      existing[dataKey] = val;
      map.set(k, existing);
    });
    addSpaghettiHistoricalBridgeForSeries(map, dataKey, earliestForecastDate);
  });

  const mergedData = Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return { mergedData, seriesMeta };
}

function mergeUserSeriesForecastIntoSpaghettiPoints(
  mergedData: ChartDataPoint[],
  seriesId: number,
  dates: string[],
  forecastValues: number[],
): ChartDataPoint[] {
  const norm = (d: string) => normalizeToMonthStart(d);
  const map = new Map<string, ChartDataPoint>();
  mergedData.forEach(point => {
    const k = norm(point.date);
    map.set(k, { ...point, date: k });
  });
  const dataKey = `forecast_${seriesId}`;
  let earliestForecastDate: string | null = null;
  dates.forEach((dateStr, i) => {
    const val = forecastValues[i];
    if (typeof val !== 'number' || !Number.isFinite(val)) return;
    const k = norm(dateStr);
    if (
      earliestForecastDate === null ||
      k.localeCompare(earliestForecastDate) < 0
    ) {
      earliestForecastDate = k;
    }
    const existing = map.get(k) ?? { date: k };
    existing[dataKey] = val;
    map.set(k, existing);
  });
  addSpaghettiHistoricalBridgeForSeries(map, dataKey, earliestForecastDate);
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** Appends forecast-backed user series (from dataset context) onto spaghetti backtest lines. */
export function mergeSpaghettiUserSeriesFromForecastData(
  base: {
    mergedData: ChartDataPoint[];
    seriesMeta: { id: number; label: string }[];
  },
  userSeries: { id: number; name?: string }[],
  forecastData: Record<string, ForecastData>,
): {
  mergedData: ChartDataPoint[];
  seriesMeta: { id: number; label: string }[];
} {
  let mergedData = base.mergedData;
  const extendedMeta = [...base.seriesMeta];

  userSeries.forEach(analysis => {
    const fd = forecastData[String(analysis.id)];
    if (!fd) return;
    const { dates, forecastValues } = fd;
    if (dates.length === 0 || forecastValues.length !== dates.length) return;
    if (extendedMeta.some(m => m.id === analysis.id)) return;

    mergedData = mergeUserSeriesForecastIntoSpaghettiPoints(
      mergedData,
      analysis.id,
      dates,
      forecastValues,
    );
    extendedMeta.push({
      id: analysis.id,
      label: analysis.name?.trim() || 'User series',
    });
  });

  return { mergedData, seriesMeta: extendedMeta };
}

export function filterChartDataLast24Months(
  data: ChartDataPoint[],
  months: number,
): ChartDataPoint[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const cutoffDate = new Date(sorted[sorted.length - 1].date);
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  return sorted.filter(point => new Date(point.date) >= cutoffDate);
}

/** Earlier month string (ISO-style sortable). */
function earlierMonthStart(a: string, b: string): string {
  return a.localeCompare(b) < 0 ? a : b;
}

/**
 * Spaghetti chart x-range: from two months before the earliest forecast_start
 * (per-horizon synthetic entries + mergeable user forecast series), inclusive.
 * Falls back to last N months when no forecast candidates exist.
 *
 * When `historicalWindowFloor` is set (e.g. first month of per-horizon `filtered24mData`),
 * the range start is floored to that month so the historical line matches the per-horizon tab.
 *
 * When `historicalWindowCeiling` is set (e.g. last month of `filtered24mData`), drops points after
 * that month so spaghetti X matches per-horizon (per-horizon chart trims forecasts past last historical).
 */
export function filterSpaghettiDataFromEarliestForecastStart(
  mergedData: ChartDataPoint[],
  entries: RealBacktestsEntry[],
  userSeries: { id: number; name?: string }[],
  forecastData: Record<string, ForecastData>,
  /** Series meta from the first merged batch (e.g. drift) — used to skip duplicate user-series ids. */
  firstBatchSeriesMeta: { id: number; label: string }[],
  fallbackMonths: number,
  extraForecastCandidates?: RealBacktestsEntry[],
  historicalWindowFloor?: string | null,
  historicalWindowCeiling?: string | null,
): ChartDataPoint[] {
  const candidates: string[] = [];
  for (const e of entries) {
    candidates.push(normalizeToMonthStart(e.forecast_start));
  }
  extraForecastCandidates?.forEach(e => {
    candidates.push(normalizeToMonthStart(e.forecast_start));
  });
  userSeries.forEach(analysis => {
    const fd = forecastData[String(analysis.id)];
    if (!fd) return;
    const { dates, forecastValues } = fd;
    if (dates.length === 0 || forecastValues.length !== dates.length) return;
    if (firstBatchSeriesMeta.some(m => m.id === analysis.id)) return;
    candidates.push(normalizeToMonthStart(dates[0]));
  });

  if (candidates.length === 0) {
    let result = filterChartDataLast24Months(mergedData, fallbackMonths);
    if (historicalWindowFloor && result.length > 0 && mergedData.length > 0) {
      const floor = normalizeToMonthStart(historicalWindowFloor);
      const start = earlierMonthStart(floor, result[0].date);
      const maxDate = result[result.length - 1].date;
      const sorted = [...mergedData].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      result = sorted.filter(p => p.date >= start && p.date <= maxDate);
    }
    if (historicalWindowCeiling && result.length > 0) {
      const cap = normalizeToMonthStart(historicalWindowCeiling);
      result = result.filter(
        p =>
          normalizeToMonthStart(String(p.date).split(' ')[0] ?? p.date) <= cap,
      );
    }
    return result;
  }

  const normalizedMin = candidates.reduce((min, c) =>
    c.localeCompare(min) < 0 ? c : min,
  );
  let rangeStart = normalizeToMonthStart(
    getPreviousMonth(getPreviousMonth(normalizedMin)),
  );
  if (historicalWindowFloor) {
    const floor = normalizeToMonthStart(historicalWindowFloor);
    rangeStart = earlierMonthStart(floor, rangeStart);
  }

  const sorted = [...mergedData].sort((a, b) => a.date.localeCompare(b.date));
  let result = sorted.filter(point => point.date >= rangeStart);
  if (historicalWindowCeiling && result.length > 0) {
    const cap = normalizeToMonthStart(historicalWindowCeiling);
    result = result.filter(
      p => normalizeToMonthStart(String(p.date).split(' ')[0] ?? p.date) <= cap,
    );
  }
  return result;
}

/**
 * Ensure each spaghetti row has `historical` from {@link historicalChartData} when that month
 * falls in the filtered window — matches per-horizon chart (actuals line), and fills months that
 * exist in history but were missing after merge/filter.
 */
export function mergeHistoricalIntoSpaghettiChartData(
  filteredRows: ChartDataPoint[],
  historicalChartData: ChartDataPoint[],
): ChartDataPoint[] {
  if (filteredRows.length === 0 || historicalChartData.length === 0) {
    return filteredRows;
  }

  const norm = (d: string) =>
    normalizeToMonthStart(String(d).split(' ')[0] ?? d);

  const histByDate = new Map<string, number>();
  historicalChartData.forEach(p => {
    const v = p.historical;
    if (typeof v !== 'number' || !Number.isFinite(v)) return;
    histByDate.set(norm(p.date), v);
  });

  const sorted = [...filteredRows].sort((a, b) => a.date.localeCompare(b.date));
  const minD = norm(sorted[0].date);
  const maxD = norm(sorted[sorted.length - 1].date);

  const rowMap = new Map<string, ChartDataPoint>();
  sorted.forEach(p => {
    const k = norm(p.date);
    const fromHist = histByDate.get(k);
    const merged: ChartDataPoint = { ...p, date: k };
    if (fromHist !== undefined) {
      merged.historical = fromHist;
    }
    rowMap.set(k, merged);
  });

  histByDate.forEach((histVal, dateKey) => {
    if (dateKey < minD || dateKey > maxD) return;
    if (!rowMap.has(dateKey)) {
      rowMap.set(dateKey, { date: dateKey, historical: histVal });
    }
  });

  return [...rowMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate Accuracy: 100% - MAPE
 * @param mape - MAPE value as decimal (e.g., 0.0436 for 4.36%)
 * @returns Accuracy percentage
 */
export function calculateAccuracy(mape: number): number {
  return 100 - mape * 100;
}

/**
 * Format Accuracy as percentage
 * @param value - Accuracy value
 * @returns Formatted accuracy string (e.g., "97%")
 */
export function formatAccuracy(value: number): string {
  if (value < 10) return `< 10%`;
  return `${Math.round(value)}%`;
}

/**
 * Format Error as "$/Ton"
 * @param mae - MAE value from metrics_summary.24m.mae
 * @returns Formatted error string (e.g., "0.05$/Ton")
 */
export function formatError(mae: number): string {
  return `${mae.toFixed(2)} $/Ton`;
}

/**
 * Calculate ROI
 * Reference: ROI/calculatons.ts for example logic
 * @param totalBenefit - Total annual benefit
 * @param operatingCost - Annual operating cost
 * @returns ROI percentage
 */
export function calculateROI(
  totalBenefit: number,
  operatingCost: number,
): number {
  if (operatingCost <= 0) return 0;
  const netBenefit = totalBenefit - operatingCost;
  return (netBenefit / operatingCost) * 100;
}

/**
 * Calculate ROI Multiple
 * Formula: ROI Multiple = ROI / 100
 * Where ROI = (AB - IC) / IC × 100
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns ROI multiple (e.g., 1.0 for 100% ROI, 2.0 for 200% ROI)
 */
export function calculateROIMultiple(
  totalBenefit: number,
  operatingCost: number,
): number {
  if (operatingCost <= 0) return 0;
  const roi = calculateROI(totalBenefit, operatingCost);
  return roi / 100;
}

/**
 * Format ROI as multiplier (xN format)
 * Formula: ROI Multiple = ROI / 100
 * Examples: 100% ROI = x1, 200% ROI = x2, 0% ROI = x0
 * Note: Negative ROI (when benefit < cost) is displayed as x1
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns Formatted ROI string (e.g., "x1.5")
 */
export function formatROI(totalBenefit: number, operatingCost: number): string {
  const multiple = calculateROIMultiple(totalBenefit, operatingCost);
  // If multiple is negative (benefit < cost), show as x1
  const adjustedMultiple = multiple < 0 ? 1 : multiple;
  // Round to 1 decimal place
  const rounded = Math.round(adjustedMultiple * 10) / 10;
  // Format: show as integer if whole number, otherwise 1 decimal place
  const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  return `x${formatted}`;
}

/**
 * Calculate Benefit p/a
 * Formula: Annual Benefit = PV × V × C × PI
 * Where:
 * - PV = Procurement Volume
 * - V = Variable Raw Material Share (as decimal)
 * - C = Controllable Cost Share (as decimal)
 * - PI = Price Improvement = |FA_new - FA_current| × 0.2 (correlation factor)
 * @param mae - MAE value (not used in calculation, kept for backward compatibility)
 * @param mape - MAPE value (used to calculate actual forecast accuracy)
 * @param adjustParams - Adjust parameters from dialog
 * @param baselineAccuracy - Optional baseline accuracy for comparison (if provided, uses actual improvement)
 * @returns Benefit per annum
 */
export function calculateBenefit(
  mae: number,
  mape: number,
  adjustParams: {
    procurementVolume: number;
    variableRawMaterialCostShare: number;
    controllableCosts: number;
    currentForecastAccuracy: number;
    expectedImprovement: number;
    analystHourlyRate: number;
  },
  baselineAccuracy?: number,
): number {
  // Calculate Price Improvement (PI) as decimal
  // If baselineAccuracy is provided, use actual accuracy improvement
  // Otherwise, use user-entered expected improvement
  let accuracyImprovement: number;
  if (baselineAccuracy !== undefined) {
    // Use actual forecast accuracy improvement
    const currentAccuracy = calculateAccuracy(mape);
    accuracyImprovement = Math.abs(currentAccuracy - baselineAccuracy);
  } else {
    // Use user-entered expected improvement
    accuracyImprovement = adjustParams.expectedImprovement;
  }

  // PI = accuracyImprovement × 0.2 (correlation factor)
  const priceImprovement = (accuracyImprovement / 100) * 0.2;

  // Convert percentages to decimals
  const variableShare = adjustParams.variableRawMaterialCostShare / 100;
  const controllableShare = adjustParams.controllableCosts / 100;

  // Annual Benefit = PV × V × C × PI
  const annualBenefit =
    adjustParams.procurementVolume *
    variableShare *
    controllableShare *
    priceImprovement;

  return Math.round(annualBenefit);
}

/**
 * Format Benefit as euros
 * @param value - Benefit value
 * @returns Formatted benefit string (e.g., "€616.640")
 */
export function formatBenefit(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Map forecast model key to display name
 * @param key - Forecast model key (e.g., "mean", "drift", "seasonal")
 * @returns Display name (e.g., "Mean", "Drift", "Seasonal")
 */
export function getForecastModelDisplayName(key: string): string {
  const nameMap: Record<string, string> = {
    mean: 'Mean',
    drift: 'Statistical baseline',
    seasonal: 'Seasonal',
    ARMA: 'ARMA',
    ARIMA: 'ARIMA',
    linear: 'Linear',
    theta: 'Theta',
    model: 'Sybilion AI',
  };
  return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Calculate Y range (min/max) from chart data points
 * Extracts all numeric values from chart data points and calculates min/max with padding
 * @param chartData - Array of chart data points
 * @returns Object with yMin and yMax values
 */
export function calculateYRangeFromChartData(
  chartData: Array<Record<string, unknown>>,
): { yMin: number; yMax: number } {
  const allValues: number[] = [];

  chartData.forEach(point => {
    Object.entries(point).forEach(([key, value]) => {
      if (key === 'date') return;

      // Include only numeric values (historical and forecast line values)
      if (typeof value === 'number') {
        allValues.push(value);
      }
    });
  });

  if (allValues.length === 0) {
    return { yMin: 0, yMax: 100 };
  }

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min;

  return {
    yMin: min - diff * 0.1,
    yMax: max + diff * 0.1,
  };
}
