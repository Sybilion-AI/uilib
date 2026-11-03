import { act, fireEvent, render, waitFor } from '@testing-library/react';

import {
  BaseChartWrapper,
  type BaseChartWrapperProps,
} from './BaseChartWrapper';
import { NARROW_TOOLTIP_GAP_PX } from './ChartPlacedTooltip';

// BaseChartWrapper also moves the tooltip itself, a frame after recharts,
// keeping it inside the plot. A chart narrower than 500px must keep its
// tooltip under the chart instead (ChartPlacedTooltip), with no slide. Also:
// the tooltip's number format, and lines drawn across months with no value.

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

async function renderChart(
  w: number,
  props: Partial<BaseChartWrapperProps> = {},
) {
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
      {...props}
    />,
  );
  await waitFor(() =>
    expect(container.querySelector('.recharts-line')).toBeTruthy(),
  );
  return container;
}

async function hoverAndRead(
  w: number,
  props: Partial<BaseChartWrapperProps> = {},
) {
  const container = await renderChart(w, props);
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
  return { y, transition: style.transition, container };
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

describe('BaseChartWrapper tooltip values', () => {
  it('formats them with formatTooltipValue', async () => {
    const { container } = await hoverAndRead(640, {
      formatTooltipValue: v => `${v.toFixed(2)} t`,
    });
    await waitFor(() => expect(container.textContent).toContain('3.00 t'));
  });
});

describe('BaseChartWrapper without axes', () => {
  it('draws no axis but the tooltip still names the row’s date', async () => {
    const { container } = await hoverAndRead(640, {
      showAxes: false,
      labelFormatter: (v: unknown) => `month ${String(v)}`,
    });
    await waitFor(() =>
      expect(container.textContent).toContain('month 2026-03-01'),
    );
    expect(
      container.querySelectorAll('.recharts-cartesian-axis-tick'),
    ).toHaveLength(0);
  });
});

describe('BaseChartWrapper lines across missing months', () => {
  const gappy = [
    { date: '2026-01-01', historical: 1, forecast_1: 1 },
    { date: '2026-02-01', historical: null, forecast_1: null },
    { date: '2026-03-01', historical: 3, forecast_1: 3 },
  ];
  const forecastData = [{ id: 1, name: 'Forecast' }];
  // A line broken by a gap is drawn as one path with two "M" moves.
  const moves = (container: HTMLElement, i: number) =>
    (
      container
        .querySelectorAll('.recharts-line-curve')
        [i]?.getAttribute('d')
        ?.match(/M/g) ?? []
    ).length;
  const lastLayer = (container: HTMLElement) => {
    const layers = container.querySelectorAll('.recharts-wrapper');
    return layers[layers.length - 1] as HTMLElement;
  };

  it('leaves a gap by default', async () => {
    const container = await renderChart(640, {
      chartData: gappy,
      forecastData,
    });
    expect(moves(lastLayer(container), 0)).toBe(2);
    expect(moves(lastLayer(container), 1)).toBe(2);
  });

  it('joins only history when asked', async () => {
    const history = await renderChart(640, {
      chartData: gappy,
      forecastData,
      connectHistoryNulls: true,
    });
    expect(moves(lastLayer(history), 0)).toBe(1);
    expect(moves(lastLayer(history), 1)).toBe(2);
  });

  it('joins forecasts when asked', async () => {
    const container = await renderChart(640, {
      chartData: gappy,
      forecastData,
      connectForecastNulls: true,
    });
    expect(moves(lastLayer(container), 0)).toBe(2);
    expect(moves(lastLayer(container), 1)).toBe(1);
  });
});

describe('BaseChartWrapper line order', () => {
  const strokes = (container: HTMLElement) => {
    const layers = container.querySelectorAll('.recharts-wrapper');
    return [
      ...layers[layers.length - 1].querySelectorAll('.recharts-line-curve'),
    ].map(e => e.getAttribute('stroke'));
  };
  const props: Partial<BaseChartWrapperProps> = {
    chartData: [
      { date: '2026-01-01', historical_a: 1, forecast_1: 2 },
      { date: '2026-02-01', historical_a: 2, forecast_1: 3 },
    ],
    historyData: [{ id: 'a', name: 'A', color: 'black' }],
    forecastData: [{ id: 1, name: 'F', color: 'cyan' }],
  };

  it('draws history first, under the forecasts, by default', async () => {
    const container = await renderChart(640, props);
    expect(strokes(container)).toEqual(['black', 'cyan']);
  });

  it('draws history last, over the forecasts, when asked', async () => {
    const container = await renderChart(640, { ...props, historyOnTop: true });
    expect(strokes(container)).toEqual(['cyan', 'black']);
  });

  it('keeps history on top after a forecast is hidden and shown again', async () => {
    width = 640;
    const chart = (hidden: Set<string>) => (
      <BaseChartWrapper
        {...(props as BaseChartWrapperProps)}
        hasCombinedData
        loading={false}
        isDarkTheme={false}
        height={H}
        showLegend={false}
        historyOnTop
        hiddenSeries={hidden}
      />
    );
    const { container, rerender } = render(chart(new Set()));
    await waitFor(() => expect(strokes(container)).toHaveLength(2));
    rerender(chart(new Set(['forecast_1'])));
    await waitFor(() => expect(strokes(container)).toEqual(['black']));
    rerender(chart(new Set()));
    await waitFor(() => expect(strokes(container)).toHaveLength(2));
    expect(strokes(container)).toEqual(['cyan', 'black']);
  });
});

describe('BaseChartWrapper range bands across missing months', () => {
  const rows = [
    { date: '2026-01-01', historical: 1, band: [0, 2] },
    { date: '2026-02-01', historical: 2, band: null },
    { date: '2026-03-01', historical: 3, band: [2, 4] },
  ];
  const band = {
    key: 'band',
    name: 'Range',
    quantiles: ['0.1', '0.9'] as [string, string],
    opacity: 0.12,
  };
  const areaMoves = async (connectNulls?: boolean) => {
    width = 640;
    const { container } = render(
      <BaseChartWrapper
        chartData={rows as never}
        hasCombinedData
        loading={false}
        isDarkTheme={false}
        height={H}
        showLegend={false}
        quantileBands={[{ ...band, connectNulls }]}
      />,
    );
    await waitFor(() =>
      expect(container.querySelector('.recharts-area-area')).toBeTruthy(),
    );
    const areas = container.querySelectorAll('.recharts-area-area');
    return (areas[areas.length - 1].getAttribute('d')?.match(/M/g) ?? [])
      .length;
  };

  it('fills across them by default', async () => {
    expect(await areaMoves()).toBe(1);
  });

  it('leaves a gap when the band says so', async () => {
    expect(await areaMoves(false)).toBe(2);
  });
});
