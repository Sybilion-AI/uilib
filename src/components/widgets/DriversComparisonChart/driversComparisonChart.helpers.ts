import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  getNextMonth,
  getPreviousMonth,
  normalizeToMonthStart,
} from '#uilib/utils/chartConnectionPoint';
import type { BacktestsComponentPayload } from '@sybilion/platform-sdk';

export const DRIVER_FORECAST_ID_BASE = 8_000_000;
export const INITIAL_VISIBLE_SERIES_COUNT = 3;
/** Months of historical context before the earliest forecast month (inclusive). */
export const DRIVER_COMPARISON_CHART_LEAD_MONTHS = 6;

export type DriversComparisonViewTab = 'overlapped' | 'lagged';

/** Ignore leading months where drivers are numerically zero (API often fills 0; lines look empty until real signal). */
const DRIVER_FORECAST_NONZERO_EPS = 1e-9;

export function formatSeriesImportance(value: number | null): string {
  if (value === null) return '—';
  return `${value.toFixed(1)}%`;
}

export function resolveDriverLagLabel(driver: {
  lag?: string | null;
}): string | null {
  if (typeof driver.lag === 'string' && driver.lag.trim()) {
    return driver.lag;
  }
  const raw = driver as Record<string, unknown>;
  const overallLag = raw.overall_lag ?? raw.overallLag;
  if (typeof overallLag === 'string' && overallLag.trim()) {
    return overallLag;
  }
  return null;
}

/** Parse lag label to month count; ranges use the upper bound. */
export function parseLagMonthsFromLabel(
  lag: string | null | undefined,
): number | null {
  if (lag == null) return null;
  const trimmed = lag.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase().replace(/\u2013|\u2014/g, '-');
  if (lower === 'unknown' || lower === 'no lag' || lower.includes('no lag')) {
    return null;
  }

  const rangeMatch = lower.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*months?/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.max(a, b);
  }

  const quarterMatch = lower.match(/~?\s*(\d+)\s*quarter/);
  if (quarterMatch) {
    const q = parseInt(quarterMatch[1], 10);
    if (Number.isFinite(q) && q > 0) return q * 3;
  }

  const monthMatch = lower.match(/~?\s*(\d+)\s*months?/);
  if (monthMatch) {
    const m = parseInt(monthMatch[1], 10);
    if (Number.isFinite(m) && m > 0) return m;
  }

  return null;
}

export function formatLagMonthsLabel(months: number): string {
  return `${months} month(s)`;
}

export function getLagDisplayForView(
  lag: string | null | undefined,
  tab: DriversComparisonViewTab,
): string {
  if (tab === 'overlapped') {
    return lag?.trim() ? lag : '—';
  }
  const months = parseLagMonthsFromLabel(lag);
  return months != null ? formatLagMonthsLabel(months) : '—';
}

export function shiftNormalizedSeriesForward(
  series: Record<string, number | null>,
  lagMonths: number,
): Record<string, number | null> {
  if (lagMonths <= 0) return { ...series };
  const out: Record<string, number | null> = {};
  for (const [dateStr, val] of Object.entries(series)) {
    if (val === null || val === undefined) continue;
    let shifted = normalizeToMonthStart(dateStr);
    for (let i = 0; i < lagMonths; i++) {
      shifted = getNextMonth(shifted);
    }
    out[shifted] = val;
  }
  return out;
}

export function applyDriversComparisonViewToPayload(
  payload: BacktestsComponentPayload | null,
  tab: DriversComparisonViewTab,
): BacktestsComponentPayload | null {
  if (!payload || tab === 'overlapped') return payload;

  return {
    target: {
      ...payload.target,
      normalized_series: { ...payload.target.normalized_series },
    },
    drivers: payload.drivers.map(driver => {
      const lagMonths = parseLagMonthsFromLabel(resolveDriverLagLabel(driver));
      const series = driver.normalized_series ?? {};
      const normalized_series =
        lagMonths != null && lagMonths > 0
          ? shiftNormalizedSeriesForward(series, lagMonths)
          : { ...series };
      return {
        ...driver,
        normalized_series,
      };
    }),
  };
}

export function mergeBacktestsChartData(
  payload: BacktestsComponentPayload | null,
): ChartDataPoint[] {
  if (!payload?.target?.normalized_series) return [];

  const norm = (d: string) => normalizeToMonthStart(d);
  const map = new Map<string, ChartDataPoint>();

  const targetSeries = payload.target.normalized_series;
  Object.entries(targetSeries).forEach(([dateStr, val]) => {
    if (val === null || val === undefined) return;
    const k = norm(dateStr);
    const existing = map.get(k) ?? { date: k };
    existing.historical = val;
    map.set(k, existing);
  });

  if (payload.drivers?.length) {
    const sorted = [...payload.drivers]
      .filter(
        d =>
          d.normalized_series &&
          Object.keys(d.normalized_series).some(
            key => d.normalized_series![key] != null,
          ),
      )
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));

    sorted.forEach((driver, idx) => {
      const fid = DRIVER_FORECAST_ID_BASE + idx;
      const series = driver.normalized_series!;
      Object.entries(series).forEach(([dateStr, val]) => {
        if (val === null || val === undefined) return;
        const k = norm(dateStr);
        const existing = map.get(k) ?? { date: k };
        existing[`forecast_${fid}`] = val;
        map.set(k, existing);
      });
    });
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** While drivers comparison is not loaded: dataset historical only. After load: normalized historical from target.normalized_series (see mergeBacktestsChartData) replaces it. */
export function mergeDatasetHistoricalWithBacktestsChartData(
  datasetHistorical: ChartDataPoint[],
  backtestsMerged: ChartDataPoint[],
): ChartDataPoint[] {
  if (backtestsMerged.length === 0) {
    if (datasetHistorical.length === 0) return [];
    return datasetHistorical
      .map(p => {
        const k = normalizeToMonthStart(p.date);
        const histVal = p.historical;
        return {
          date: k,
          ...(typeof histVal === 'number' ? { historical: histVal } : {}),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  return backtestsMerged;
}

/** Lower-median of ISO month strings (YYYY-MM-01 sorts lexicographically). */
function medianSortedIsoMonth(months: string[]): string {
  const s = [...months].sort((a, b) => a.localeCompare(b));
  return s[Math.floor((s.length - 1) / 2)];
}

/**
 * For each driver, first month with materially non-zero value; anchor = median of those months.
 * (Min is too early with outliers; max matched logs where one driver started 2017-12 while most started 2015-01.)
 */
export function getZoomAnchorMonthFromDriverMaterialStarts(
  points: ChartDataPoint[],
  forecastIds: number[],
): { anchor: string | null; perDriverFirstMaterial: string[] } {
  const perDriverFirstMaterial: string[] = [];
  for (const id of forecastIds) {
    let minForId: string | null = null;
    for (const p of points) {
      const v = p[`forecast_${id}`];
      if (
        typeof v !== 'number' ||
        !Number.isFinite(v) ||
        Math.abs(v) <= DRIVER_FORECAST_NONZERO_EPS
      ) {
        continue;
      }
      const d = normalizeToMonthStart(p.date);
      if (minForId === null || d.localeCompare(minForId) < 0) minForId = d;
    }
    if (minForId === null) {
      return { anchor: null, perDriverFirstMaterial };
    }
    perDriverFirstMaterial.push(minForId);
  }
  const anchor = medianSortedIsoMonth(perDriverFirstMaterial);
  return { anchor, perDriverFirstMaterial };
}

export function subtractMonthsFromMonthStart(
  date: string,
  count: number,
): string {
  let result = date;
  for (let i = 0; i < count; i++) {
    result = getPreviousMonth(result);
  }
  return result;
}

/**
 * Backtests payload often starts at the same month for target + drivers, so xMin falls
 * in a range with no rows. Prepend historical-only months from raw dataset series
 * (scaled to the first normalized point) so the lead-in shows the target line alone.
 */
export function prependHistoricalLeadFromDataset(
  points: ChartDataPoint[],
  datasetHistorical: ChartDataPoint[],
  xMin: string,
): ChartDataPoint[] {
  if (points.length === 0) return points;
  const firstMonth = normalizeToMonthStart(points[0].date);
  if (xMin.localeCompare(firstMonth) >= 0) return points;

  const rawByMonth = new Map<string, number>();
  for (const p of datasetHistorical) {
    const k = normalizeToMonthStart(p.date);
    const v = p.historical;
    if (typeof v === 'number' && Number.isFinite(v)) rawByMonth.set(k, v);
  }

  const histFirst = points[0].historical;
  const rawFirst = rawByMonth.get(firstMonth);
  if (
    typeof histFirst !== 'number' ||
    !Number.isFinite(histFirst) ||
    typeof rawFirst !== 'number' ||
    !Number.isFinite(rawFirst) ||
    Math.abs(rawFirst) <= 1e-15
  ) {
    return points;
  }

  const lead: ChartDataPoint[] = [];
  let m = xMin;
  while (m.localeCompare(firstMonth) < 0) {
    const rawM = rawByMonth.get(m);
    if (typeof rawM === 'number' && Number.isFinite(rawM)) {
      lead.push({
        date: m,
        historical: histFirst * (rawM / rawFirst),
      });
    }
    m = getNextMonth(m);
  }
  return [...lead, ...points];
}

export function buildDriversComparisonChartData(
  mergedWithHistorical: ChartDataPoint[],
  datasetHistorical: ChartDataPoint[],
  forecastIds: number[],
): ChartDataPoint[] {
  if (mergedWithHistorical.length === 0) return mergedWithHistorical;
  if (forecastIds.length === 0) return mergedWithHistorical;
  const { anchor: anchorMonth } = getZoomAnchorMonthFromDriverMaterialStarts(
    mergedWithHistorical,
    forecastIds,
  );
  if (anchorMonth === null) return mergedWithHistorical;
  const xMin = subtractMonthsFromMonthStart(
    anchorMonth,
    DRIVER_COMPARISON_CHART_LEAD_MONTHS,
  );
  const withLead = prependHistoricalLeadFromDataset(
    mergedWithHistorical,
    datasetHistorical,
    xMin,
  );
  return withLead.filter(p => normalizeToMonthStart(p.date) >= xMin);
}
