import type { ChartDataPoint, MeanCPDData, TrendBoundary } from '../ChartTrend.types';
interface TrendAreasProps {
    boundaries: TrendBoundary;
    meanCPD: MeanCPDData;
    chartData: ChartDataPoint[];
    isDarkTheme: boolean;
    restricted: boolean;
}
export declare function TrendAreas({ boundaries, meanCPD, chartData, isDarkTheme, restricted, }: TrendAreasProps): import("react/jsx-runtime").JSX.Element;
export {};
