import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
export interface MessageChartProps {
    chartData: ChartDataPoint[];
    forecastData: ForecastItemData[];
    loading: boolean;
    isDarkTheme?: boolean;
}
export declare function MessageChart({ chartData, forecastData, loading, isDarkTheme, }: MessageChartProps): import("react/jsx-runtime").JSX.Element;
