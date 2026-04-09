import {
  findEarliestForecastDate,
  findLastValidHistoricalPoint,
  getPreviousMonth,
  normalizeToMonthStart,
} from '@/utils/chartConnectionPoint';

import type {
  ChartDataPoint,
  ForecastData,
  TimeSeriesPoint,
} from './ChartForecast.types';

/**
 * Add connection point between historical and forecast data at the previous month before first forecast.
 * Ensures visual continuity without overwriting forecast values.
 */
export const addConnectionPoint = (
  forecast: ForecastData,
  historical: TimeSeriesPoint[],
): ForecastData => {
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

  // Find the historical value for the connection date (previous month)
  // We need to find the historical point that matches the connection date month
  const normalizedConnectionDate = normalizeToMonthStart(connectionDate);
  const historicalPointForConnection = historical.find(([date]) => {
    const normalizedDate = normalizeToMonthStart(date);
    return normalizedDate === normalizedConnectionDate;
  });

  if (!historicalPointForConnection) {
    // No historical data for connection month, can't add connection point
    return newForecast;
  }

  const [, historicalValueForConnection] = historicalPointForConnection;

  // Check if any forecast date matches the connection date (same month or exact date)
  const normalizedEarliestForecast =
    normalizeToMonthStart(earliestForecastDate);
  const existingForecastInSameMonth = forecastDates.find(date => {
    const normalizedForecastDate = normalizeToMonthStart(date);
    return normalizedForecastDate === normalizedConnectionDate;
  });

  if (existingForecastInSameMonth) {
    // If forecast already has a point in the connection month
    if (existingForecastInSameMonth === connectionDate) {
      // Same exact date - DON'T overwrite the forecast value
      // The forecast value should be preserved, connection handled visually
      return newForecast;
    } else {
      // Different date in same month (e.g., forecast is "2025-11-27", connection is "2025-10-01")
      // Add connection point at exact connection date, preserving forecast at its date
      newForecast.forecast_series[connectionDate] = {
        forecast: historicalValueForConnection,
      };
    }
  } else {
    // No forecast in connection month, safe to add connection point
    newForecast.forecast_series[connectionDate] = {
      forecast: historicalValueForConnection,
    };
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
};

/**
 * Transform historical and forecast data into Recharts format
 */
export const transformToChartData = (
  historical: TimeSeriesPoint[],
  forecast: ForecastData,
  horizon: '6m' | '12m' | '24m' = '24m',
): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];

  // Find earliest forecast date and connection point
  const earliestForecastDate = findEarliestForecastDate(
    forecast.forecast_series,
  );
  const connectionDate = earliestForecastDate
    ? getPreviousMonth(earliestForecastDate)
    : null;
  const normalizedConnectionDate = connectionDate
    ? normalizeToMonthStart(connectionDate)
    : null;

  // Add historical data points
  historical.forEach(([date, value]) => {
    chartData.push({
      date,
      historical: value,
    });
  });

  // Add ALL original forecast data points FIRST - this preserves all forecast values
  Object.entries(forecast.forecast_series).forEach(([date, values]) => {
    const existingPoint = chartData.find(p => p.date === date);
    const normalizedDate = normalizeToMonthStart(date);

    if (existingPoint) {
      // Point exists from historical data
      // CRITICAL: Always use the forecast value for actual forecast dates
      // Only use historical value if this is the connection point date
      if (connectionDate && date === connectionDate) {
        // This is the connection point - use historical value
        existingPoint.forecast = existingPoint.historical;
      } else {
        // This is an actual forecast date - preserve forecast value
        existingPoint.forecast = values.forecast;
      }
      existingPoint.lower_boundary = values.lower_boundary?.[horizon];
      existingPoint.upper_boundary = values.upper_boundary?.[horizon];
    } else {
      // New point - add forecast data
      chartData.push({
        date,
        forecast: values.forecast,
        lower_boundary: values.lower_boundary?.[horizon],
        upper_boundary: values.upper_boundary?.[horizon],
      });
    }
  });

  // Add connection point if needed (at previous month before first forecast)
  if (connectionDate && normalizedConnectionDate) {
    const connectionPointExists = chartData.find(
      p => p.date === connectionDate,
    );
    const historicalPointForConnection = historical.find(([date]) => {
      const normalizedDate = normalizeToMonthStart(date);
      return normalizedDate === normalizedConnectionDate;
    });

    if (!connectionPointExists && historicalPointForConnection) {
      const [, historicalValue] = historicalPointForConnection;
      // Add connection point at previous month
      chartData.push({
        date: connectionDate,
        historical: historicalValue,
        forecast: historicalValue, // Connection point uses historical value
      });
    }
  }

  // Sort by date
  return chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};

/**
 * Calculate chart x-axis range based on mode
 */
export const calculateXAxisRange = (
  chartData: ChartDataPoint[],
  focused: boolean = false,
): [string, string] => {
  if (chartData.length === 0) {
    return ['', ''];
  }

  const lastHistorical = chartData.findLast(p => p.historical !== undefined);
  const lastDate = chartData[chartData.length - 1];

  if (!lastHistorical) {
    return [chartData[0].date, lastDate.date];
  }

  const lastHistoricalDate = new Date(lastHistorical.date);
  const year = lastHistoricalDate.getFullYear();

  if (focused) {
    return [`${year - 2}-01-01`, `${year + 1}-01-01`];
  }

  return [`${year - 5}-01-01`, `${year + 1}-06-01`];
};
