import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import {
  ensureChartForecastBridge,
  getNextMonth,
  getPreviousMonth,
  normalizeToMonthStart,
} from '#uilib/utils/chartConnectionPoint';

describe('month date helpers', () => {
  it('normalizeToMonthStart preserves YYYY-MM from string regardless of timezone', () => {
    expect(normalizeToMonthStart('2025-11-01')).toBe('2025-11-01');
    expect(normalizeToMonthStart('2025-11-15')).toBe('2025-11-01');
    expect(normalizeToMonthStart('2025-11')).toBe('2025-11-01');
  });

  it('getNextMonth advances monotonically', () => {
    expect(getNextMonth('2025-11-01')).toBe('2025-12-01');
    expect(getNextMonth('2025-12-01')).toBe('2026-01-01');
    expect(getNextMonth(getNextMonth('2025-11-01'))).toBe('2026-01-01');
  });

  it('getPreviousMonth retreats monotonically', () => {
    expect(getPreviousMonth('2025-11-01')).toBe('2025-10-01');
    expect(getPreviousMonth('2025-01-01')).toBe('2024-12-01');
    expect(getPreviousMonth(getPreviousMonth('2025-11-01'))).toBe('2025-09-01');
  });

  it('getNextMonth and getPreviousMonth are inverses', () => {
    const start = '2025-06-01';
    expect(getPreviousMonth(getNextMonth(start))).toBe(start);
    expect(getNextMonth(getPreviousMonth(start))).toBe(start);
  });
});

describe('ensureChartForecastBridge', () => {
  it('adds forecast on previous month from historical so line connects', () => {
    const input: ChartDataPoint[] = [
      { date: '2023-05-01', historical: 13 },
      { date: '2023-06-01', forecast_1: 13.5 },
    ];
    const out = ensureChartForecastBridge(input);
    const may = out.find(p => p.date === '2023-05-01');
    expect(may?.forecast_1).toBe(13);
    expect(out.find(p => p.date === '2023-06-01')?.forecast_1).toBe(13.5);
  });

  it('does not overwrite existing forecast on bridge row', () => {
    const input: ChartDataPoint[] = [
      { date: '2023-05-01', historical: 13, forecast_1: 99 },
      { date: '2023-06-01', forecast_1: 13.5 },
    ];
    const out = ensureChartForecastBridge(input);
    expect(out.find(p => p.date === '2023-05-01')?.forecast_1).toBe(99);
  });

  it('bridges multiple forecast ids on same month', () => {
    const input: ChartDataPoint[] = [
      { date: '2023-05-01', historical: 13 },
      {
        date: '2023-06-01',
        forecast_1: 14,
        forecast_2: 15,
      },
    ];
    const out = ensureChartForecastBridge(input, { forecastSeriesIds: [1, 2] });
    const may = out.find(p => p.date === '2023-05-01');
    expect(may?.forecast_1).toBe(13);
    expect(may?.forecast_2).toBe(13);
  });

  it('returns same reference when disabled', () => {
    const input: ChartDataPoint[] = [
      { date: '2023-05-01', historical: 13 },
      { date: '2023-06-01', forecast_1: 13.5 },
    ];
    const out = ensureChartForecastBridge(input, { disabled: true });
    expect(out).toBe(input);
  });

  it('falls back to last historical row when previous month row missing', () => {
    const input: ChartDataPoint[] = [
      { date: '2023-04-01', historical: 10 },
      { date: '2023-06-01', forecast_1: 12 },
    ];
    const out = ensureChartForecastBridge(input);
    const april = out.find(p => p.date === '2023-04-01');
    expect(april?.forecast_1).toBe(10);
  });

  it('does not treat upstream connection point as first forecast (no double bridge)', () => {
    const input: ChartDataPoint[] = [
      { date: '2025-10-01', historical: 70 },
      { date: '2025-11-01', historical: 74, forecast_11246: 74 },
      { date: '2025-12-01', forecast_11246: 73.563 },
    ];
    const out = ensureChartForecastBridge(input, {
      forecastSeriesIds: [11246],
    });
    expect(
      out.find(p => p.date === '2025-10-01')?.forecast_11246,
    ).toBeUndefined();
    expect(out.find(p => p.date === '2025-11-01')?.forecast_11246).toBe(74);
    expect(out.find(p => p.date === '2025-12-01')?.forecast_11246).toBe(73.563);
  });
});

describe('ensureChartForecastBridge with several history lines', () => {
  const rows = (): ChartDataPoint[] => [
    { date: '2026-08-01', historical_a: 10, historical_b: 50 },
    { date: '2026-09-01', historical_a: 11, historical_b: 52 },
    { date: '2026-10-01', forecast_1: 12, forecast_2: 53 },
    { date: '2026-11-01', forecast_1: 13, forecast_2: 54 },
  ];

  it('joins each forecast to the history it names', () => {
    const out = ensureChartForecastBridge(rows(), {
      historyKeyFor: id => (id === 1 ? 'historical_a' : 'historical_b'),
    });
    const sep = out.find(p => p.date === '2026-09-01');
    expect(sep?.forecast_1).toBe(11);
    expect(sep?.forecast_2).toBe(52);
  });

  it('leaves a forecast unjoined when it names no history', () => {
    const out = ensureChartForecastBridge(rows(), {
      historyKeyFor: id => (id === 1 ? 'historical_a' : null),
    });
    const sep = out.find(p => p.date === '2026-09-01');
    expect(sep?.forecast_1).toBe(11);
    expect(sep?.forecast_2).toBeUndefined();
  });

  it('falls back to the named history’s own last value across a gap', () => {
    const input: ChartDataPoint[] = [
      { date: '2026-06-01', historical_a: 10, historical_b: 50 },
      { date: '2026-07-01', historical_b: 51 },
      { date: '2026-08-01', historical_b: 52 },
      { date: '2026-10-01', forecast_1: 12 },
    ];
    const out = ensureChartForecastBridge(input, {
      historyKeyFor: () => 'historical_a',
    });
    expect(out.find(p => p.date === '2026-06-01')?.forecast_1).toBe(10);
    expect(out.find(p => p.date === '2026-08-01')?.forecast_1).toBeUndefined();
  });

  it('still joins the single historical line by default', () => {
    const input: ChartDataPoint[] = [
      { date: '2026-09-01', historical: 11, historical_a: 99 },
      { date: '2026-10-01', forecast_1: 12 },
    ];
    const out = ensureChartForecastBridge(input);
    expect(out.find(p => p.date === '2026-09-01')?.forecast_1).toBe(11);
  });
});
