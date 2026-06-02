import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

import {
  calculateChartYRange,
  isKeyExcludedFromYScale,
} from './useChartYRange';

const makePoint = (values: Record<string, number>): ChartDataPoint => ({
  date: '2024-01-01',
  ...values,
});

describe('isKeyExcludedFromYScale', () => {
  it('excludes historical when hidden', () => {
    expect(isKeyExcludedFromYScale('historical', new Set(['historical']))).toBe(
      true,
    );
  });

  it('excludes quantile keys when parent forecast is hidden', () => {
    expect(
      isKeyExcludedFromYScale('q0.05_123', new Set(['forecast_123'])),
    ).toBe(true);
  });

  it('excludes band keys when parent forecast is hidden', () => {
    expect(
      isKeyExcludedFromYScale('band_10_90_123', new Set(['forecast_123'])),
    ).toBe(true);
  });
});

describe('calculateChartYRange hidden series exclusion', () => {
  const chartData: ChartDataPoint[] = [
    makePoint({ historical: 10, forecast_1: 100, forecast_2: 50 }),
  ];

  it('pin mode: two forecasts, one hidden - Y range from visible only', () => {
    const hiddenSeries = new Set(['forecast_1']);
    const range = calculateChartYRange(chartData, {
      excludeQuantileBands: true,
      hiddenSeries,
      includeHiddenInYScale: false,
    });

    expect(range).toEqual({ yMin: 6, yMax: 54 });
  });

  it('hidden historical excluded from Y range', () => {
    const dataWithOutlierHistorical: ChartDataPoint[] = [
      makePoint({ historical: 1000, forecast_1: 50, forecast_2: 60 }),
    ];
    const hiddenSeries = new Set(['historical']);
    const range = calculateChartYRange(dataWithOutlierHistorical, {
      excludeQuantileBands: true,
      hiddenSeries,
      includeHiddenInYScale: false,
    });

    expect(range).toEqual({ yMin: 49, yMax: 61 });
  });

  it('includeHiddenInYScale=true preserves old behavior', () => {
    const hiddenSeries = new Set(['forecast_1']);
    const range = calculateChartYRange(chartData, {
      excludeQuantileBands: true,
      hiddenSeries,
      includeHiddenInYScale: true,
    });

    expect(range).toEqual({ yMin: 1, yMax: 109 });
  });

  it('quantile keys excluded when forecast hidden', () => {
    const dataWithQuantile: ChartDataPoint[] = [
      makePoint({ forecast_456: 50, forecast_789: 70, 'q0.05_123': 500 }),
    ];
    const hiddenSeries = new Set(['forecast_123']);
    const range = calculateChartYRange(dataWithQuantile, {
      excludeQuantileBands: false,
      hiddenSeries,
      includeHiddenInYScale: false,
    });

    expect(range).toEqual({ yMin: 48, yMax: 72 });
  });
});
