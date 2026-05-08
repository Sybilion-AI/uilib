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

function isPlottableNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Any row the chart can draw a number for (excludes date-only or empty rows) */
function hasPlottableChartSeriesValue(item: ChartDataPoint): boolean {
  for (const [key, v] of Object.entries(item)) {
    if (key === 'date') continue;
    if (isPlottableNumber(v)) return true;
    if (Array.isArray(v) && v.some(x => isPlottableNumber(x))) {
      return true;
    }
  }
  return false;
}

/**
 * Row counts toward the "end" of the window when anchoring the time range to a
 * selected forecast (shared historical + that analysis line / quantiles).
 */
function rowContributesToAnchoredTimeRange(
  item: ChartDataPoint,
  analysisId: number,
): boolean {
  if (isPlottableNumber(item.historical)) {
    return true;
  }
  const forecastKey = `forecast_${analysisId}`;
  if (isPlottableNumber(item[forecastKey])) {
    return true;
  }
  for (const key of Object.keys(item)) {
    if (key.startsWith('q') && key.endsWith(`_${analysisId}`)) {
      if (isPlottableNumber(item[key])) {
        return true;
      }
    }
  }
  return false;
}

function computeLatestPlottableDate(
  data: ChartDataPoint[],
  options?: { endDateAnchorAnalysisId?: number | null },
): Date | null {
  const anchorId = options?.endDateAnchorAnalysisId;

  const pick = (item: ChartDataPoint, useAnchor: boolean): Date | null => {
    if (!item.date) return null;
    if (useAnchor && anchorId != null) {
      if (!rowContributesToAnchoredTimeRange(item, anchorId)) {
        return null;
      }
    } else if (!hasPlottableChartSeriesValue(item)) {
      return null;
    }
    return new Date(item.date);
  };

  let latest: Date | null = null;
  for (const item of data) {
    const d = pick(item, true);
    if (d && (!latest || d > latest)) {
      latest = d;
    }
  }

  if (latest == null && anchorId != null) {
    for (const item of data) {
      const d = pick(item, false);
      if (d && (!latest || d > latest)) {
        latest = d;
      }
    }
  }

  return latest;
}

export type FilterDataForTimeRangeOptions = {
  /** When set (e.g. selected forecast on Forecast tab), the window ends at the
   *  latest point that has shared historical or that analysis — not at another run. */
  endDateAnchorAnalysisId?: number | null;
};

export const filterDataForTimeRange = (
  data: ChartDataPoint[],
  currentTimeRange: TimeRange,
  options?: FilterDataForTimeRangeOptions,
) => {
  if (currentTimeRange === 'All') return data;

  const latestDate = computeLatestPlottableDate(data, options);

  // Pre-compute start date based on latest date in data
  let startDate: Date | null = null;
  if (latestDate) {
    const monthsToSubtract =
      timeRangeToMonths[currentTimeRange] || timeRangeToMonths.All;
    startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);
  }

  // Slice by date for every row. Rows with forecast_* keys must not bypass the
  // window (e.g. spaghetti plots), or the X range stays stuck at full history.
  const filteredData = data.filter(item => {
    if (!item.date) return false;
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
