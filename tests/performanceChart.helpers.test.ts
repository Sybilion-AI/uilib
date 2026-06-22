import { extendCustomPerformanceDriftSeedToHistoricalEnd } from '#uilib/components/widgets/PerformanceChart/performanceChart.helpers';

describe('extendCustomPerformanceDriftSeedToHistoricalEnd', () => {
  it('extends seed rows to latest historical month and terminates', () => {
    const historicalByDate = new Map<string, number>([
      ['2025-09-01', 100],
      ['2025-10-01', 110],
      ['2025-11-01', 120],
    ]);

    const seed = {
      dates: ['2025-09-01'],
      grid: [[100, 101]],
      perHorizonDates: [['2025-09-01', '2025-10-01']],
    };

    const result = extendCustomPerformanceDriftSeedToHistoricalEnd(
      seed,
      historicalByDate,
    );

    expect(result.dates).toEqual(['2025-09-01', '2025-10-01', '2025-11-01']);
    expect(result.grid).toHaveLength(3);
    expect(result.perHorizonDates).toHaveLength(3);
    expect(result.dates[result.dates.length - 1]).toBe('2025-11-01');
  });

  it('does not loop when seed already reaches latest historical month', () => {
    const historicalByDate = new Map<string, number>([['2025-11-01', 120]]);

    const seed = {
      dates: ['2025-11-01'],
      grid: [[120]],
      perHorizonDates: [['2025-11-01']],
    };

    const result = extendCustomPerformanceDriftSeedToHistoricalEnd(
      seed,
      historicalByDate,
    );

    expect(result.dates).toEqual(['2025-11-01']);
    expect(result.grid).toHaveLength(1);
  });

  it('advances months forward from Nov 2025 repro case', () => {
    const historicalByDate = new Map<string, number>([
      ['2025-10-01', 70],
      ['2025-11-01', 74],
      ['2025-12-01', 78],
    ]);

    const seed = {
      dates: ['2025-10-01'],
      grid: [[70]],
      perHorizonDates: [['2025-10-01']],
    };

    const result = extendCustomPerformanceDriftSeedToHistoricalEnd(
      seed,
      historicalByDate,
    );

    expect(result.dates).toEqual(['2025-10-01', '2025-11-01', '2025-12-01']);
    expect(result.dates.every((d, i, arr) => i === 0 || d > arr[i - 1])).toBe(
      true,
    );
  });
});
