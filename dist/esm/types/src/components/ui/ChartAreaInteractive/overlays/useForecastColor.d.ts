import { Analysis } from '../ChartAreaInteractive.types';
import { ForecastItemData } from '../ChartLines';
/**
 * Hook to get the forecast color using the same logic as ChartLines
 * Finds the forecast in forecastData array and returns its color or a color from forecastColors array
 */
export declare function useForecastColor(selectedForecast: Analysis | undefined, forecastData: ForecastItemData[]): {
    lineColor: string;
    quantileBandColor: string;
};
