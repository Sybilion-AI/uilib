import { useMemo } from 'react';

import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
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

    // Get forecast dates to map quantile array indices correctly
    const forecastDates = forecastDataForSelected.dates || [];
    const forecastDatesSet = new Set(forecastDates);

    // Find the last historical point for connection
    const historicalPoints = clonedData.filter(
      point => point.historical !== undefined,
    );
    const lastHistoricalPoint =
      historicalPoints.length > 0
        ? historicalPoints[historicalPoints.length - 1]
        : null;
    const lastHistoricalDate = lastHistoricalPoint?.date;
    const lastHistoricalValue = lastHistoricalPoint?.historical;

    // Get first forecast date
    const firstForecastDate = forecastDates[0];
    const firstForecastDateObj = firstForecastDate
      ? new Date(firstForecastDate)
      : null;
    const lastHistoricalDateObj = lastHistoricalDate
      ? new Date(lastHistoricalDate)
      : null;

    // Check if there's a gap between historical and forecast data (forecast starts after historical)
    const hasGap =
      lastHistoricalDate &&
      firstForecastDate &&
      lastHistoricalValue !== undefined &&
      firstForecastDateObj &&
      lastHistoricalDateObj &&
      firstForecastDateObj.getTime() > lastHistoricalDateObj.getTime();

    // Check if forecast starts before or at last historical point (need bridge point)
    const needsBridgePoint =
      lastHistoricalDate &&
      firstForecastDate &&
      lastHistoricalValue !== undefined &&
      firstForecastDateObj &&
      lastHistoricalDateObj &&
      firstForecastDateObj.getTime() <= lastHistoricalDateObj.getTime();

    // Find bridge point when forecast starts before or at last historical point
    let bridgePoint = null;
    let pointBeforeForecast = null;
    if (needsBridgePoint && historicalPoints.length > 0) {
      // Find the last historical point before or at the first forecast date
      // If dates are equal, use lastHistoricalPoint; otherwise find the point before
      bridgePoint =
        firstForecastDateObj &&
        lastHistoricalDateObj &&
        firstForecastDateObj.getTime() === lastHistoricalDateObj.getTime()
          ? lastHistoricalPoint
          : [...historicalPoints]
              .reverse()
              .find(
                p =>
                  firstForecastDateObj &&
                  new Date(p.date).getTime() < firstForecastDateObj.getTime(),
              ) || lastHistoricalPoint;

      // Find the actual point BEFORE the first forecast date for connection
      if (firstForecastDateObj) {
        pointBeforeForecast = [...historicalPoints].findLast(
          p => new Date(p.date).getTime() < firstForecastDateObj.getTime(),
        );
      }
    }

    // Create a map from date to quantile array index
    const dateToQuantileIndex = new Map<string, number>();
    forecastDates.forEach((date, index) => {
      dateToQuantileIndex.set(date, index);
    });

    const result = clonedData.map(point => {
      const newPoint = { ...point };

      // If there's a gap and this is the last historical point, add band data for connection
      if (
        hasGap &&
        point.date === lastHistoricalDate &&
        lastHistoricalValue !== undefined
      ) {
        // Set zero-width band at the last historical value for visual connection
        newPoint[bandKey] = [lastHistoricalValue, lastHistoricalValue] as [
          number,
          number,
        ];
      }

      // If forecast starts before or at last historical point, add bridge point connection
      // Set connection band at the point BEFORE the first forecast date (if exists)
      const isBridgePointDate =
        needsBridgePoint &&
        bridgePoint &&
        bridgePoint.historical !== undefined &&
        point.date === bridgePoint.date;
      const isPointBeforeForecast =
        needsBridgePoint &&
        pointBeforeForecast &&
        pointBeforeForecast.historical !== undefined &&
        point.date === pointBeforeForecast.date;
      const isAlsoForecastDate = forecastDatesSet.has(point.date);

      // Set zero-width connection band at the point BEFORE forecast starts
      if (isPointBeforeForecast && !isAlsoForecastDate) {
        newPoint[bandKey] = [
          pointBeforeForecast.historical,
          pointBeforeForecast.historical,
        ] as [number, number];
      } else if (isBridgePointDate && !isAlsoForecastDate) {
        // Fallback: if no point before forecast, use bridge point
        newPoint[bandKey] = [
          bridgePoint.historical,
          bridgePoint.historical,
        ] as [number, number];
      }

      // Only update band data for forecast dates
      if (forecastDatesSet.has(point.date)) {
        const quantileIndex = dateToQuantileIndex.get(point.date);

        if (quantileIndex !== undefined) {
          const bandValues = getBandValues(
            point.date,
            quantileIndex,
            allQuantilesData,
          );

          if (bandValues) {
            // If this is also the bridge point (forecast starts at same date as last historical),
            // start the band from the historical value for smooth connection
            const isBridgePointDate =
              needsBridgePoint &&
              bridgePoint &&
              point.date === bridgePoint.date &&
              bridgePoint.historical !== undefined;

            if (isBridgePointDate && quantileIndex === 0) {
              // Start from historical value, expand to forecast upper bound
              newPoint[bandKey] = [bridgePoint.historical, bandValues[1]] as [
                number,
                number,
              ];
            } else {
              newPoint[bandKey] = bandValues;
            }
          } else {
            // Remove band data if values don't exist
            delete newPoint[bandKey];
          }
        }
      }
      // For non-forecast dates, preserve existing band data if it exists
      // This ensures continuity of the band visualization

      return newPoint;
    });
    return result;
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
