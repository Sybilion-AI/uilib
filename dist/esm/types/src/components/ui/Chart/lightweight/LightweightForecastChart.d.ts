import type { ChartConfig } from '#uilib/components/ui/Chart/Chart.types';
import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
export interface LightweightForecastChartProps {
    chartData: ChartDataPoint[];
    forecastData?: ForecastItemData[];
    quantileBands?: QuantileBandConfig[];
    chartConfig?: ChartConfig;
    historicalLineColor?: string;
    isDarkTheme: boolean;
    height?: number;
    className?: string;
    hiddenSeries?: Set<string>;
    onLegendClick?: (data: unknown, index: number, event: unknown) => void;
    disableForecastHistoricalBridge?: boolean;
    forecastLineStyle?: 'dashed' | 'solid';
    formatDate?: (value: string, detailed?: boolean) => string;
    formatNumber?: (value: number) => string;
    loading?: boolean;
    error?: string | null;
    noDataMessage?: string;
    showLegend?: boolean;
    showTooltip?: boolean;
}
export declare function LightweightForecastChart(props: LightweightForecastChartProps): import("react/jsx-runtime").JSX.Element;
