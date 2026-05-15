import { type ChartMargin, type PlotRect, measureHostRelativePlotRect, resolveChartMargin } from '#uilib/components/ui/Chart/tools/chartPlotGeometry';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
/** Debounce for `window` resize only (RO uses rAF-coalesced sync). */
export declare const BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS = 500;
export declare const BRUSH_MIN_DRAG_PX = 8;
export declare const BRUSH_DOUBLE_TAP_MS = 300;
export declare const BRUSH_DOUBLE_TAP_MAX_DIST_PX = 24;
export type { ChartMargin };
export { resolveChartMargin };
export type BrushPlotLayout = PlotRect;
/** Host-relative plot rect (grid-first, then wrapper + margins). */
export declare const measureBrushPlotLayout: typeof measureHostRelativePlotRect;
export declare function brushPlotLayoutsEqual(a: BrushPlotLayout | null, b: BrushPlotLayout | null): boolean;
export declare function brushClientXToDate(clientX: number, plotRect: DOMRect, chartData: ChartDataPoint[]): Date | null;
