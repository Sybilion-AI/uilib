import { useMemo, useRef } from 'react';

import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

interface UseChartYRangeOptions {
  baseChartProps: BaseChartWrapperProps;
  chartData?: ChartDataPoint[];
  disableRescaleWhenQuantileChanges?: boolean;
  excludeQuantileBands?: boolean;
  selectedForecastId?: number;
}

export interface CalculateChartYRangeOptions {
  excludeQuantileBands: boolean;
  forecastId?: number;
  hiddenSeries?: Set<string>;
  includeHiddenInYScale?: boolean;
}

/** Serialize hidden series keys for stable cache comparison. */
function serializeHiddenSeries(hiddenSeries?: Set<string>): string {
  if (!hiddenSeries || hiddenSeries.size === 0) return '';
  return [...hiddenSeries].sort().join(',');
}

/**
 * Returns true when a chart data key should be skipped for Y-scale (series hidden).
 */
export function isKeyExcludedFromYScale(
  key: string,
  hiddenSeries?: Set<string>,
): boolean {
  if (!hiddenSeries || hiddenSeries.size === 0) return false;

  if (key === 'historical') {
    return hiddenSeries.has('historical');
  }

  if (key.startsWith('forecast_')) {
    return hiddenSeries.has(key);
  }

  if (key.startsWith('q') && key.includes('_')) {
    const forecastId = key.slice(key.lastIndexOf('_') + 1);
    return hiddenSeries.has(`forecast_${forecastId}`);
  }

  if (key.startsWith('band_')) {
    const forecastId = key.slice(key.lastIndexOf('_') + 1);
    return hiddenSeries.has(`forecast_${forecastId}`);
  }

  return false;
}

/** Pure Y-range calculation from chart data points. */
export function calculateChartYRange(
  dataToUse: ChartDataPoint[],
  {
    excludeQuantileBands,
    forecastId,
    hiddenSeries,
    includeHiddenInYScale = false,
  }: CalculateChartYRangeOptions,
) {
  const allValues: number[] = [];

  dataToUse.forEach(point => {
    Object.entries(point).forEach(([key, value]) => {
      if (key === 'date') return;

      if (
        !includeHiddenInYScale &&
        isKeyExcludedFromYScale(key, hiddenSeries)
      ) {
        return;
      }

      // When selectedForecastId is provided, scale from historical + selected forecast + its
      // quantile band (exclude other forecasts and their quantile values only).
      if (forecastId !== undefined) {
        if (key.startsWith('forecast_') && key !== `forecast_${forecastId}`)
          return;
        // Exclude q{quantile}_{otherAnalysisId} - only include selected forecast's quantiles
        if (key.startsWith('q') && !key.endsWith(`_${forecastId}`)) return;
      }

      // When excludeQuantileBands is true, exclude:
      // 1. Quantile band arrays ([number, number])
      // 2. Individual quantile values (q{quantile}_{analysisId} properties)
      // Only include historical and forecast line values
      if (excludeQuantileBands) {
        // Skip quantile band arrays
        if (
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === 'number' &&
          typeof value[1] === 'number'
        ) {
          return;
        }

        // Skip individual quantile values (properties starting with 'q' followed by number/underscore)
        // Format: q{quantile}_{analysisId} (e.g., q0.05_123, q0.95_123)
        if (key.startsWith('q') && typeof value === 'number') {
          return;
        }

        // Include only historical and forecast line values
        if (typeof value === 'number') {
          allValues.push(value);
        }
        return;
      }

      // When not excluding, include both numbers and quantile band arrays
      if (typeof value === 'number') {
        allValues.push(value);
      } else if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
      ) {
        allValues.push(value[0], value[1]);
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

/**
 * Hook to calculate yMin and yMax from chart data
 * Optionally includes quantile values from forecast data
 */
export function useChartYRange({
  baseChartProps,
  chartData,
  disableRescaleWhenQuantileChanges,
  excludeQuantileBands = false,
  selectedForecastId,
}: UseChartYRangeOptions) {
  const includeHiddenInYScale = baseChartProps.includeHiddenInYScale ?? false;
  const hiddenSeries = baseChartProps.hiddenSeries;

  // Store initial Y-range when disableRescaleWhenQuantileChanges is true
  const stableYRangeRef = useRef<{
    yMin: number;
    yMax: number;
    forecastId?: number;
  } | null>(null);
  const prevBaseChartDataRef = useRef(baseChartProps.chartData);
  const prevHiddenSeriesKeyRef = useRef(serializeHiddenSeries(hiddenSeries));

  const calculateYRange = (
    dataToUse: ChartDataPoint[],
    excludeBands: boolean,
    forecastId?: number,
  ) =>
    calculateChartYRange(dataToUse, {
      excludeQuantileBands: excludeBands,
      forecastId,
      hiddenSeries,
      includeHiddenInYScale,
    });

  // When disableRescaleWhenQuantileChanges is true, calculate initial stable range
  // If chartData (transformedChartData) is provided, use it WITH quantile bands for initial calculation
  // Then keep it stable when dragging quantiles
  const stableRange = useMemo(() => {
    if (
      baseChartProps.yMin !== undefined &&
      baseChartProps.yMax !== undefined
    ) {
      return {
        yMin: baseChartProps.yMin,
        yMax: baseChartProps.yMax,
      };
    }

    if (!disableRescaleWhenQuantileChanges) {
      return null;
    }

    // Reset stable range when dataset, selected forecast, or hidden series changes
    if (prevBaseChartDataRef.current !== baseChartProps.chartData) {
      prevBaseChartDataRef.current = baseChartProps.chartData;
      stableYRangeRef.current = null;
    }
    if (stableYRangeRef.current?.forecastId !== selectedForecastId) {
      stableYRangeRef.current = null;
    }
    const hiddenSeriesKey = serializeHiddenSeries(hiddenSeries);
    if (prevHiddenSeriesKeyRef.current !== hiddenSeriesKey) {
      prevHiddenSeriesKeyRef.current = hiddenSeriesKey;
      stableYRangeRef.current = null;
    }

    // If chartData (transformedChartData) is provided, use it WITH quantile bands for initial calculation
    // This ensures IntervalsOverlay includes quantile bands in Y-scale
    const dataToUse = chartData ?? baseChartProps.chartData;
    const shouldExcludeQuantileBands = chartData
      ? false // Include quantile bands when using transformedChartData
      : excludeQuantileBands || true; // Exclude when using baseChartProps.chartData

    const result = calculateYRange(
      dataToUse,
      shouldExcludeQuantileBands,
      selectedForecastId,
    );

    // Store in ref on first calculation or after dataset/forecast change
    if (!stableYRangeRef.current) {
      stableYRangeRef.current = {
        ...result,
        forecastId: selectedForecastId,
      };
    }

    return result;
  }, [
    baseChartProps.yMin,
    baseChartProps.yMax,
    baseChartProps.chartData,
    chartData,
    disableRescaleWhenQuantileChanges,
    excludeQuantileBands,
    selectedForecastId,
    hiddenSeries,
    includeHiddenInYScale,
  ]);

  // When disableRescaleWhenQuantileChanges is false, calculate from transformed data
  const dynamicRange = useMemo(() => {
    if (
      baseChartProps.yMin !== undefined &&
      baseChartProps.yMax !== undefined
    ) {
      return {
        yMin: baseChartProps.yMin,
        yMax: baseChartProps.yMax,
      };
    }

    if (disableRescaleWhenQuantileChanges) {
      return null;
    }

    const dataToUse = chartData ?? baseChartProps.chartData;
    return calculateYRange(dataToUse, excludeQuantileBands, selectedForecastId);
  }, [
    baseChartProps.yMin,
    baseChartProps.yMax,
    baseChartProps.chartData,
    chartData,
    disableRescaleWhenQuantileChanges,
    excludeQuantileBands,
    selectedForecastId,
    hiddenSeries,
    includeHiddenInYScale,
  ]);

  // Return appropriate range
  if (disableRescaleWhenQuantileChanges) {
    const cached = stableYRangeRef.current;
    const cachedMatchesForecast =
      cached && cached.forecastId === selectedForecastId;
    return cachedMatchesForecast
      ? { yMin: cached!.yMin, yMax: cached!.yMax }
      : (stableRange ?? { yMin: 0, yMax: 100 });
  }

  return dynamicRange;
}
