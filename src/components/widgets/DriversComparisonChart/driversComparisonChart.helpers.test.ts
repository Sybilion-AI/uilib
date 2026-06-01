import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

import {
  DRIVER_COMPARISON_CHART_LEAD_MONTHS,
  DRIVER_FORECAST_ID_BASE,
  applyDriversComparisonViewToPayload,
  buildDriversComparisonChartData,
  computeDriversComparisonHistoricalWindowFloor,
  formatLagMonthsLabel,
  getLagDisplayForView,
  mergeBacktestsChartData,
  mergeDatasetHistoricalWithBacktestsChartData,
  parseLagMonthsFromLabel,
  resolveDriverLagLabel,
  shiftNormalizedSeriesForward,
  subtractMonthsFromMonthStart,
} from './driversComparisonChart.helpers';

describe('parseLagMonthsFromLabel', () => {
  it('uses max month for ranges', () => {
    expect(parseLagMonthsFromLabel('9 to 12 month(s)')).toBe(12);
  });

  it('parses single month labels', () => {
    expect(parseLagMonthsFromLabel('2 month(s)')).toBe(2);
    expect(parseLagMonthsFromLabel('~1 month(s)')).toBe(1);
  });

  it('converts quarters to months', () => {
    expect(parseLagMonthsFromLabel('1 quarter(s)')).toBe(3);
  });

  it('returns null for unknown or empty labels', () => {
    expect(parseLagMonthsFromLabel('Unknown')).toBeNull();
    expect(parseLagMonthsFromLabel('no lag')).toBeNull();
    expect(parseLagMonthsFromLabel('')).toBeNull();
    expect(parseLagMonthsFromLabel(null)).toBeNull();
  });

  it('parses en-dash month ranges', () => {
    expect(parseLagMonthsFromLabel('9–12 month(s)')).toBe(12);
  });
});

describe('resolveDriverLagLabel', () => {
  it('reads lag or overall_lag', () => {
    expect(resolveDriverLagLabel({ lag: '2 month(s)' })).toBe('2 month(s)');
    expect(resolveDriverLagLabel({ overall_lag: '3 month(s)' })).toBe(
      '3 month(s)',
    );
  });
});

describe('formatLagMonthsLabel', () => {
  it('formats month count', () => {
    expect(formatLagMonthsLabel(12)).toBe('12 month(s)');
  });
});

describe('getLagDisplayForView', () => {
  it('shows API lag on overlapped tab', () => {
    expect(getLagDisplayForView('9 to 12 month(s)', 'overlapped')).toBe(
      '9 to 12 month(s)',
    );
  });

  it('shows parsed month on lagged tab', () => {
    expect(getLagDisplayForView('9 to 12 month(s)', 'lagged')).toBe(
      '12 month(s)',
    );
    expect(getLagDisplayForView('Unknown', 'lagged')).toBe('—');
  });
});

describe('shiftNormalizedSeriesForward', () => {
  it('moves points forward by lag months', () => {
    const shifted = shiftNormalizedSeriesForward(
      { '2015-01-01': 1.2, '2015-02-01': 1.4 },
      2,
    );
    expect(shifted['2015-03-01']).toBe(1.2);
    expect(shifted['2015-04-01']).toBe(1.4);
  });

  it('returns a shallow copy when lag is zero', () => {
    const series = { '2015-01-01': 1 };
    const shifted = shiftNormalizedSeriesForward(series, 0);
    expect(shifted).toEqual(series);
    expect(shifted).not.toBe(series);
  });
});

describe('applyDriversComparisonViewToPayload', () => {
  const payload = {
    target: {
      id: 'target',
      name: 'Target',
      normalized_series: { '2015-01-01': 1 },
    },
    drivers: [
      {
        id: 'd1',
        name: 'Driver',
        lag: '2 month(s)',
        normalized_series: { '2015-01-01': 0.5 },
      },
    ],
  };

  it('returns original payload for overlapped tab', () => {
    expect(applyDriversComparisonViewToPayload(payload, 'overlapped')).toBe(
      payload,
    );
  });

  it('shifts driver series for lagged tab without mutating source', () => {
    const lagged = applyDriversComparisonViewToPayload(payload, 'lagged');
    expect(lagged).not.toBe(payload);
    expect(payload.drivers[0].normalized_series['2015-01-01']).toBe(0.5);
    expect(lagged?.drivers[0].normalized_series['2015-03-01']).toBe(0.5);
    expect(lagged?.target.normalized_series).toEqual(
      payload.target.normalized_series,
    );
  });

  it('shifts using overall_lag when lag is absent', () => {
    const withOverallLag = {
      ...payload,
      drivers: [
        {
          id: 'd2',
          name: 'Driver 2',
          overall_lag: '1 month(s)',
          normalized_series: { '2015-06-01': 0.8 },
        },
      ],
    };
    const lagged = applyDriversComparisonViewToPayload(
      withOverallLag,
      'lagged',
    );
    expect(lagged?.drivers[0].normalized_series['2015-07-01']).toBe(0.8);
  });
});

describe('computeDriversComparisonHistoricalWindowFloor', () => {
  const laggedDriverPayload = {
    target: {
      id: 'target',
      name: 'Target',
      normalized_series: {
        '2014-10-01': 1.0,
        '2014-11-01': 1.01,
        '2014-12-01': 1.02,
        '2015-01-01': 1.03,
        '2015-02-01': 1.04,
        '2015-03-01': 1.05,
        '2015-04-01': 1.06,
        '2015-05-01': 1.07,
      },
    },
    drivers: [
      {
        id: 'd1',
        name: 'Driver',
        lag: '3 month(s)',
        normalized_series: {
          '2015-04-01': 0.5,
          '2015-05-01': 0.6,
        },
      },
    ],
  };

  const datasetHistorical: ChartDataPoint[] = [
    { date: '2014-10-01', historical: 100 },
    { date: '2014-11-01', historical: 101 },
    { date: '2014-12-01', historical: 102 },
    { date: '2015-01-01', historical: 103 },
    { date: '2015-02-01', historical: 104 },
    { date: '2015-03-01', historical: 105 },
    { date: '2015-04-01', historical: 106 },
  ];

  const forecastIds = [DRIVER_FORECAST_ID_BASE];

  it('returns anchor minus lead months from overlapped merged data', () => {
    const merged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedDriverPayload),
    );
    const floor = computeDriversComparisonHistoricalWindowFloor(
      merged,
      forecastIds,
    );
    expect(floor).toBe(
      subtractMonthsFromMonthStart(
        '2015-04-01',
        DRIVER_COMPARISON_CHART_LEAD_MONTHS,
      ),
    );
    expect(floor).toBe('2014-10-01');
  });
});

describe('buildDriversComparisonChartData historical window floor', () => {
  const laggedDriverPayload = {
    target: {
      id: 'target',
      name: 'Target',
      normalized_series: {
        '2014-10-01': 1.0,
        '2014-11-01': 1.01,
        '2014-12-01': 1.02,
        '2015-01-01': 1.03,
        '2015-02-01': 1.04,
        '2015-03-01': 1.05,
        '2015-04-01': 1.06,
        '2015-05-01': 1.07,
      },
    },
    drivers: [
      {
        id: 'd1',
        name: 'Driver',
        lag: '3 month(s)',
        normalized_series: {
          '2015-04-01': 0.5,
          '2015-05-01': 0.6,
        },
      },
    ],
  };

  const datasetHistorical: ChartDataPoint[] = [
    { date: '2014-10-01', historical: 100 },
    { date: '2014-11-01', historical: 101 },
    { date: '2014-12-01', historical: 102 },
    { date: '2015-01-01', historical: 103 },
    { date: '2015-02-01', historical: 104 },
    { date: '2015-03-01', historical: 105 },
    { date: '2015-04-01', historical: 106 },
  ];

  const forecastIds = [DRIVER_FORECAST_ID_BASE];

  it('keeps same xMin for lagged and overlapped when floor is pinned', () => {
    const overlappedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedDriverPayload),
    );
    const laggedPayload = applyDriversComparisonViewToPayload(
      laggedDriverPayload,
      'lagged',
    );
    const laggedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedPayload),
    );
    const floor = computeDriversComparisonHistoricalWindowFloor(
      overlappedMerged,
      forecastIds,
    )!;

    const overlappedChart = buildDriversComparisonChartData(
      overlappedMerged,
      datasetHistorical,
      forecastIds,
      floor,
    );
    const laggedChart = buildDriversComparisonChartData(
      laggedMerged,
      datasetHistorical,
      forecastIds,
      floor,
    );

    expect(overlappedChart[0]?.date).toBe('2014-10-01');
    expect(laggedChart[0]?.date).toBe('2014-10-01');
    expect(laggedChart[0]?.date).toBe(overlappedChart[0]?.date);
  });

  it('without floor override lagged chart starts later than overlapped', () => {
    const overlappedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedDriverPayload),
    );
    const laggedPayload = applyDriversComparisonViewToPayload(
      laggedDriverPayload,
      'lagged',
    );
    const laggedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedPayload),
    );

    const overlappedChart = buildDriversComparisonChartData(
      overlappedMerged,
      datasetHistorical,
      forecastIds,
    );
    const laggedChart = buildDriversComparisonChartData(
      laggedMerged,
      datasetHistorical,
      forecastIds,
    );

    expect(overlappedChart[0]?.date).toBe('2014-10-01');
    expect(laggedChart[0]?.date).toBe('2015-01-01');
    expect(laggedChart[0]?.date!.localeCompare(overlappedChart[0]?.date!)).toBe(
      1,
    );
  });
});
