import { useMemo } from 'react';
import { applyQuantileBandConeToChartData } from '../../Chart/quantileBandConeChartData.js';

/**
 * Hook to transform chart data and create quantile band configuration
 */
function useQuantileBands({ color, chartData, selectedForecastId, forecastData, bandKey, getBandValues, getBandConfig, }) {
    const transformedChartData = useMemo(() => {
        if (!selectedForecastId ||
            !forecastData[selectedForecastId]?.allQuantiles) {
            return chartData;
        }
        const forecastDataForSelected = forecastData[selectedForecastId];
        const allQuantilesData = forecastDataForSelected.allQuantiles;
        const clonedData = [...chartData];
        const forecastDates = forecastDataForSelected.dates || [];
        const forecastDatesSet = new Set(forecastDates);
        const dateToQuantileIndex = new Map();
        forecastDates.forEach((date, index) => {
            dateToQuantileIndex.set(date, index);
        });
        const withRawBands = clonedData.map(point => {
            const newPoint = { ...point };
            if (forecastDatesSet.has(point.date)) {
                const quantileIndex = dateToQuantileIndex.get(point.date);
                if (quantileIndex !== undefined) {
                    const bandValues = getBandValues(point.date, quantileIndex, allQuantilesData);
                    if (bandValues) {
                        newPoint[bandKey] = bandValues;
                    }
                    else {
                        delete newPoint[bandKey];
                    }
                }
            }
            return newPoint;
        });
        return applyQuantileBandConeToChartData(withRawBands, bandKey);
    }, [chartData, selectedForecastId, forecastData, bandKey, getBandValues]);
    const quantileBands = useMemo(() => {
        if (!selectedForecastId || !forecastData[selectedForecastId]) {
            return [];
        }
        // Get sample values to create config
        const forecastDataForSelected = forecastData[selectedForecastId];
        const forecastDates = forecastDataForSelected.dates || [];
        if (forecastDates.length === 0)
            return [];
        const allQuantilesData = forecastDataForSelected.allQuantiles;
        if (!allQuantilesData)
            return [];
        const lastIndex = forecastDates.length - 1;
        const bandValues = getBandValues(forecastDates[lastIndex], lastIndex, allQuantilesData);
        if (!bandValues)
            return [];
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

export { useQuantileBands };
