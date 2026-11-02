import type { ReactNode } from 'react';

import { BaseChartWrapper } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive';
import { filterDataForTimeRange } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.helpers';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  getForecastColor,
  getHistoryColor,
  resolveHistoryLines,
} from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import {
  forecastHistoryKey,
  historySeriesKey,
  historySeriesKeys,
  isHistorySeriesKey,
} from '#uilib/components/ui/ChartAreaInteractive/chartHistories';
import { isKeyExcludedFromYScale } from '#uilib/components/ui/ChartAreaInteractive/overlays/useChartYRange';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// recharts' ResponsiveContainer measures the DOM via ResizeObserver, which
// jsdom does not implement; replace it with a fixed-size passthrough so the
// inner chart renders synchronously.
jest.mock('recharts', () => {
  const actual = jest.requireActual<typeof import('recharts')>('recharts');
  const React = jest.requireActual<typeof import('react')>('react');

  function ResponsiveContainer({ children }: { children?: ReactNode }) {
    const sized = React.isValidElement<{ width?: number; height?: number }>(
      children,
    )
      ? React.cloneElement(children, { width: 600, height: 360 })
      : children;
    return React.createElement(
      'div',
      { style: { width: 600, height: 360 } },
      sized,
    );
  }

  return { ...actual, ResponsiveContainer };
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(globalThis, { ResizeObserver: ResizeObserverMock });
Object.assign(window, {
  matchMedia: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }),
});

const HISTORIES = [
  { id: 'a', name: 'Product A', color: '#111111' },
  { id: 'b', name: 'Product B', color: '#222222' },
];

const FORECASTS = [
  { id: 1, name: 'Product A forecast', continues: 'a' },
  { id: 2, name: 'Product B forecast', continues: 'b' },
];

const DATA: ChartDataPoint[] = [
  { date: '2026-07-01', historical_a: 10, historical_b: 50 },
  { date: '2026-08-01', historical_a: 10.5, historical_b: 51 },
  { date: '2026-09-01', historical_a: 11, historical_b: 52 },
  { date: '2026-10-01', forecast_1: 12, forecast_2: 53 },
  { date: '2026-11-01', forecast_1: 13, forecast_2: 54 },
];

describe('history line keys', () => {
  it('keys each history by id and keeps the single line as historical', () => {
    expect(historySeriesKey('a')).toBe('historical_a');
    expect(historySeriesKeys(HISTORIES)).toEqual([
      'historical_a',
      'historical_b',
    ]);
    expect(historySeriesKeys(undefined)).toEqual(['historical']);
    expect(historySeriesKeys([])).toEqual(['historical']);
  });

  it('recognises history keys only', () => {
    expect(isHistorySeriesKey('historical')).toBe(true);
    expect(isHistorySeriesKey('historical_7')).toBe(true);
    expect(isHistorySeriesKey('forecast_7')).toBe(false);
    expect(isHistorySeriesKey('historicalX')).toBe(false);
  });
});

describe('forecastHistoryKey', () => {
  it('joins the single historical line when there is no historyData', () => {
    expect(forecastHistoryKey({}, undefined)).toBe('historical');
    expect(forecastHistoryKey({ continues: 'a' }, [])).toBe('historical');
  });

  it('joins the history that continues names', () => {
    expect(forecastHistoryKey({ continues: 'b' }, HISTORIES)).toBe(
      'historical_b',
    );
  });

  it('matches a numeric id named as a string and the other way round', () => {
    expect(forecastHistoryKey({ continues: '7' }, [{ id: 7 }])).toBe(
      'historical_7',
    );
    expect(forecastHistoryKey({ continues: 7 }, [{ id: '7' }])).toBe(
      'historical_7',
    );
  });

  it('joins none when continues names no history', () => {
    expect(forecastHistoryKey({ continues: 'zzz' }, HISTORIES)).toBeNull();
    expect(forecastHistoryKey({ continues: 'zzz' }, [{ id: 'a' }])).toBeNull();
  });

  it('joins the only history, and none of several, when continues is unset', () => {
    expect(forecastHistoryKey({}, [{ id: 'a' }])).toBe('historical_a');
    expect(forecastHistoryKey(undefined, [{ id: 'a' }])).toBe('historical_a');
    expect(forecastHistoryKey({}, HISTORIES)).toBeNull();
  });
});

describe('history lines in scale and time range', () => {
  it('drops a hidden history line from the Y scale', () => {
    const hidden = new Set(['historical_a']);
    expect(isKeyExcludedFromYScale('historical_a', hidden)).toBe(true);
    expect(isKeyExcludedFromYScale('historical_b', hidden)).toBe(false);
  });

  it('anchors the window end on the history the forecast joins', () => {
    const rows: ChartDataPoint[] = [
      { date: '2024-01-01', historical_a: 1 },
      { date: '2025-06-01', historical_a: 1, forecast_1: 1 },
      { date: '2026-09-01', historical_b: 2 },
    ];
    const out = filterDataForTimeRange(rows, '6m', {
      endDateAnchorAnalysisId: 1,
      anchorHistoryKey: 'historical_a',
    });
    // Ends at Jun 2025 (history a and forecast 1), not at history b.
    expect(out.map(r => r.date)).toEqual(['2025-06-01', '2026-09-01']);
    const anyHistory = filterDataForTimeRange(rows, '6m', {
      endDateAnchorAnalysisId: 1,
    });
    expect(anyHistory.map(r => r.date)).toEqual(['2026-09-01']);
  });

  it('anchors the window end on any history line by default', () => {
    const rows: ChartDataPoint[] = [
      { date: '2024-01-01', historical_a: 1 },
      { date: '2026-09-01', historical_b: 2 },
      { date: '2027-06-01', forecast_9: 3 },
    ];
    const out = filterDataForTimeRange(rows, '6m', {
      endDateAnchorAnalysisId: 1,
    });
    // Ends at Sep 2026 (history b), not at the other run in 2027.
    expect(out.map(r => r.date)).toEqual(['2026-09-01', '2027-06-01']);
  });
});

describe('history line defaults', () => {
  it('applies label and colour defaults, keeping given ones', () => {
    expect(
      resolveHistoryLines([{ id: 'a' }, { id: 2, name: 'B', color: '#abc' }]),
    ).toEqual([
      { dataKey: 'historical_a', name: 'a', color: getHistoryColor(0) },
      { dataKey: 'historical_2', name: 'B', color: '#abc' },
    ]);
  });

  it('takes history colours from the far end of the forecast palette', () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(getHistoryColor(i)).not.toBe(getForecastColor(j));
      }
    }
  });
});

describe('BaseChartWrapper with several history lines', () => {
  const renderChart = (
    props: Partial<Parameters<typeof BaseChartWrapper>[0]> = {},
  ) =>
    render(
      <BaseChartWrapper
        renderId="test"
        chartData={DATA}
        historyData={HISTORIES}
        forecastData={FORECASTS}
        loading={false}
        hasCombinedData
        isDarkTheme={false}
        disableAnimation
        maxVisibleItems={5}
        {...props}
      />,
    );

  it('draws one line per history and per forecast', () => {
    const { container } = renderChart();
    expect(container.querySelectorAll('.recharts-line').length).toBe(4);
  });

  it('lists every history in the legend in place of "Historical"', () => {
    renderChart();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.queryByText('Historical')).toBeNull();
  });

  it('shows the history legend when there is no forecast', () => {
    renderChart({ forecastData: [] });
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('keeps the single "Historical" entry without historyData', () => {
    const { container } = renderChart({
      historyData: undefined,
      chartData: [
        { date: '2026-08-01', historical: 10 },
        { date: '2026-09-01', historical: 11 },
        { date: '2026-10-01', forecast_1: 12 },
      ],
      forecastData: [{ id: 1, name: 'Run 1' }],
    });
    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-line').length).toBe(2);
  });

  it('puts the histories in the export legend, drawn solid', () => {
    const { container } = renderChart({ legendVariant: 'svg' });
    const texts = [...container.querySelectorAll('svg text')].map(
      t => t.textContent,
    );
    expect(texts).toEqual(
      expect.arrayContaining(['Product A', 'Product B', 'Product A forecast']),
    );
    // The export legend is the 24px-high svg row under the chart.
    const lines = [...container.querySelectorAll('svg[height="24"] line')];
    const solid = lines.filter(l => !l.getAttribute('stroke-dasharray'));
    expect(solid.map(l => l.getAttribute('stroke'))).toEqual([
      '#111111',
      '#222222',
    ]);
  });
});

describe('ChartAreaInteractive with several history lines', () => {
  const renderArea = (
    forecasts: typeof FORECASTS | { id: number; name: string }[],
  ) =>
    render(
      <ChartAreaInteractive
        chartRenderId="test"
        chartData={DATA}
        historyData={HISTORIES}
        forecastData={forecasts}
        loading={false}
        hasCombinedData
        isDarkTheme={false}
        disableAnimation
        timeRange="All"
        onTimeRangeChange={() => {}}
        pinMonth={undefined}
        onPinMonthChange={() => {}}
        disableTimeRangeSelector
        toggleLegendSeries={() => {}}
        ensureAnalysisSeriesVisible={() => {}}
      />,
    );

  // Points on a forecast's drawn path: one move plus one curve per segment.
  const forecastPathPoints = (container: HTMLElement, name: string) => {
    const path = container.querySelector(`.recharts-line path[name="${name}"]`);
    const d = path?.getAttribute('d') ?? '';
    return (d.match(/[MLC]/g) ?? []).length;
  };

  const pathOf = (container: HTMLElement, name: string) =>
    container
      .querySelector(`.recharts-line path[name="${name}"]`)
      ?.getAttribute('d') ?? '';
  const firstPoint = (d: string) => d.match(/^M([\d.]+),([\d.]+)/)?.slice(1);
  const lastPoint = (d: string) => d.match(/([\d.]+),([\d.]+)$/)?.slice(1);

  it('renders each history and forecast line', () => {
    const { container } = renderArea(FORECASTS);
    expect(container.querySelectorAll('.recharts-line').length).toBe(4);
  });

  it('starts each forecast from the history it continues', () => {
    const { container } = renderArea(FORECASTS);
    // Sep (joined to its history), Oct, Nov.
    expect(forecastPathPoints(container, 'Product A forecast')).toBe(3);
    expect(forecastPathPoints(container, 'Product B forecast')).toBe(3);
    // ...at that history's own last point, not the other product's.
    for (const product of ['Product A', 'Product B']) {
      const history = lastPoint(pathOf(container, product));
      expect(history).toBeDefined();
      expect(firstPoint(pathOf(container, `${product} forecast`))).toEqual(
        history,
      );
    }
  });

  it('toggles a history line by its own key from the legend', () => {
    const toggled: string[] = [];
    render(
      <ChartAreaInteractive
        chartRenderId="test"
        chartData={DATA}
        historyData={HISTORIES}
        forecastData={FORECASTS}
        loading={false}
        hasCombinedData
        isDarkTheme={false}
        disableAnimation
        timeRange="All"
        onTimeRangeChange={() => {}}
        pinMonth={undefined}
        onPinMonthChange={() => {}}
        disableTimeRangeSelector
        toggleLegendSeries={key => toggled.push(key)}
        ensureAnalysisSeriesVisible={() => {}}
      />,
    );
    // The selector already sends 'forecast_-1' on mount (its "Historical"
    // auto-select, unrelated to several histories); look at the click only.
    toggled.length = 0;
    fireEvent.click(screen.getByText('Product B'));
    expect(toggled).toEqual(['historical_b']);
  });

  it('does not join forecasts that name no history when there are several', () => {
    const { container } = renderArea([
      { id: 1, name: 'Product A forecast' },
      { id: 2, name: 'Product B forecast' },
    ]);
    // Oct, Nov only.
    expect(forecastPathPoints(container, 'Product A forecast')).toBe(2);
  });
});
