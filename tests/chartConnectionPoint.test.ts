import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { ensureChartForecastBridge } from '#uilib/utils/chartConnectionPoint';

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
});
