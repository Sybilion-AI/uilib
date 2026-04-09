import type { Analysis, ChartDataPoint } from './ChartAreaInteractive.types';

// Helper function to format large numbers with k/m abbreviations
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return value.toFixed(0);
};

// Find pin position for a specific date in the current filtered data
export const findPinPositionForDate = (
  targetDate: string,
  filteredData: ChartDataPoint[],
) => {
  if (!filteredData.length) return 0;

  const targetDateObj = new Date(targetDate);
  let closestIndex = 0;
  let minDistance = Infinity;

  // First, try to find an exact match
  const exactMatch = filteredData.findIndex(
    dataPoint =>
      dataPoint.date &&
      new Date(dataPoint.date).getTime() === targetDateObj.getTime(),
  );

  if (exactMatch !== -1) {
    return (exactMatch / (filteredData.length - 1)) * 100;
  }

  // If no exact match, find the closest date
  filteredData.forEach((dataPoint, index) => {
    if (dataPoint.date) {
      const pointDate = new Date(dataPoint.date);
      const distance = Math.abs(pointDate.getTime() - targetDateObj.getTime());
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    }
  });

  // If the target date is outside the current range, clamp to the nearest edge
  const firstDate = new Date(filteredData[0].date);
  const lastDate = new Date(filteredData[filteredData.length - 1].date);

  if (targetDateObj < firstDate) {
    return 0; // Pin at the beginning
  } else if (targetDateObj > lastDate) {
    return 100; // Pin at the end
  }

  return (closestIndex / (filteredData.length - 1)) * 100;
};

const timeRangeToMonths = {
  '6m': 6,
  '1y': 12,
  '3y': 36,
  '5y': 60,
  All: 12,
} as const;

export type TimeRange = keyof typeof timeRangeToMonths;

export const filterDataForTimeRange = (
  data: ChartDataPoint[],
  currentTimeRange: TimeRange,
  availableAnalyses: number[],
) => {
  if (currentTimeRange === 'All') return data;

  // Find the latest date in the data
  const latestDate = data.reduce(
    (latest, item) => {
      if (!item.date) return latest;
      const itemDate = new Date(item.date);
      return !latest || itemDate > latest ? itemDate : latest;
    },
    null as Date | null,
  );

  // Pre-compute start date based on latest date in data
  let startDate: Date | null = null;
  if (latestDate) {
    const monthsToSubtract =
      timeRangeToMonths[currentTimeRange] || timeRangeToMonths.All;
    startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);
  }

  // Create a Set for faster lookup when there are many analyses
  const forecastKeyPrefix = 'forecast_';
  const hasManyAnalyses = availableAnalyses.length > 10;
  const hasAnalyses = availableAnalyses.length > 0;
  const forecastKeysSet = hasManyAnalyses
    ? new Set(availableAnalyses.map(id => `${forecastKeyPrefix}${id}`))
    : null;

  const filteredData = data.filter(item => {
    if (hasAnalyses) {
      // Optimize forecast data check for many analyses
      let hasForecastData = false;
      if (hasManyAnalyses && forecastKeysSet) {
        // Check if any forecast key exists in the item
        hasForecastData = Object.keys(item).some(key =>
          forecastKeysSet.has(key),
        );
      } else {
        // Original approach for small number of analyses
        hasForecastData = availableAnalyses.some(
          analysisId => item[`forecast_${analysisId}`] !== undefined,
        );
      }

      if (hasForecastData) {
        return true;
      }
    }

    // For historical data, apply time range filtering
    if (startDate) {
      const date = new Date(item.date);
      return date >= startDate;
    }

    return true;
  });
  return filteredData;
};

export const shortDateFormatter = (value: string) => {
  return new Date(value as string).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
};

export const longDateFormatter = (value: string) => {
  return new Date(value as string).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Checks if an analysis status is 'fail' (case-insensitive).
 * @param analysis - The analysis object with optional status field
 * @returns true if status is 'fail', false otherwise
 */
export const isAnalysisFailed = (
  analysis: Analysis | { status?: string },
): boolean => {
  return analysis.status?.toLowerCase() === 'fail';
};

/**
 * Checks if an analysis status is not 'fail' (case-insensitive).
 * @param analysis - The analysis object with optional status field
 * @returns true if status is not 'fail', false otherwise
 */
export const isAnalysisNotFailed = (
  analysis: Analysis | { status?: string },
): boolean => !isAnalysisFailed(analysis);
