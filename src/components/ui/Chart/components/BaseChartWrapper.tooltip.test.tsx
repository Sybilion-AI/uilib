import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { BaseChartWrapper } from './BaseChartWrapper';
import { NARROW_TOOLTIP_GAP_PX } from './ChartPlacedTooltip';

// BaseChartWrapper also moves the tooltip itself, a frame after recharts,
// keeping it inside the plot. A chart narrower than 500px must keep its
// tooltip under the chart instead (ChartPlacedTooltip), with no slide.

// jsdom lays nothing out, so ResponsiveContainer would measure 0×0 and draw
// no chart. Give every element the chart's size and report it on resize.
const H = 120;
let width = 300;

beforeAll(() => {
  for (const [prop, get] of [
    ['clientWidth', () => width],
    ['offsetWidth', () => width],
    ['clientHeight', () => H],
    ['offsetHeight', () => H],
  ] as const) {
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get,
    });
  }
  HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: H,
      width,
      height: H,
      toJSON() {},
    }) as DOMRect;
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    private watched = new Set<Element>();
    constructor(private cb: ResizeObserverCallback) {}
    observe(target: Element) {
      this.watched.add(target);
      setTimeout(() => {
        if (!this.watched.has(target)) return;
        this.cb(
          [{ target, contentRect: { width, height: H } } as never],
          this as never,
        );
      });
    }
    unobserve(target: Element) {
      this.watched.delete(target);
    }
    disconnect() {
      this.watched.clear();
    }
  };
});

const chartData = [
  { date: '2026-01-01', historical: 1 },
  { date: '2026-02-01', historical: 2 },
  { date: '2026-03-01', historical: 3 },
];

const nextFrame = () =>
  act(() => new Promise<void>(r => requestAnimationFrame(() => r())));

async function hoverAndRead(w: number) {
  width = w;
  const { container } = render(
    <BaseChartWrapper
      chartData={chartData}
      hasCombinedData
      loading={false}
      isDarkTheme={false}
      height={H}
      showLegend={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />,
  );
  await waitFor(() =>
    expect(container.querySelector('.recharts-line')).toBeTruthy(),
  );
  const chart = container.querySelectorAll('.recharts-wrapper');
  await act(async () => {
    fireEvent.mouseMove(chart[chart.length - 1], {
      clientX: w - 20,
      clientY: H / 2,
    });
  });
  const wrapper = () =>
    container.querySelector<HTMLElement>('.recharts-tooltip-wrapper');
  await waitFor(() => expect(wrapper()?.style.transform).toMatch(/translate/));
  // Let the wrapper's own placement run.
  await nextFrame();
  await nextFrame();
  const style = wrapper()!.style;
  const y = Number(
    /translate\([-\d.]+px,\s*([-\d.]+)px\)/.exec(style.transform)?.[1],
  );
  return { y, transition: style.transition };
}

describe('BaseChartWrapper tooltip placement', () => {
  it('keeps a narrow chart’s tooltip under the chart', async () => {
    const { y, transition } = await hoverAndRead(300);
    expect(y).toBe(H + NARROW_TOOLTIP_GAP_PX);
    expect(transition).toBe('none');
  });

  it('keeps a wide chart’s tooltip inside the chart, sliding', async () => {
    const { y, transition } = await hoverAndRead(640);
    expect(y).toBeLessThan(H);
    expect(transition).toMatch(/transform/);
  });
});
