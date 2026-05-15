import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import debounce from '#uilib/tools/debounce';

import { CHART_MARGINS } from './ChartAreaInteractive.constants';
import { encodeDragTimeRange } from './ChartAreaInteractive.helpers';
import S from './TimeRangeBrushLayer.styl';
import {
  BRUSH_DOUBLE_TAP_MAX_DIST_PX,
  BRUSH_DOUBLE_TAP_MS,
  BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS,
  BRUSH_MIN_DRAG_PX,
  type BrushPlotLayout,
  brushClientXToDate,
  brushPlotLayoutsEqual,
  measureBrushPlotLayout,
  resolveChartMargin,
} from './TimeRangeBrushLayout.helpers';

type LastUp = { t: number; x: number; y: number };

export interface TimeRangeBrushHostProps {
  chartData: ChartDataPoint[];
  onTimeRangeChange: (range: string) => void;
  enabled: boolean;
  /** Bumps layout sync when chart remounts (e.g. dataset / render id). */
  layoutKey?: string | number | null;
  children: ReactNode;
}

/**
 * Wraps chart; pointerdown on SVG starts horizontal brush. Plot box tracks the
 * painted grid / Recharts plot (see TimeRangeBrushLayout.helpers).
 */
export function TimeRangeBrushHost({
  chartData,
  onTimeRangeChange,
  enabled,
  layoutKey,
  children,
}: TimeRangeBrushHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const lastUpRef = useRef<LastUp | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const startClientXRef = useRef(0);
  const chartDataRef = useRef(chartData);
  const onTimeRangeChangeRef = useRef(onTimeRangeChange);
  const lastLayoutRef = useRef<BrushPlotLayout | null>(null);

  chartDataRef.current = chartData;
  onTimeRangeChangeRef.current = onTimeRangeChange;

  const moveRef = useRef<(e: PointerEvent) => void>(() => {});
  const upRef = useRef<(e: PointerEvent) => void>(() => {});

  const onMoveStableRef = useRef<(e: PointerEvent) => void>((e: PointerEvent) =>
    moveRef.current(e),
  );
  const onUpStableRef = useRef<(e: PointerEvent) => void>((e: PointerEvent) =>
    upRef.current(e),
  );

  const [band, setBand] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [plotLayout, setPlotLayout] = useState<BrushPlotLayout | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      lastLayoutRef.current = null;
      setPlotLayout(null);
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    const margin = resolveChartMargin(CHART_MARGINS);

    let raf = 0;
    let wrapperRo: ResizeObserver | null = null;
    let observedWrapper: Element | null = null;

    const commitLayout = (next: BrushPlotLayout | null) => {
      if (brushPlotLayoutsEqual(next, lastLayoutRef.current)) return;
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

    const debouncedWindowResize = debounce(
      runSync,
      BRUSH_LAYOUT_RESIZE_DEBOUNCE_MS,
      { leading: false },
    );

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
    moveRef.current = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerIdRef.current) return;
      const plot = plotRef.current?.getBoundingClientRect();
      if (!plot) return;
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

    upRef.current = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerIdRef.current) return;
      const mv = onMoveStableRef.current;
      const up = onUpStableRef.current;
      if (mv) window.removeEventListener('pointermove', mv);
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
      if (
        prev &&
        now - prev.t <= BRUSH_DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - prev.x, e.clientY - prev.y) <=
          BRUSH_DOUBLE_TAP_MAX_DIST_PX
      ) {
        onTimeRangeChangeRef.current('All');
        lastUpRef.current = null;
      } else {
        lastUpRef.current = { t: now, x: e.clientX, y: e.clientY };
      }
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.button !== 0) return;
    if ((e.target as HTMLElement).tagName !== 'svg') return;
    if (chartData.length < 2) return;

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
    return <>{children}</>;
  }

  const plotBoxStyle: CSSProperties | undefined =
    plotLayout && plotLayout.width > 0 && plotLayout.height > 0
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

  return (
    <div ref={hostRef} className={S.host} onPointerDown={onPointerDown}>
      {children}
      <div ref={plotRef} className={S.plotBox} style={plotBoxStyle} aria-hidden>
        {band != null && band.width > 0 && (
          <div
            className={S.selection}
            style={{ left: band.left, width: band.width }}
          />
        )}
      </div>
    </div>
  );
}
