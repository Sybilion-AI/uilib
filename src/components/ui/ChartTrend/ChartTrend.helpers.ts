import type {
  ChartDataPoint,
  MeanCPDData,
  TimeSeriesPoint,
  TrendAnnotation,
  TrendBoundary,
} from './ChartTrend.types';

/**
 * Filter historical data to show only recent years
 */
export const filterHistoricalByYears = (
  historical: TimeSeriesPoint[],
  years: number,
): TimeSeriesPoint[] => {
  if (!historical.length) return [];

  const lastDate = new Date(historical[historical.length - 1][0]);
  const cutoffDate = new Date(lastDate);
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

  return historical.filter(([date]) => new Date(date) >= cutoffDate);
};

/**
 * Transform historical and CPD data into Recharts format
 */
export const transformToChartData = (
  historical: TimeSeriesPoint[],
  meanCPD: MeanCPDData,
  restricted: boolean = false,
): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];

  // Add historical data points
  historical.forEach(([date, value]) => {
    chartData.push({
      date,
      historical: value,
    });
  });

  // Add historical average line from CPD
  if (meanCPD.change_points.length > 0) {
    const cpd = meanCPD.change_points[0];
    cpd.prev_period_est.forEach(([date, value]) => {
      const existingPoint = chartData.find(p => p.date === date);
      if (existingPoint) {
        existingPoint.historical_avg = value;
      } else {
        chartData.push({
          date,
          historical_avg: value,
        });
      }
    });
  }

  // Sort by date
  return chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};

/**
 * Calculate trend boundaries for visualization
 */
export const calculateTrendBoundaries = (
  meanCPD: MeanCPDData,
  historical: TimeSeriesPoint[],
  restricted: boolean = false,
): TrendBoundary | null => {
  if (!meanCPD.change_points.length) return null;

  const cpd = meanCPD.change_points[0];
  const sensitivity = meanCPD.cpd_metrics.sensitivity_threshold;
  const prevCoef = cpd.prev_coef[0];

  const upperBoundary = prevCoef + sensitivity;
  const lowerBoundary = prevCoef - sensitivity;

  // Get x-axis dates (historical end + forecast period)
  const lastHistoricalDate =
    cpd.prev_period_est[cpd.prev_period_est.length - 1][0];
  const dates = [lastHistoricalDate, ...cpd.next_period_est.map(p => p[0])];

  // Apply restriction if needed
  const historicalAmplitude =
    Math.max(...historical.map(p => p[1])) -
    Math.min(...historical.map(p => p[1]));

  const finalLower =
    restricted && lowerBoundary < historicalAmplitude * 0.01
      ? historicalAmplitude * 0.01
      : lowerBoundary;

  // Determine color based on sign
  const sign = cpd.sign;
  let color = '#8c8c8c'; // neutral
  if (sign > 0) color = '#77d400'; // positive
  if (sign < 0) color = '#fc512b'; // negative

  return {
    dates,
    lower: dates.map(() => finalLower),
    upper: dates.map(() => upperBoundary),
    color,
  };
};

/**
 * Generate annotations for trend visualization
 */
export const generateAnnotations = (
  meanCPD: MeanCPDData,
  boundaries: TrendBoundary,
): TrendAnnotation[] => {
  if (!meanCPD.change_points.length || !boundaries) return [];

  const annotations: TrendAnnotation[] = [];
  const cpd = meanCPD.change_points[0];
  const sign = cpd.sign;
  const sensitivity = meanCPD.cpd_metrics.sensitivity_threshold;

  const lastDate = boundaries.dates[boundaries.dates.length - 1];
  const upperValue = boundaries.upper[0];
  const lowerValue = boundaries.lower[0];
  const midValue = (upperValue + lowerValue) / 2;

  if (sign === 0) {
    // Neutral trend - main area and two risk areas
    const thresholdPercentage = meanCPD.cpd_metrics.fc_metrics.recall;
    const remnantPercentage = (1 - thresholdPercentage) / 2;

    annotations.push({
      x: lastDate,
      y: midValue,
      text: `Main Trend ${Math.min(98, Math.round(thresholdPercentage * 100))}%`,
      color: '#8c8c8c',
    });

    annotations.push({
      x: lastDate,
      y: upperValue + sensitivity / 2,
      text: `Risk ${Math.max(1, Math.round(remnantPercentage * 100))}%`,
      color: '#77d400',
    });

    annotations.push({
      x: lastDate,
      y: lowerValue - sensitivity / 2,
      text: `Risk ${Math.max(1, Math.round(remnantPercentage * 100))}%`,
      color: '#fc512b',
    });
  } else {
    // Directional trend
    const ignoreNoise =
      meanCPD.cpd_metrics.consistency_metrics.fc_ignore_noise_class;
    const remnantPercentage = 1 - ignoreNoise;

    const mainColor = sign > 0 ? '#77d400' : '#fc512b';
    const riskColor = sign > 0 ? '#fc512b' : '#77d400';

    annotations.push({
      x: lastDate,
      y:
        sign > 0
          ? upperValue + sensitivity * 0.1
          : lowerValue - sensitivity * 0.1,
      text: `Main Trend ${Math.min(98, Math.round(ignoreNoise * 100))}%`,
      color: mainColor,
    });

    annotations.push({
      x: lastDate,
      y:
        sign > 0
          ? lowerValue - sensitivity * 0.1
          : upperValue + sensitivity * 0.1,
      text: `Risk ${Math.max(2, Math.round(remnantPercentage * 100))}%`,
      color: riskColor,
    });
  }

  return annotations;
};

/**
 * Calculate chart Y-axis range
 */
export const calculateYAxisRange = (
  historical: TimeSeriesPoint[],
  boundaries?: TrendBoundary | null,
  restricted: boolean = false,
): [number, number] => {
  if (!historical.length) return [0, 100];

  const values = historical.map(p => p[1]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const diff = max - min;

  let lower = min - diff * 0.1;
  let upper = max + diff * 0.1;

  if (boundaries) {
    const boundaryMin = Math.min(...boundaries.lower);
    const boundaryMax = Math.max(...boundaries.upper);
    lower = Math.min(lower, boundaryMin - diff * 0.1);
    upper = Math.max(upper, boundaryMax + diff * 0.1);
  }

  if (restricted && lower < 0) {
    lower = 0;
  }

  return [lower, upper];
};

/**
 * Format number for display
 */
export const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return value.toFixed(0);
};

/**
 * Format date for display
 */
export const formatDate = (dateStr: string, long: boolean = false): string => {
  const date = new Date(dateStr);
  if (long) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
};
