/**
 * Shared Recharts plot / margin math (DOM-agnostic except measurement entry points).
 * Keeps BaseChartWrapper tooltip clamp and ChartAreaInteractive brush in sync.
 */
const DEFAULT_CHART_MARGIN = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
};
function resolveChartMargin(margin) {
    return {
        top: margin?.top ?? DEFAULT_CHART_MARGIN.top,
        right: margin?.right ?? DEFAULT_CHART_MARGIN.right,
        bottom: margin?.bottom ?? DEFAULT_CHART_MARGIN.bottom,
        left: margin?.left ?? DEFAULT_CHART_MARGIN.left,
    };
}
/** Plot box inside `.recharts-wrapper` (Recharts cartesian convention). */
function getPlotViewBox(wrapper, m) {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    return {
        x: m.left,
        y: m.top,
        width: Math.max(0, w - m.left - m.right),
        height: Math.max(0, h - m.top - m.bottom),
    };
}
const GRID_BOUNDS_MIN_PX = 2;
/**
 * Plot area in `host` local px: prefer painted `.recharts-cartesian-grid`, else
 * last `.recharts-wrapper` + margins. One `hostRect` read; grid/wrapper rects as needed.
 */
function measureHostRelativePlotRect(host, margin) {
    const hostRect = host.getBoundingClientRect();
    const grid = host.querySelector('.recharts-cartesian-grid');
    if (grid) {
        const gr = grid.getBoundingClientRect();
        if (gr.width > GRID_BOUNDS_MIN_PX && gr.height > GRID_BOUNDS_MIN_PX) {
            return {
                left: gr.left - hostRect.left,
                top: gr.top - hostRect.top,
                width: gr.width,
                height: gr.height,
            };
        }
    }
    const wrappers = host.querySelectorAll('.recharts-wrapper');
    const wrapper = wrappers[wrappers.length - 1];
    if (!(wrapper instanceof HTMLElement))
        return null;
    const vb = getPlotViewBox(wrapper, margin);
    if (vb.width <= 0 || vb.height <= 0)
        return null;
    const wrapRect = wrapper.getBoundingClientRect();
    return {
        left: wrapRect.left - hostRect.left + vb.x,
        top: wrapRect.top - hostRect.top + vb.y,
        width: vb.width,
        height: vb.height,
    };
}

export { DEFAULT_CHART_MARGIN, getPlotViewBox, measureHostRelativePlotRect, resolveChartMargin };
