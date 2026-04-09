type ColorScheme = {
    light: string;
    dark: string;
};
type ChartColors = Record<string, ColorScheme | any>;
export declare function useChartColors(colors: ChartColors, isDarkTheme: boolean): {
    historical: string;
    forecast: string;
    confidence?: string;
    [key: string]: string | undefined;
};
export {};
