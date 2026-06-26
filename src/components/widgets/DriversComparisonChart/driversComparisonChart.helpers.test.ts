import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

import {
  DRIVER_COMPARISON_CHART_LEAD_MONTHS,
  DRIVER_FORECAST_ID_BASE,
  applyDriversComparisonViewToPayload,
  buildDriversComparisonChartData,
  compareDriversByImportance,
  computeDriversComparisonHistoricalWindowFloor,
  formatLagMonthsLabel,
  getDriversWithDataSortedByImportance,
  getLagDisplayForView,
  mergeBacktestsChartData,
  mergeDatasetHistoricalWithBacktestsChartData,
  parseLagMonthsFromLabel,
  resolveDriverLagLabel,
  shiftNormalizedSeriesBackward,
  shiftNormalizedSeriesForward,
  sortDriversByImportance,
  subtractMonthsFromMonthStart,
} from './driversComparisonChart.helpers';

describe('sortDriversByImportance', () => {
  it('orders drivers by importance descending before id tie-break', () => {
    const drivers = [
      { id: 'b', importance: 50, normalized_series: { '2015-01-01': 1 } },
      { id: 'a', importance: 100, normalized_series: { '2015-01-01': 1 } },
      { id: 'c', importance: 100, normalized_series: { '2015-01-01': 1 } },
    ];
    expect(sortDriversByImportance(drivers).map(d => d.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('puts drivers without importance last', () => {
    const drivers = [
      {
        id: 'z',
        name: 'Z',
        importance: null,
        normalized_series: { '2015-01-01': 1 },
      },
      {
        id: 'a',
        name: 'A',
        importance: 10,
        normalized_series: { '2015-01-01': 1 },
      },
    ];
    expect(
      getDriversWithDataSortedByImportance(drivers).map(d => d.id),
    ).toEqual(['a', 'z']);
  });
});

describe('compareDriversByImportance', () => {
  it('breaks equal importance ties by id', () => {
    expect(
      compareDriversByImportance(
        { id: 'b', importance: 100 },
        { id: 'a', importance: 100 },
      ),
    ).toBeGreaterThan(0);
  });
});

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
  it('shows API lag on lagged tab', () => {
    expect(getLagDisplayForView('9 to 12 month(s)', 'lagged')).toBe(
      '9 to 12 month(s)',
    );
  });

  it('shows parsed month on overlapped tab', () => {
    expect(getLagDisplayForView('9 to 12 month(s)', 'overlapped')).toBe(
      '12 month(s)',
    );
    expect(getLagDisplayForView('Unknown', 'overlapped')).toBe('—');
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

describe('shiftNormalizedSeriesBackward', () => {
  it('moves points backward by lag months', () => {
    const shifted = shiftNormalizedSeriesBackward(
      { '2015-03-01': 1.2, '2015-04-01': 1.4 },
      2,
    );
    expect(shifted['2015-01-01']).toBe(1.2);
    expect(shifted['2015-02-01']).toBe(1.4);
  });

  it('returns a shallow copy when lag is zero', () => {
    const series = { '2015-01-01': 1 };
    const shifted = shiftNormalizedSeriesBackward(series, 0);
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

  it('returns original payload for lagged tab', () => {
    expect(applyDriversComparisonViewToPayload(payload, 'lagged')).toBe(
      payload,
    );
  });

  it('returns original payload for overlapped tab when target series missing', () => {
    const incomplete = { drivers: payload.drivers } as typeof payload;
    expect(applyDriversComparisonViewToPayload(incomplete, 'overlapped')).toBe(
      incomplete,
    );
  });

  it('shifts driver series backward for overlapped tab without mutating source', () => {
    const overlapped = applyDriversComparisonViewToPayload(
      payload,
      'overlapped',
    );
    expect(overlapped).not.toBe(payload);
    expect(payload.drivers[0].normalized_series['2015-01-01']).toBe(0.5);
    expect(overlapped?.drivers[0].normalized_series['2014-11-01']).toBe(0.5);
    expect(overlapped?.target.normalized_series).toEqual(
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
    const overlapped = applyDriversComparisonViewToPayload(
      withOverallLag,
      'overlapped',
    );
    expect(overlapped?.drivers[0].normalized_series['2015-05-01']).toBe(0.8);
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

  it('returns anchor minus lead months from lagged (unshifted) merged data', () => {
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
    { date: '2014-07-01', historical: 97 },
    { date: '2014-08-01', historical: 98 },
    { date: '2014-09-01', historical: 99 },
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
    const laggedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedDriverPayload),
    );
    const overlappedPayload = applyDriversComparisonViewToPayload(
      laggedDriverPayload,
      'overlapped',
    );
    const overlappedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(overlappedPayload),
    );
    const floor = computeDriversComparisonHistoricalWindowFloor(
      laggedMerged,
      forecastIds,
    )!;

    const laggedChart = buildDriversComparisonChartData(
      laggedMerged,
      datasetHistorical,
      forecastIds,
      floor,
    );
    const overlappedChart = buildDriversComparisonChartData(
      overlappedMerged,
      datasetHistorical,
      forecastIds,
      floor,
    );

    expect(laggedChart[0]?.date).toBe('2014-10-01');
    expect(overlappedChart[0]?.date).toBe('2014-10-01');
    expect(overlappedChart[0]?.date).toBe(laggedChart[0]?.date);
  });

  it('without floor override overlapped chart starts earlier than lagged', () => {
    const laggedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(laggedDriverPayload),
    );
    const overlappedPayload = applyDriversComparisonViewToPayload(
      laggedDriverPayload,
      'overlapped',
    );
    const overlappedMerged = mergeDatasetHistoricalWithBacktestsChartData(
      datasetHistorical,
      mergeBacktestsChartData(overlappedPayload),
    );

    const laggedChart = buildDriversComparisonChartData(
      laggedMerged,
      datasetHistorical,
      forecastIds,
    );
    const overlappedChart = buildDriversComparisonChartData(
      overlappedMerged,
      datasetHistorical,
      forecastIds,
    );

    expect(laggedChart[0]?.date).toBe('2014-10-01');
    expect(overlappedChart[0]?.date).toBe('2014-07-01');
    expect(overlappedChart[0]?.date!.localeCompare(laggedChart[0]?.date!)).toBe(
      -1,
    );
  });
});
