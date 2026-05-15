import { measureHostRelativePlotRect } from '../Chart/tools/chartPlotGeometry.js';
export { resolveChartMargin } from '../Chart/tools/chartPlotGeometry.js';

/** Debounce for `window` resize only (RO uses rAF-coalesced sync). */
const BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS = 500;
const BRUSH_MIN_DRAG_PX = 8;
const BRUSH_DOUBLE_TAP_MS = 300;
const BRUSH_DOUBLE_TAP_MAX_DIST_PX = 24;
/** Host-relative plot rect (grid-first, then wrapper + margins). */
const measureBrushPlotLayout = measureHostRelativePlotRect;
function brushPlotLayoutsEqual(a, b) {
    if (a === b)
        return true;
    if (!a || !b)
        return false;
    return (a.left === b.left &&
        a.top === b.top &&
        a.width === b.width &&
        a.height === b.height);
}
function brushClientXToDate(clientX, plotRect, chartData) {
    if (!chartData.length || plotRect.width <= 0)
        return null;
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

export { BRUSH_DOUBLE_TAP_MAX_DIST_PX, BRUSH_DOUBLE_TAP_MS, BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS, BRUSH_MIN_DRAG_PX, brushClientXToDate, brushPlotLayoutsEqual, measureBrushPlotLayout };
