export type PerformanceUnderChartLegendRowProps = {
    label: React.ReactNode;
    /** Line color (CSS color string). */
    lineColor: string;
    /** Historical uses solid bar; forecast lines use dashed preview. */
    lineStyle?: 'solid' | 'dashed';
    hidden: boolean;
    onToggle?: () => void;
};
export type PerformanceUnderChartLegendItemConfig = PerformanceUnderChartLegendRowProps & {
    id: string;
};
export declare function PerformanceUnderChartLegendRow({ label, lineColor, lineStyle, hidden, onToggle, }: PerformanceUnderChartLegendRowProps): import("react/jsx-runtime").JSX.Element;
/** Renders rows from tab-agnostic config (labels + toggles supplied by parent). */
export declare function PerformanceUnderChartLegendFromItems({ items, }: {
    items: PerformanceUnderChartLegendItemConfig[];
}): import("react/jsx-runtime").JSX.Element;
export declare function PerformanceUnderChartLegend({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
