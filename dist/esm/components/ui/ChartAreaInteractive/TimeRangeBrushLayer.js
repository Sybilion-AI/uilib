import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { useRef, useState, useLayoutEffect } from 'react';
import debounce from '../../../tools/debounce.js';
import { CHART_MARGINS } from './ChartAreaInteractive.constants.js';
import { encodeDragTimeRange } from './ChartAreaInteractive.helpers.js';
import S from './TimeRangeBrushLayer.styl.js';
import { BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS, BRUSH_MIN_DRAG_PX, brushClientXToDate, BRUSH_DOUBLE_TAP_MS, BRUSH_DOUBLE_TAP_MAX_DIST_PX, measureBrushPlotLayout, brushPlotLayoutsEqual } from './TimeRangeBrushLayout.helpers.js';
import { resolveChartMargin } from '../Chart/tools/chartPlotGeometry.js';

/**
 * Wraps chart; pointerdown on SVG starts horizontal brush. Plot box tracks the
 * painted grid / Recharts plot (see TimeRangeBrushLayout.helpers).
 */
function TimeRangeBrushHost({ chartData, onTimeRangeChange, enabled, layoutKey, children, }) {
    const hostRef = useRef(null);
    const plotRef = useRef(null);
    const lastUpRef = useRef(null);
    const dragPointerIdRef = useRef(null);
    const startClientXRef = useRef(0);
    const chartDataRef = useRef(chartData);
    const onTimeRangeChangeRef = useRef(onTimeRangeChange);
    const lastLayoutRef = useRef(null);
    chartDataRef.current = chartData;
    onTimeRangeChangeRef.current = onTimeRangeChange;
    const moveRef = useRef(() => { });
    const upRef = useRef(() => { });
    const onMoveStableRef = useRef((e) => moveRef.current(e));
    const onUpStableRef = useRef((e) => upRef.current(e));
    const [band, setBand] = useState(null);
    const [plotLayout, setPlotLayout] = useState(null);
    useLayoutEffect(() => {
        if (!enabled) {
            lastLayoutRef.current = null;
            setPlotLayout(null);
            return;
        }
        const host = hostRef.current;
        if (!host)
            return;
        const margin = resolveChartMargin(CHART_MARGINS);
        let raf = 0;
        let wrapperRo = null;
        let observedWrapper = null;
        const commitLayout = (next) => {
            if (brushPlotLayoutsEqual(next, lastLayoutRef.current))
                return;
            lastLayoutRef.current = next;
            setPlotLayout(next);
        };
        const runSync = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const h = hostRef.current;
                if (!h) {
                    commitLayout(null);
                    return;
                }
                const wrappers = h.querySelectorAll('.recharts-wrapper');
                const wrapper = wrappers[wrappers.length - 1];
                if (!(wrapper instanceof HTMLElement)) {
                    if (wrapperRo) {
                        wrapperRo.disconnect();
                        wrapperRo = null;
                    }
                    observedWrapper = null;
                    commitLayout(null);
                    return;
                }
                if (wrapper !== observedWrapper) {
                    if (wrapperRo) {
                        wrapperRo.disconnect();
                        wrapperRo = null;
                    }
                    observedWrapper = wrapper;
                    wrapperRo = new ResizeObserver(() => runSync());
                    wrapperRo.observe(wrapper);
                }
                let next = measureBrushPlotLayout(h, margin);
                if (!next) {
                    requestAnimationFrame(() => {
                        const h2 = hostRef.current;
                        if (!h2) {
                            commitLayout(null);
                            return;
                        }
                        commitLayout(measureBrushPlotLayout(h2, margin));
                    });
                    return;
                }
                commitLayout(next);
            });
        };
        const debouncedWindowResize = debounce(runSync, BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS, { leading: false });
        runSync();
        const roHost = new ResizeObserver(() => runSync());
        roHost.observe(host);
        const mo = new MutationObserver(() => runSync());
        mo.observe(host, { childList: true, subtree: true });
        window.addEventListener('resize', debouncedWindowResize);
        return () => {
            cancelAnimationFrame(raf);
            debouncedWindowResize.cancel();
            roHost.disconnect();
            mo.disconnect();
            wrapperRo?.disconnect();
            window.removeEventListener('resize', debouncedWindowResize);
        };
    }, [enabled, chartData.length, layoutKey]);
    useLayoutEffect(() => {
        moveRef.current = (e) => {
            if (e.pointerId !== dragPointerIdRef.current)
                return;
            const plot = plotRef.current?.getBoundingClientRect();
            if (!plot)
                return;
            const x0 = startClientXRef.current;
            const x1 = e.clientX;
            const left = Math.min(x0, x1);
            const right = Math.max(x0, x1);
            const leftClamped = Math.max(plot.left, Math.min(plot.right, left));
            const rightClamped = Math.max(plot.left, Math.min(plot.right, right));
            setBand({
                left: leftClamped - plot.left,
                width: Math.max(0, rightClamped - leftClamped),
            });
        };
        upRef.current = (e) => {
            if (e.pointerId !== dragPointerIdRef.current)
                return;
            const mv = onMoveStableRef.current;
            const up = onUpStableRef.current;
            if (mv)
                window.removeEventListener('pointermove', mv);
            if (up) {
                window.removeEventListener('pointerup', up);
                window.removeEventListener('pointercancel', up);
            }
            dragPointerIdRef.current = null;
            const data = chartDataRef.current;
            const plot = plotRef.current?.getBoundingClientRect();
            const span = Math.abs(e.clientX - startClientXRef.current);
            let committed = false;
            if (plot && data.length > 1 && span >= BRUSH_MIN_DRAG_PX) {
                const d0 = brushClientXToDate(startClientXRef.current, plot, data);
                const d1 = brushClientXToDate(e.clientX, plot, data);
                if (d0 && d1) {
                    onTimeRangeChangeRef.current(encodeDragTimeRange(d0, d1));
                    committed = true;
                }
            }
            setBand(null);
            if (committed) {
                lastUpRef.current = null;
                return;
            }
            const now = performance.now();
            const prev = lastUpRef.current;
            if (prev &&
                now - prev.t <= BRUSH_DOUBLE_TAP_MS &&
                Math.hypot(e.clientX - prev.x, e.clientY - prev.y) <=
                    BRUSH_DOUBLE_TAP_MAX_DIST_PX) {
                onTimeRangeChangeRef.current('All');
                lastUpRef.current = null;
            }
            else {
                lastUpRef.current = { t: now, x: e.clientX, y: e.clientY };
            }
        };
    }, []);
    const onPointerDown = (e) => {
        if (!enabled || e.button !== 0)
            return;
        if (e.target.tagName !== 'svg')
            return;
        if (chartData.length < 2)
            return;
        dragPointerIdRef.current = e.pointerId;
        startClientXRef.current = e.clientX;
        const plot = plotRef.current?.getBoundingClientRect();
        if (plot) {
            const x = Math.max(plot.left, Math.min(plot.right, e.clientX));
            setBand({ left: x - plot.left, width: 0 });
        }
        window.addEventListener('pointermove', onMoveStableRef.current);
        window.addEventListener('pointerup', onUpStableRef.current);
        window.addEventListener('pointercancel', onUpStableRef.current);
    };
    if (!enabled) {
        return jsx(Fragment, { children: children });
    }
    const plotBoxStyle = plotLayout && plotLayout.width > 0 && plotLayout.height > 0
        ? {
            position: 'absolute',
            zIndex: 8,
            pointerEvents: 'none',
            left: plotLayout.left,
            top: plotLayout.top,
            width: plotLayout.width,
            height: plotLayout.height,
        }
        : { display: 'none' };
    return (jsxs("div", { ref: hostRef, className: S.host, onPointerDown: onPointerDown, children: [children, jsx("div", { ref: plotRef, className: S.plotBox, style: plotBoxStyle, "aria-hidden": true, children: band != null && band.width > 0 && (jsx("div", { className: S.selection, style: { left: band.left, width: band.width } })) })] }));
}

export { TimeRangeBrushHost };
