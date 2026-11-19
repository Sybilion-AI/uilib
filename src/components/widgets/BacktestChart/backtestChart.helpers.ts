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
  /** The window: the last `months` months with an actual value. */
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

/**
 * The chart's rows, one per month in date order: the actuals under
 * `historical`, and for each origin its forecast (from the origin's value
 * through every forecast month) and its baseline (the origin's value on the
 * same months), each under its own key.
 */
export function buildBacktestRows(
  actuals: BacktestPoint[],
  origins: BacktestOrigin[],
): ChartDataPoint[] {
  const byDate = new Map<string, ChartDataPoint>();
  const row = (date: string) => {
    let r = byDate.get(date);
    if (!r) {
      r = { date };
      byDate.set(date, r);
    }
    return r;
  };
  for (const a of actuals) row(a.date)[HISTORY_SERIES_KEY] = a.value;
  origins.forEach((o, i) => {
    if (o.forecast.length === 0) return;
    const fKey = backtestForecastKey(i);
    const bKey = backtestBaselineKey(i);
    const start = row(o.date);
    start[fKey] = o.value;
    start[bKey] = o.value;
    for (const p of o.forecast) {
      const r = row(p.date);
      r[fKey] = p.value;
      r[bKey] = o.value;
    }
  });
  return [...byDate.values()].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

/**
 * The scores for the last `months` months with an actual value: every
 * origin whose forecast lands in one of them, against that month's actual.
 * Null when there are fewer actual months than the window, or no forecast
 * lands in it with a non-zero actual to compare.
 */
export function backtestScore(
  actuals: BacktestPoint[],
  origins: BacktestOrigin[],
  months: number,
): BacktestScore | null {
  const sorted = [...actuals].sort((a, b) => a.date.localeCompare(b.date));
  if (months <= 0 || sorted.length < months) return null;
  const window = new Map(
    sorted.slice(sorted.length - months).map(a => [a.date, a.value]),
  );
  let forecastSum = 0;
  let baselineSum = 0;
  let count = 0;
  for (const o of origins) {
    const landing = o.forecast[o.forecast.length - 1];
    if (!landing) continue;
    const actual = window.get(landing.date);
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
