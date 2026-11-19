import type { ReactNode } from 'react';

import {
  BacktestChart,
  type BacktestOrigin,
  type BacktestPoint,
  backtestScore,
  buildBacktestRows,
} from '#uilib/components/widgets/BacktestChart';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// ENG-2286: a backtest drawn against the last value held flat.

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

const month = (i: number) =>
  `${2024 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01`;

const ACTUALS: BacktestPoint[] = [100, 110, 120, 130].map((value, i) => ({
  date: month(i),
  value,
}));

// Two origins, two months ahead each.
const ORIGINS: BacktestOrigin[] = [
  {
    date: month(0),
    value: 100,
    forecast: [
      { date: month(1), value: 108 },
      { date: month(2), value: 114 },
    ],
  },
  {
    date: month(1),
    value: 110,
    forecast: [
      { date: month(2), value: 125 },
      { date: month(3), value: 143 },
    ],
  },
];

describe('buildBacktestRows', () => {
  it('starts each forecast at its origin and holds the origin flat', () => {
    const rows = buildBacktestRows(ACTUALS, ORIGINS);
    expect(rows.map(r => r.date)).toEqual([0, 1, 2, 3].map(month));
    expect(rows[0]).toEqual({
      date: month(0),
      historical: 100,
      forecast_0: 100,
      forecast_1: 100,
    });
    expect(rows[2]).toMatchObject({
      forecast_0: 114,
      forecast_1: 100,
      forecast_2: 125,
      forecast_3: 110,
    });
    expect(rows[3].forecast_0).toBeUndefined();
    expect(rows[3]).toMatchObject({ forecast_2: 143, forecast_3: 110 });
  });

  it('adds the months a forecast reaches past the actuals', () => {
    const rows = buildBacktestRows(ACTUALS.slice(0, 2), ORIGINS.slice(1));
    expect(rows.map(r => r.date)).toEqual([0, 1, 2, 3].map(month));
    expect(rows[3].historical).toBeUndefined();
  });
});

describe('backtestScore', () => {
  it('compares each landing with the actual of its month', () => {
    // Landings: month 2 (114 vs 120; flat 100) and month 3 (143 vs 130; flat 110).
    const s = backtestScore(ACTUALS, ORIGINS, 2);
    expect(s?.count).toBe(2);
    const forecast = ((6 / 120 + 13 / 130) / 2) * 100;
    const baseline = ((20 / 120 + 20 / 130) / 2) * 100;
    expect(s?.forecastError).toBeCloseTo(forecast);
    expect(s?.baselineError).toBeCloseTo(baseline);
    expect(s?.errorRemoved).toBeCloseTo((1 - forecast / baseline) * 100);
  });

  it('keeps only the landings in the window', () => {
    // The last month only: the second origin's landing.
    const s = backtestScore(ACTUALS, ORIGINS, 1);
    expect(s?.count).toBe(1);
    expect(s?.forecastError).toBeCloseTo((13 / 130) * 100);
  });

  it('counts calendar months, not actual values, in a window', () => {
    // Month 2 has no actual: the last two months are 2 and 3, so only the
    // landing in month 3 counts, not the one in month 2 nor any earlier.
    const gappy = ACTUALS.filter((_, i) => i !== 2);
    const s = backtestScore(gappy, ORIGINS, 2);
    expect(s?.count).toBe(1);
    expect(s?.forecastError).toBeCloseTo((13 / 130) * 100);
  });

  it('matches a landing to its actual by month', () => {
    const endOfMonth = ORIGINS.map(o => ({
      ...o,
      forecast: o.forecast.map(p => ({
        ...p,
        date: p.date.replace(/-01$/, '-28'),
      })),
    }));
    expect(backtestScore(ACTUALS, endOfMonth, 2)?.count).toBe(2);
  });

  it('has no score for a window longer than the actuals', () => {
    expect(backtestScore(ACTUALS, ORIGINS, 24)).toBeNull();
  });

  it('skips a landing with no actual, or an actual of zero', () => {
    const actuals = [...ACTUALS.slice(0, 3), { date: month(3), value: 0 }];
    expect(backtestScore(actuals, ORIGINS, 1)).toBeNull();
    expect(backtestScore(ACTUALS.slice(0, 3), ORIGINS.slice(1), 3)).toBeNull();
  });

  it('has no share removed when the baseline has no error', () => {
    const flat = ACTUALS.map(a => ({ ...a, value: 100 }));
    const s = backtestScore(
      flat,
      [
        {
          date: month(0),
          value: 100,
          forecast: [{ date: month(1), value: 90 }],
        },
      ],
      3,
    );
    expect(s?.baselineError).toBe(0);
    expect(s?.errorRemoved).toBeNull();
  });
});

const chart = (props: Partial<Parameters<typeof BacktestChart>[0]> = {}) =>
  render(
    <BacktestChart
      actuals={ACTUALS}
      origins={ORIGINS}
      windows={[2]}
      disableAnimation
      {...props}
    />,
  );

describe('BacktestChart', () => {
  it('dashes the forecasts, dots the baselines and dots each landing', async () => {
    const { container } = chart();
    await screen.findByText('Last price held flat');
    const strokes = [...container.querySelectorAll('path.recharts-line-curve')]
      .map(p => p.getAttribute('stroke-dasharray'))
      .filter(Boolean);
    expect(strokes.filter(d => d === '4 2').length).toBe(2);
    expect(strokes.filter(d => d === '1 3').length).toBe(2);
    // One dot per forecast landing; none on the actuals or the baselines.
    expect(container.querySelectorAll('circle[r="3"]').length).toBe(2);
  });

  it('says how much of the error the forecast removes', async () => {
    chart();
    expect(await screen.findByText('Last 2 months:')).toBeInTheDocument();
    expect(
      screen.getByText(/removes \d+(\.\d)?% of the error/),
    ).toBeInTheDocument();
  });

  it('says when the forecast has more error than the baseline', async () => {
    const worse = ORIGINS.map(o => ({
      ...o,
      forecast: o.forecast.map(p => ({ ...p, value: p.value * 2 })),
    }));
    chart({ origins: worse });
    expect(
      await screen.findByText(/more error than the last price held flat/),
    ).toBeInTheDocument();
  });

  it('hides a whole group from its legend entry', async () => {
    const { container } = chart();
    fireEvent.click(await screen.findByRole('button', { name: /Forecast/ }));
    expect(screen.getByRole('button', { name: /Forecast/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const dashed = [
      ...container.querySelectorAll('path.recharts-line-curve'),
    ].filter(p => p.getAttribute('stroke-dasharray') === '4 2');
    expect(dashed.length).toBe(0);
    // The baselines stay.
    expect(
      [...container.querySelectorAll('path.recharts-line-curve')].filter(
        p => p.getAttribute('stroke-dasharray') === '1 3',
      ).length,
    ).toBe(2);
  });
});
