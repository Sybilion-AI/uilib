import { render } from '@testing-library/react';

import { ChartContext } from '../Chart.context';
import { ChartTooltipContent } from './ChartTooltipContent';

const payload = [
  { dataKey: 'historical', name: 'History', value: 1234.5678, color: '#000' },
  { dataKey: 'band', name: 'Range', value: [0.5, 2.25], color: '#0aa' },
  { dataKey: 'driver', name: 'Driver', value: 0, color: '#a00' },
];

function rows(valueFormatter?: (value: number) => string) {
  const { container } = render(
    <ChartContext.Provider value={{ config: {} }}>
      <ChartTooltipContent
        active
        payload={payload}
        label="2026-03-01"
        valueFormatter={valueFormatter}
      />
    </ChartContext.Provider>,
  );
  return [...container.querySelectorAll('span')]
    .map(s => s.textContent)
    .filter(Boolean);
}

describe('ChartTooltipContent values', () => {
  it('formats each number, both ends of a range, with valueFormatter', () => {
    const fmt = (v: number) => `€${v.toFixed(1)}`;
    expect(rows(fmt)).toEqual([
      'History',
      '€1234.6',
      'Range',
      '€0.5 – €2.3',
      'Driver',
      '€0.0',
    ]);
  });

  it('prints the raw value without one, zero included', () => {
    const text = rows();
    expect(text).toContain('Driver');
    expect(text[text.indexOf('Driver') + 1]).toBe('0');
    expect(text[text.indexOf('History') + 1]).toBe(
      (1234.5678).toLocaleString(undefined, { maximumFractionDigits: 20 }),
    );
  });

  it('shows a dash for a range end with no number', () => {
    const { container } = render(
      <ChartContext.Provider value={{ config: {} }}>
        <ChartTooltipContent
          active
          payload={[
            { dataKey: 'band', name: 'Range', value: [null, 5], color: '#0aa' },
          ]}
          label="2026-03-01"
        />
      </ChartContext.Provider>,
    );
    expect(container.textContent).toContain('— – 5');
  });

  it('prints a string value as is and leaves out NaN and empty ranges', () => {
    const { container } = render(
      <ChartContext.Provider value={{ config: {} }}>
        <ChartTooltipContent
          active
          payload={[
            { dataKey: 'a', name: 'Text', value: '12.5', color: '#000' },
            { dataKey: 'b', name: 'Broken', value: Number.NaN, color: '#000' },
            { dataKey: 'c', name: 'Empty', value: [null, null], color: '#000' },
          ]}
          label="2026-03-01"
          valueFormatter={v => v.toFixed(2)}
        />
      </ChartContext.Provider>,
    );
    const values = [...container.querySelectorAll('span')]
      .map(s => s.textContent)
      .filter(Boolean);
    expect(values).toEqual(['Text', '12.5', 'Broken', 'Empty']);
  });
});
