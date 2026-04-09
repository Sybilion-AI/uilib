import {
  findEarliestForecastDate,
  findLastValidHistoricalPoint,
  getPreviousMonth,
  normalizeToMonthStart,
} from '@/utils/chartConnectionPoint';

import { QUANTILE_KEYS } from './ChartForecastProbabilistic.constants';
import type {
  ChartDataPoint,
  ForecastData,
  TimeSeriesPoint,
} from './ChartForecastProbabilistic.types';

/**
 * Transform historical and forecast data to chart format
 * Includes connection point logic to ensure visual continuity
 */
export function transformToChartData(
  historicalData: TimeSeriesPoint[],
  forecastData: ForecastData,
): ChartDataPoint[] {
  const dataMap = new Map<string, ChartDataPoint>();

  // Add historical data
  for (const [date, value] of historicalData) {
    dataMap.set(date, {
      date,
      historical: value,
    });
  }

  // Find last valid historical point for connection
  const lastHistorical = findLastValidHistoricalPoint(historicalData);
  const lastHistoricalDate = lastHistorical?.[0];
  const lastHistoricalValue = lastHistorical?.[1];

  // Add forecast data with quantiles
  const forecastSeries = forecastData.forecast_series;
  const forecastDates = Object.keys(forecastSeries).sort();

  // Determine connection point date
  // Find the earliest date from forecast_series (first forecast date)
  const earliestForecastDate = findEarliestForecastDate(forecastSeries);

  // Use the month before the first forecast date as connection point
  const connectionDate = earliestForecastDate
    ? getPreviousMonth(earliestForecastDate)
    : null;

  // First, add connection point if needed (before processing forecast dates)
  if (
    connectionDate &&
    lastHistoricalDate &&
    lastHistoricalValue !== undefined &&
    lastHistoricalValue !== null
  ) {
    const normalizedConnectionDate = normalizeToMonthStart(connectionDate);
    const normalizedLastHistorical = normalizeToMonthStart(lastHistoricalDate);

    // Only add connection point if it's at the last historical month
    if (normalizedConnectionDate === normalizedLastHistorical) {
      // Check if forecast already has a point in this month
      const existingForecastInSameMonth = forecastDates.find(date => {
        const normalizedForecastDate = normalizeToMonthStart(date);
        return normalizedForecastDate === normalizedConnectionDate;
      });

      if (existingForecastInSameMonth) {
        // If forecast already has this date, preserve the forecast value
        // Connection will be handled visually by having both historical and forecast at same date
        if (existingForecastInSameMonth !== connectionDate) {
          // Different date in same month - add connection point at exact historical date
          const connectionPoint: ChartDataPoint = {
            date: connectionDate,
            forecast: lastHistoricalValue,
          };
          dataMap.set(connectionDate, connectionPoint);
        }
      } else {
        // No forecast in this month, safe to add connection point
        const connectionPoint: ChartDataPoint = {
          date: connectionDate,
          forecast: lastHistoricalValue,
        };
        dataMap.set(connectionDate, connectionPoint);
      }
    }
  }

  // Process all forecast dates - this preserves original forecast values
  for (const date of forecastDates) {
    const point = forecastSeries[date];

    // Get existing data point or create new one
    const existing = dataMap.get(date);
    const dataPoint: ChartDataPoint = existing || { date };

    // Always set forecast value - this ensures original values are preserved
    dataPoint.forecast = point.forecast;

    // Map quantile_forecast to chart data keys
    if (point.quantile_forecast) {
      for (const [quantile, value] of Object.entries(point.quantile_forecast)) {
        const key = QUANTILE_KEYS[quantile as keyof typeof QUANTILE_KEYS];
        if (key) {
          dataPoint[key] = value;
        }
      }

      // Create band ranges as [lower, upper] arrays for Recharts Area component
      const q10 = dataPoint.q10;
      const q15 = dataPoint.q15;
      const q25 = dataPoint.q25;
      const q75 = dataPoint.q75;
      const q85 = dataPoint.q85;
      const q90 = dataPoint.q90;

      if (q10 !== undefined && q90 !== undefined) {
        dataPoint.band_10_90 = [q10, q90];
      }
      if (q15 !== undefined && q85 !== undefined) {
        dataPoint.band_15_85 = [q15, q85];
      }
      if (q25 !== undefined && q75 !== undefined) {
        dataPoint.band_25_75 = [q25, q75];
      }
    }

    dataMap.set(date, dataPoint);
  }

  // Sort by date
  return Array.from(dataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

/**
 * Calculate X-axis range for focused/full view
 */
export function calculateXAxisRange(
  chartData: ChartDataPoint[],
  focused: boolean,
): [number, number] {
  if (!chartData.length) return [0, 1];

  const firstDate = new Date(chartData[0].date).getTime();
  const lastDate = new Date(chartData[chartData.length - 1].date).getTime();

  if (focused) {
    // Show last 24 months + forecast
    const focusDate = lastDate - 24 * 30 * 24 * 60 * 60 * 1000;
    return [Math.max(firstDate, focusDate), lastDate];
  }

  return [firstDate, lastDate];
}

/**
 * Get quantile value from data point by quantile string
 */
export function getQuantileValue(
  point: ChartDataPoint,
  quantile: string,
): number | undefined {
  const key = QUANTILE_KEYS[quantile as keyof typeof QUANTILE_KEYS];
  return key ? point[key] : undefined;
}
