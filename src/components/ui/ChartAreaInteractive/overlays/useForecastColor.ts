import { useMemo } from 'react';

import { DEFAULT_QUANTILE_BAND_COLOR } from '#uilib/components/ui/Chart/components/QuantileBands';

import { Analysis } from '../ChartAreaInteractive.types';
import {
  FORECAST_COLORS_MAP,
  FORECAST_LINE_COLORS,
  ForecastItemData,
  getForecastQuantileBandColor,
} from '../ChartLines';

const DEFAULT_FORECAST_COLORS = {
  lineColor: DEFAULT_QUANTILE_BAND_COLOR,
  quantileBandColor: DEFAULT_QUANTILE_BAND_COLOR,
};

/**
 * Hook to get the forecast color using the same logic as ChartLines
 * Finds the forecast in forecastData array and returns its color or a color from forecastColors array
 */
export function useForecastColor(
  selectedForecast: Analysis | undefined,
  forecastData: ForecastItemData[],
): { lineColor: string; quantileBandColor: string } {
  return useMemo(() => {
    if (!selectedForecast?.id || !forecastData) return DEFAULT_FORECAST_COLORS;

    const forecastIndex = forecastData.findIndex(
      item => item.id === selectedForecast.id,
    );

    if (forecastIndex === -1) return DEFAULT_FORECAST_COLORS;

    const forecastItem = forecastData[forecastIndex];
    const lineColor =
      forecastItem.color ||
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
