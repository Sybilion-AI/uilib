/**
 * Utility functions for ensuring consistent connection points between historical and forecast data
 * across all chart components.
 */
import type {
  SeriesForecastData,
  TimeSeriesPoint,
} from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

export type EnsureChartForecastBridgeOptions = {
  forecastSeriesIds?: number[];
  /** When true, returns `chartData` unchanged */
  disabled?: boolean;
};

const FORECAST_KEY_RE = /^forecast_(\d+)$/;

function collectForecastSeriesIds(chartData: ChartDataPoint[]): number[] {
  const ids = new Set<number>();
  for (const row of chartData) {
    for (const key of Object.keys(row)) {
      const m = key.match(FORECAST_KEY_RE);
      if (m) ids.add(Number(m[1]));
    }
  }
  return [...ids].sort((a, b) => a - b);
}

function forecastSeriesKey(id: number): string {
  return `forecast_${id}`;
}

function hasForecastValue(point: ChartDataPoint, id: number): boolean {
  const v = point[forecastSeriesKey(id)];
  return v !== null && v !== undefined && typeof v === 'number';
}

/**
 * Injects `forecast_{id}` on the row before each series’ first forecast month (historical value)
 * so dashed forecast lines meet the historical line. Matches sybilion-client bridge behavior.
 * Never overwrites an existing forecast value on that row.
 */
export function ensureChartForecastBridge(
  chartData: ChartDataPoint[],
  options?: EnsureChartForecastBridgeOptions,
): ChartDataPoint[] {
  if (options?.disabled || chartData.length === 0) {
    return chartData;
  }

  const sorted = [...chartData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const seriesIds = options?.forecastSeriesIds?.length
    ? [...options.forecastSeriesIds]
    : collectForecastSeriesIds(sorted);

  if (seriesIds.length === 0) {
    return sorted;
  }

  const rows = sorted.map(p => ({ ...p }));

  for (const id of seriesIds) {
    const dataKey = forecastSeriesKey(id);
    let firstForecastDate: string | null = null;
    for (const row of rows) {
      if (hasForecastValue(row, id)) {
        firstForecastDate = row.date;
        break;
      }
    }
    if (!firstForecastDate) continue;

    const prevMonthNorm = normalizeToMonthStart(
      getPreviousMonth(firstForecastDate),
    );

    const prevMonthIdx = rows.findIndex(
      row => normalizeToMonthStart(row.date) === prevMonthNorm,
    );

    if (prevMonthIdx >= 0) {
      const existing = rows[prevMonthIdx][dataKey];
      const hPrev = rows[prevMonthIdx].historical;
      if (
        (existing === undefined || existing === null) &&
        hPrev !== undefined &&
        hPrev !== null
      ) {
        rows[prevMonthIdx] = {
          ...rows[prevMonthIdx],
          [dataKey]: hPrev,
        };
      }
    }

    const lastHist = findLastValidHistoricalChartPoint(rows);
    if (!lastHist) continue;

    const normLast = normalizeToMonthStart(lastHist.date);
    const normFirst = normalizeToMonthStart(firstForecastDate);
    if (normLast >= normFirst) continue;

    const idxLast = rows.findIndex(r => r.date === lastHist.date);
    if (idxLast < 0) continue;

    const existingAtLast = rows[idxLast][dataKey];
    if (existingAtLast !== undefined && existingAtLast !== null) continue;

    const hLast = rows[idxLast].historical;
    if (hLast !== undefined && hLast !== null) {
      rows[idxLast] = { ...rows[idxLast], [dataKey]: hLast };
    }
  }

  return rows;
}

/**
 * Find the last valid historical data point (filtering out null/undefined values)
 */
export function findLastValidHistoricalPoint(
  historical: TimeSeriesPoint[],
): TimeSeriesPoint | null {
  const validPoints = historical.filter(
    ([, value]) => value !== null && value !== undefined,
  );
  return validPoints.length > 0 ? validPoints[validPoints.length - 1] : null;
}

/**
 * Find the last valid historical data point from ChartDataPoint array
 */
export function findLastValidHistoricalChartPoint(
  historical: ChartDataPoint[],
): ChartDataPoint | null {
  const validPoints = historical.filter(
    point => point.historical !== null && point.historical !== undefined,
  );
  return validPoints.length > 0 ? validPoints[validPoints.length - 1] : null;
}

/**
 * Check if two dates are in the same month (ignoring day)
 */
export function isSameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
}

/**
 * Normalize date to first day of month for comparison (YYYY-MM-01)
 */
export function normalizeToMonthStart(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Find the earliest date from forecast_series keys
 * This represents the first forecast date
 */
export function findEarliestForecastDate(
  forecastSeries: Record<string, unknown>,
): string | null {
  const dates = Object.keys(forecastSeries).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  return dates.length > 0 ? dates[0] : null;
}

/**
 * Find the latest date from forecast_series keys
 * This represents the last forecast date
 */
export function findLatestForecastDate(
  forecastSeries: Record<string, unknown>,
): string | null {
  const dates = Object.keys(forecastSeries).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  return dates.length > 0 ? dates[dates.length - 1] : null;
}

/**
 * Get the previous month date (first day of previous month)
 */
export function getPreviousMonth(date: string): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get the next month date (first day of next month)
 */
export function getNextMonth(date: string): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Ensure forecast data includes a connection point at the previous month before the first forecast
 * This ensures visual continuity without overwriting actual forecast values
 *
 * We don't use last_valid_data_index - we derive the connection point directly from the forecast data:
 * 1. Find the earliest date from forecast_series (first forecast date)
 * 2. Get the previous month (connection point date)
 * 3. Add connection point at that date with the historical value from that month
 */
export function ensureForecastConnectionPoint(
  forecast: SeriesForecastData,
  historical: TimeSeriesPoint[],
): SeriesForecastData {
  const newForecast = structuredClone(forecast);
  const forecastDates = Object.keys(newForecast.forecast_series).sort();

  // Find last valid historical point
  const lastHistorical = findLastValidHistoricalPoint(historical);
  if (!lastHistorical) {
    return newForecast;
  }

  const [lastHistoricalDate, lastHistoricalValue] = lastHistorical;

  // Determine the connection point date
  // Find the earliest date from forecast_series (first forecast date)
  const earliestForecastDate = findEarliestForecastDate(
    newForecast.forecast_series,
  );

  if (!earliestForecastDate) {
    // No forecast dates found, nothing to connect
    return newForecast;
  }

  // Use the month before the first forecast date as connection point
  const connectionDate = getPreviousMonth(earliestForecastDate);

  // Normalize dates for comparison
  const normalizedConnectionDate = normalizeToMonthStart(connectionDate);
  const normalizedLastHistorical = normalizeToMonthStart(lastHistoricalDate);

  // Only add connection point if it's at the last historical month
  // and doesn't overwrite an actual forecast value
  if (normalizedConnectionDate === normalizedLastHistorical) {
    // Check if this date already exists in forecast_series
    const existingForecastDate = forecastDates.find(date =>
      isSameMonth(date, connectionDate!),
    );

    if (existingForecastDate) {
      // If forecast already has this date, preserve the forecast value
      // and only add connection if dates don't match exactly
      if (existingForecastDate !== connectionDate) {
        // Add connection point at exact historical date
        newForecast.forecast_series[connectionDate] = {
          forecast: lastHistoricalValue,
          // Preserve existing properties if any
          ...newForecast.forecast_series[existingForecastDate],
        };
      }
      // If dates match exactly, don't overwrite - the forecast value should be preserved
    } else {
      // No existing forecast at this date, safe to add connection point
      newForecast.forecast_series[connectionDate] = {
        forecast: lastHistoricalValue,
      };
    }
  }

  // Sort forecast series by date
  const sortedSeries = Object.keys(newForecast.forecast_series)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .reduce(
      (acc, key) => {
        acc[key] = newForecast.forecast_series[key];
        return acc;
      },
      {} as typeof newForecast.forecast_series,
    );

  newForecast.forecast_series = sortedSeries;
  return newForecast;
}
