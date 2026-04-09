import { ChartDataPoint } from './ChartAreaInteractive.types';
export interface LineConfig {
    dataKey: string;
    color: string;
    name: string;
}
export type ForecastItemData = {
    id: number;
    name?: string;
    color?: string;
    icon?: string;
    status?: string;
    tooltip?: string;
    dimmed?: boolean;
    updated_at?: string;
};
export type Dot = {
    x: number;
    y: number;
    color: string;
};
export declare const FORECAST_COLORS_MAP: {
    '#C08F09': string;
    '#216BF7': string;
    '#F103F1': string;
    '#059643': string;
    '#FD1515': string;
    '#04ADC3': string;
    '#3C42A9': string;
    '#795548': string;
};
export declare const FORECAST_LINE_COLORS: string[];
export declare const getForecastColor: (index: number) => string;
export declare const getForecastQuantileBandColor: (index: number) => any;
export declare const ChartLines: import("react").MemoExoticComponent<({ chartData, forecastData, hiddenSeries, isDarkTheme, shouldAnimate, historicalLineColor, showLegend, forecastLineStyle, disableHistoricalAnimation, }: {
    chartData: ChartDataPoint[];
    forecastData?: ForecastItemData[];
    hiddenSeries?: Set<string>;
    isDarkTheme: boolean;
    shouldAnimate?: boolean;
    historicalLineColor?: string;
    showLegend?: boolean;
    forecastLineStyle?: "dashed" | "solid";
    disableHistoricalAnimation?: boolean;
}) => import("react/jsx-runtime").JSX.Element>;
