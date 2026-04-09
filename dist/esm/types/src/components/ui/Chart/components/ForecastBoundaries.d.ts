import type { ChangePointDetection, ChartDataPoint } from '../../ChartForecast/ChartForecast.types';
interface ForecastBoundariesProps {
    changePoints: ChangePointDetection;
    chartData: ChartDataPoint[];
    isDarkTheme: boolean;
}
export declare function ForecastBoundaries({ changePoints, chartData, isDarkTheme, }: ForecastBoundariesProps): import("react/jsx-runtime").JSX.Element;
export {};
