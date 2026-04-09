import { useMemo } from 'react';
import { DEFAULT_QUANTILE_BAND_COLOR } from '../../Chart/components/QuantileBands.js';
import { FORECAST_LINE_COLORS, FORECAST_COLORS_MAP, getForecastQuantileBandColor } from '../ChartLines.js';

const DEFAULT_FORECAST_COLORS = {
    lineColor: DEFAULT_QUANTILE_BAND_COLOR,
    quantileBandColor: DEFAULT_QUANTILE_BAND_COLOR,
};
/**
 * Hook to get the forecast color using the same logic as ChartLines
 * Finds the forecast in forecastData array and returns its color or a color from forecastColors array
 */
function useForecastColor(selectedForecast, forecastData) {
    return useMemo(() => {
        if (!selectedForecast?.id || !forecastData)
            return DEFAULT_FORECAST_COLORS;
        const forecastIndex = forecastData.findIndex(item => item.id === selectedForecast.id);
        if (forecastIndex === -1)
            return DEFAULT_FORECAST_COLORS;
        const forecastItem = forecastData[forecastIndex];
        const lineColor = forecastItem.color ||
            FORECAST_LINE_COLORS[forecastIndex % FORECAST_LINE_COLORS.length];
        const quantileBandColor = forecastItem.color
            ? FORECAST_COLORS_MAP[forecastItem.color]
            : getForecastQuantileBandColor(forecastIndex);
        return {
            lineColor,
            quantileBandColor,
        };
    }, [selectedForecast?.id, forecastData]);
}

export { useForecastColor };
