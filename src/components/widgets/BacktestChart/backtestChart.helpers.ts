import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { HISTORY_SERIES_KEY } from '#uilib/components/ui/ChartAreaInteractive/chartHistories';

/** One month's value: `date` is a sortable ISO date (`2024-03-01`). */
export type BacktestPoint = { date: string; value: number };

/**
 * One backtest origin: a past month a forecast was made from.
 * The baseline holds `value`, the last price known then, flat over the
 * forecast's months.
 */
export type BacktestOrigin = {
  /** The month the forecast was made in: the last month with a known value. */
  date: string;
  /** The value known at `date`, held flat as the baseline. */
  value: number;
  /**
   * The forecast for the months after `date`, in date order. Its last point
   * is where it lands: the month the scores compare with the actual value.
   */
  forecast: BacktestPoint[];
};

/** One window's scores: mean absolute percentage error at the landing month. */
export type BacktestScore = {
  /** The window: the last `months` calendar months up to the latest actual. */
  months: number;
  /** How many forecasts landed in the window with an actual to compare. */
  count: number;
  /** The forecast's MAPE, in percent. */
  forecastError: number;
  /** The held-flat baseline's MAPE, in percent. */
  baselineError: number;
  /**
   * How much of the baseline's error the forecast removes, in percent
   * (negative: the forecast has more error). Null when the baseline has none.
   */
  errorRemoved: number | null;
};

/** The data key of origin `index`'s forecast line. */
export const backtestForecastKey = (index: number) =>
  `forecast_${backtestForecastId(index)}`;
/** The data key of origin `index`'s held-flat line. */
export const backtestBaselineKey = (index: number) =>
  `forecast_${backtestBaselineId(index)}`;
export const backtestForecastId = (index: number) => index * 2;
export const backtestBaselineId = (index: number) => index * 2 + 1;

/** A date's calendar month as a number (year × 12 + month), or NaN. */
function monthIndex(date: string): number {
  const m = /^(\d{4})-(\d{2})/.exec(date);
  const month = m ? Number(m[2]) : 0;
  return m && month >= 1 && month <= 12
    ? Number(m[1]) * 12 + month - 1
    : Number.NaN;
}

/** The first day of month `index` (monthIndex's inverse). */
function monthStart(index: number): string {
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`;
}

/**
 * The chart's rows, one per calendar month from the first to the last, keyed
 * `YYYY-MM-01` (a month with no value has a row of its own, so the x axis
 * spaces months evenly): the actuals under `historical`, and for each origin
 * its forecast (from the origin's value through every forecast month) and its
 * baseline (the origin's value on the same months), each under its own key.
 * A date that is not `YYYY-MM…` is left out.
 */
export function buildBacktestRows(
  actuals: BacktestPoint[],
  origins: BacktestOrigin[],
): ChartDataPoint[] {
  const byMonth = new Map<number, ChartDataPoint>();
  const row = (date: string) => {
    const i = monthIndex(date);
    if (!Number.isFinite(i)) return undefined;
    let r = byMonth.get(i);
    if (!r) {
      r = { date: monthStart(i) };
      byMonth.set(i, r);
    }
    return r;
  };
  for (const a of actuals) {
    if (!Number.isFinite(a.value)) continue;
    const r = row(a.date);
    if (r) r[HISTORY_SERIES_KEY] = a.value;
  }
  origins.forEach((o, i) => {
    if (o.forecast.length === 0) return;
    const fKey = backtestForecastKey(i);
    const bKey = backtestBaselineKey(i);
    const start = row(o.date);
    if (start) {
      start[fKey] = o.value;
      start[bKey] = o.value;
    }
    for (const p of o.forecast) {
      const r = row(p.date);
      if (!r) continue;
      r[fKey] = p.value;
      r[bKey] = o.value;
    }
  });
  if (byMonth.size === 0) return [];
  const first = Math.min(...byMonth.keys());
  const last = Math.max(...byMonth.keys());
  const rows: ChartDataPoint[] = [];
  for (let i = first; i <= last; i++) {
    rows.push(byMonth.get(i) ?? { date: monthStart(i) });
  }
  return rows;
}

/**
 * The scores for the last `months` calendar months up to the latest actual:
 * every origin whose forecast lands in one of them, against that month's
 * actual. Dates match by calendar month (`2024-03-01` and `2024-03-31` are
 * one month). Null when the actuals span fewer months than the window, or
 * no forecast lands in it with a non-zero actual to compare.
 */
export function backtestScore(
  actuals: BacktestPoint[],
  origins: BacktestOrigin[],
  months: number,
): BacktestScore | null {
  const actualByMonth = new Map<number, number>();
  for (const a of actuals) {
    const i = monthIndex(a.date);
    if (Number.isFinite(i) && Number.isFinite(a.value)) {
      actualByMonth.set(i, a.value);
    }
  }
  if (months <= 0 || actualByMonth.size === 0) return null;
  const last = Math.max(...actualByMonth.keys());
  const first = Math.min(...actualByMonth.keys());
  if (last - first + 1 < months) return null;
  const from = last - months + 1;
  let forecastSum = 0;
  let baselineSum = 0;
  let count = 0;
  for (const o of origins) {
    const landing = o.forecast[o.forecast.length - 1];
    if (!landing) continue;
    const i = monthIndex(landing.date);
    if (!(i >= from && i <= last)) continue;
    const actual = actualByMonth.get(i);
    if (actual === undefined || actual === 0 || !Number.isFinite(actual)) {
      continue;
    }
    if (!Number.isFinite(landing.value) || !Number.isFinite(o.value)) continue;
    forecastSum += Math.abs((landing.value - actual) / actual);
    baselineSum += Math.abs((o.value - actual) / actual);
    count += 1;
  }
  if (count === 0) return null;
  const forecastError = (forecastSum / count) * 100;
  const baselineError = (baselineSum / count) * 100;
  return {
    months,
    count,
    forecastError,
    baselineError,
    errorRemoved:
      baselineError > 0 ? (1 - forecastError / baselineError) * 100 : null,
  };
}
