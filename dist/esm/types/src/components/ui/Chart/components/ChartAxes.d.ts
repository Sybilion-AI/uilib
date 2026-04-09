interface ChartAxesProps {
    xAxisClassName?: string;
    yAxisClassName?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    formatDate: (value: string, detailed?: boolean) => string;
    formatNumber?: (value: number) => string;
    xMin?: string | number;
    xMax?: string | number;
    yMin?: number;
    yMax?: number;
    autoScaleYAxis?: boolean;
}
export declare function ChartAxes({ xAxisClassName, yAxisClassName, xAxisLabel, yAxisLabel, formatDate, xMin, xMax, yMin, yMax, autoScaleYAxis, }: ChartAxesProps): import("react/jsx-runtime").JSX.Element;
export {};
