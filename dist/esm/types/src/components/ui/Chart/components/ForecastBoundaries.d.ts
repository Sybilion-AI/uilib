import type { ChangePointDetection, ForecastVisualizationRow } from '../chartForecastVisualization.types';
interface ForecastBoundariesProps {
    changePoints: ChangePointDetection;
    chartData: ForecastVisualizationRow[];
    isDarkTheme: boolean;
}
export declare function ForecastBoundaries({ changePoints, chartData, isDarkTheme, }: ForecastBoundariesProps): import("react/jsx-runtime").JSX.Element;
export {};
