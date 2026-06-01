import {
  applyDriversComparisonViewToPayload,
  formatLagMonthsLabel,
  getLagDisplayForView,
  parseLagMonthsFromLabel,
  resolveDriverLagLabel,
  shiftNormalizedSeriesForward,
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
