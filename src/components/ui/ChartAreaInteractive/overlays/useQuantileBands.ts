import { useMemo } from 'react';

import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import { applyQuantileBandConeToChartData } from '#uilib/components/ui/Chart/quantileBandConeChartData';
import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastData } from '#uilib/types/forecast-data';

interface UseQuantileBandOptions {
  color?: string;
  chartData: ChartDataPoint[];
  selectedForecastId?: number;
  forecastData: { [key: string]: ForecastData };
  bandKey: string;
  getBandValues: (
    date: string,
    dateIndex: number,
    allQuantiles: Record<string, number[]>,
  ) => [number, number] | null;
  getBandConfig: (
    bandKey: string,
    forecastColor?: string,
  ) => QuantileBandConfig;
}

/**
 * Hook to transform chart data and create quantile band configuration
 */
export function useQuantileBands({
  color,
  chartData,
  selectedForecastId,
  forecastData,
  bandKey,
  getBandValues,
  getBandConfig,
}: UseQuantileBandOptions) {
  const transformedChartData = useMemo(() => {
    if (
      !selectedForecastId ||
      !forecastData[selectedForecastId]?.allQuantiles
    ) {
      return chartData;
    }

    const forecastDataForSelected = forecastData[selectedForecastId];
    const allQuantilesData = forecastDataForSelected.allQuantiles;
    const clonedData = [...chartData];

    const forecastDates = forecastDataForSelected.dates || [];
    const forecastDatesSet = new Set(forecastDates);

    const dateToQuantileIndex = new Map<string, number>();
    forecastDates.forEach((date, index) => {
      dateToQuantileIndex.set(date, index);
    });

    const withRawBands = clonedData.map(point => {
      const newPoint = { ...point };

      if (forecastDatesSet.has(point.date)) {
        const quantileIndex = dateToQuantileIndex.get(point.date);

        if (quantileIndex !== undefined) {
          const bandValues = getBandValues(
            point.date,
            quantileIndex,
            allQuantilesData,
          );

          if (bandValues) {
            newPoint[bandKey] = bandValues;
          } else {
            delete newPoint[bandKey];
          }
        }
      }

      return newPoint;
    });

    return applyQuantileBandConeToChartData(withRawBands, bandKey);
  }, [chartData, selectedForecastId, forecastData, bandKey, getBandValues]);

  const quantileBands: QuantileBandConfig[] = useMemo(() => {
    if (!selectedForecastId || !forecastData[selectedForecastId]) {
      return [];
    }

    // Get sample values to create config
    const forecastDataForSelected = forecastData[selectedForecastId];
    const forecastDates = forecastDataForSelected.dates || [];
    if (forecastDates.length === 0) return [];

    const allQuantilesData = forecastDataForSelected.allQuantiles;
    if (!allQuantilesData) return [];

    const lastIndex = forecastDates.length - 1;
    const bandValues = getBandValues(
      forecastDates[lastIndex],
      lastIndex,
      allQuantilesData,
    );

    if (!bandValues) return [];

    // const [lowerValue, upperValue] = bandValues;

    return [getBandConfig(bandKey, color)];
  }, [
    selectedForecastId,
    forecastData,
    bandKey,
    getBandValues,
    getBandConfig,
    color,
  ]);

  return {
    transformedChartData,
    quantileBands,
  };
}
