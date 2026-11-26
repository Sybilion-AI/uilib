import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Line, LineChart } from 'recharts';

import {
  ChartPlacedTooltip,
  NARROW_CHART_PX,
  NARROW_TOOLTIP_GAP_PX,
  isTooltipUnder,
  opensTooltipUnder,
} from './ChartPlacedTooltip';

// jsdom lays nothing out; recharts reads the wrapper's box to place the
// pointer, so give every element the chart's size.
const H = 100;
let width = 300;
const box = () =>
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
  HTMLElement.prototype.getBoundingClientRect = box;
});

const data = [
  { date: '2026-01', v: 1 },
  { date: '2026-02', v: 2 },
  { date: '2026-03', v: 3 },
];

// recharts' default margin is 5 on every side; the tooltip starts under the
// x-axis, so it leaves the bottom one out.
const MARGIN = 5;

function renderChart(
  w: number,
  tooltip: Partial<Parameters<typeof ChartPlacedTooltip>[0]> = {},
  margin?: { top: number; right: number; bottom: number; left: number },
) {
  width = w;
  return render(
    <LineChart width={w} height={H} data={data} margin={margin}>
      <Line dataKey="v" isAnimationActive={false} />
      <ChartPlacedTooltip
        content={() => <div className="tip">tip</div>}
        {...tooltip}
      />
    </LineChart>,
  );
}

// The tooltip's vertical translate, once the hover has placed it.
async function hoverAndReadY(container: HTMLElement, w: number) {
  const chart = container.querySelector('.recharts-wrapper');
  expect(chart).toBeTruthy();
  await act(async () => {
    fireEvent.mouseMove(chart!, { clientX: w - 20, clientY: H / 2 });
  });
  const wrapper = () =>
    container.querySelector<HTMLElement>('.recharts-tooltip-wrapper');
  await waitFor(() => expect(wrapper()?.style.visibility).toBe('visible'));
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(
    wrapper()!.style.transform,
  );
  expect(m).toBeTruthy();
  return { y: Number(m![2]), transition: wrapper()!.style.transition };
}

describe('ChartPlacedTooltip', () => {
  it('knows which widths are narrow', () => {
    expect(opensTooltipUnder(undefined)).toBe(false);
    expect(opensTooltipUnder(0)).toBe(false);
    expect(opensTooltipUnder(NARROW_CHART_PX - 1)).toBe(true);
    expect(opensTooltipUnder(NARROW_CHART_PX)).toBe(false);
  });

  it('opens under a narrow chart, without sliding there', async () => {
    const { container } = renderChart(300);
    const { y, transition } = await hoverAndReadY(container, 300);
    expect(y).toBe(H - MARGIN + NARROW_TOOLTIP_GAP_PX);
    expect(transition).toBe('none');
    const wrapper = container.querySelector<HTMLElement>(
      '.recharts-tooltip-wrapper',
    )!;
    expect(isTooltipUnder(wrapper)).toBe(true);
    expect(wrapper.style.display).toBe('');
  });

  it('starts right under the x-axis labels, not under the bottom margin', async () => {
    const { container } = renderChart(
      300,
      {},
      {
        top: 20,
        right: 5,
        bottom: 20,
        left: 5,
      },
    );
    const { y } = await hoverAndReadY(container, 300);
    expect(y).toBe(H - 20 + NARROW_TOOLTIP_GAP_PX);
  });

  it('takes no room under a narrow chart while nothing is hovered', async () => {
    const { container } = renderChart(300);
    await hoverAndReadY(container, 300);
    const chart = container.querySelector('.recharts-wrapper')!;
    await act(async () => {
      fireEvent.mouseLeave(chart);
    });
    await waitFor(() =>
      expect(
        container.querySelector<HTMLElement>('.recharts-tooltip-wrapper')?.style
          .display,
      ).toBe('none'),
    );
  });

  it('stays over a wide chart', async () => {
    const { container } = renderChart(640);
    const { y } = await hoverAndReadY(container, 640);
    expect(y).toBeLessThan(H);
    expect(
      isTooltipUnder(
        container.querySelector<HTMLElement>('.recharts-tooltip-wrapper')!,
      ),
    ).toBe(false);
  });

  it("lets the caller's position win", async () => {
    const { container } = renderChart(300, { position: { y: 7 } });
    const { y } = await hoverAndReadY(container, 300);
    expect(y).toBe(7);
  });

  it('keeps the under-chart y when the caller sets only x', async () => {
    const { container } = renderChart(300, { position: { x: 0 } });
    const { y } = await hoverAndReadY(container, 300);
    expect(y).toBe(H - MARGIN + NARROW_TOOLTIP_GAP_PX);
  });
});
