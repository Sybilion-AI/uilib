import {
  type ChartMargin,
  type PlotRect,
  measureHostRelativePlotRect,
  resolveChartMargin,
} from '#uilib/components/ui/Chart/tools/chartPlotGeometry';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

/** Debounce for `window` resize only (RO uses rAF-coalesced sync). */
export const BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS = 500;

export const BRUSH_MIN_DRAG_PX = 8;
export const BRUSH_DOUBLE_TAP_MS = 300;
export const BRUSH_DOUBLE_TAP_MAX_DIST_PX = 24;

export type { ChartMargin };
export { resolveChartMargin };

export type BrushPlotLayout = PlotRect;

/** Host-relative plot rect (grid-first, then wrapper + margins). */
export const measureBrushPlotLayout = measureHostRelativePlotRect;

export function brushPlotLayoutsEqual(
  a: BrushPlotLayout | null,
  b: BrushPlotLayout | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
}

export function brushClientXToDate(
  clientX: number,
  plotRect: DOMRect,
  chartData: ChartDataPoint[],
): Date | null {
  if (!chartData.length || plotRect.width <= 0) return null;
  const rel = clientX - plotRect.left;
  const pct = Math.max(0, Math.min(100, (rel / plotRect.width) * 100));
  const n = chartData.length;
  if (n === 1) {
    const d = chartData[0]?.date;
    return d ? new Date(d) : null;
  }
  const idx = Math.round((pct / 100) * (n - 1));
  const clamped = Math.max(0, Math.min(n - 1, idx));
  const raw = chartData[clamped]?.date;
  return raw ? new Date(raw) : null;
}
