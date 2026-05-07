interface CustomChartLegendPayloadItem {
    value: string;
    color: string;
    dataKey: string;
    icon?: string;
    status?: string;
    dimmed?: boolean;
    updated_at?: string;
}
interface CustomChartLegendProps {
    payload?: CustomChartLegendPayloadItem[];
    onClick?: (data: any, index: number, event: any) => void;
    className?: string;
    wrapperStyle?: React.CSSProperties;
    hiddenSeries?: Set<string>;
    onAnalysisSelect?: (analysisId: number) => void;
    onFailedAnalysisClick?: (analysisId?: number) => void;
    maxVisibleItems?: number;
    /**
     * When true (default), legend keeps all series "selected"; `hiddenSeries` only dims lines.
     * When false, hidden series drop out of selection (legacy; breaks +N overflow when
     * `items.length < 2` together with `enableToggleHidden`).
     */
    preventDeselection?: boolean;
}
/**
 * Custom chart legend using AnalysesSelector (inline mode)
 * Supports forecast icon indicator, failed badge, toggle visibility
 */
export declare function CustomChartLegend({ payload, onClick, hiddenSeries, className, onAnalysisSelect, onFailedAnalysisClick, maxVisibleItems, preventDeselection, }: CustomChartLegendProps): import("react/jsx-runtime").JSX.Element;
export {};
