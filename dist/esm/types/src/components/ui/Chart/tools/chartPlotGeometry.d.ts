/**
 * Shared Recharts plot / margin math (DOM-agnostic except measurement entry points).
 * Keeps BaseChartWrapper tooltip clamp and ChartAreaInteractive brush in sync.
 */
export type ChartMargin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare const DEFAULT_CHART_MARGIN: ChartMargin;
export declare function resolveChartMargin(margin: Partial<ChartMargin> | undefined): ChartMargin;
/** Plot box inside `.recharts-wrapper` (Recharts cartesian convention). */
export declare function getPlotViewBox(wrapper: HTMLElement, m: ChartMargin): {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type PlotRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
/**
 * Plot area in `host` local px: prefer painted `.recharts-cartesian-grid`, else
 * last `.recharts-wrapper` + margins. One `hostRect` read; grid/wrapper rects as needed.
 */
export declare function measureHostRelativePlotRect(host: HTMLElement, margin: ChartMargin): PlotRect | null;
