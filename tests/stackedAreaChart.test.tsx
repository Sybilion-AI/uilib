import type { ReactNode } from 'react';

import {
  MARGIN_KEY,
  StackedAreaChart,
  compareRowZones,
  compareZones,
  stackRows,
  stackWeights,
  yearTicks,
} from '#uilib/components/ui/StackedAreaChart';
import { StackedTooltip } from '#uilib/components/ui/StackedAreaChart/StackedAreaChart.tooltip';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// recharts' ResponsiveContainer measures the DOM via ResizeObserver, which
// jsdom does not implement; replace it with a fixed-size passthrough.
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

const LAYERS = [
  { key: 'raw', label: 'Raw material' },
  { key: 'energy', label: 'Energy' },
];
const KEYS = LAYERS.map(l => l.key);

const ROWS = [
  { date: '2024-01-01', raw: 3, energy: 1, paid: 5 },
  { date: '2024-02-01', raw: 3, energy: 1, paid: 5 },
  { date: '2024-03-01', raw: 3, energy: 1, paid: 3 },
  { date: '2024-04-01', raw: 3, energy: 1, paid: 3 },
];

describe('stackRows', () => {
  it('zero-fills missing layers and adds the margin share of the total', () => {
    const rows = stackRows(
      [
        { x: 'a', raw: 3, energy: null },
        { x: 'b', raw: 2, energy: 2 },
      ],
      KEYS,
      10,
    );
    expect(rows[0]).toMatchObject({ raw: 3, energy: 0 });
    expect(rows[0][MARGIN_KEY]).toBeCloseTo(0.3);
    expect(rows[1][MARGIN_KEY]).toBeCloseTo(0.4);
  });

  it('sets the margin to 0 without a positive pct', () => {
    for (const pct of [null, undefined, 0, -5]) {
      expect(stackRows([{ raw: 1, energy: 1 }], KEYS, pct)[0][MARGIN_KEY]).toBe(
        0,
      );
    }
  });

  it('takes the margin from the total of the given layers', () => {
    const rows = stackRows([{ raw: 3, energy: 1 }], KEYS, 50, ['energy']);
    expect(rows[0][MARGIN_KEY]).toBeCloseTo(0.5);
  });

  it('does not change the input rows', () => {
    const input = [{ raw: 1 }];
    stackRows(input, KEYS, 5);
    expect(input).toEqual([{ raw: 1 }]);
  });
});

describe('stackWeights', () => {
  it('uses the last row with a positive total', () => {
    expect(
      stackWeights(
        [
          { raw: 1, energy: 3 },
          { raw: 0, energy: 0 },
        ],
        KEYS,
      ),
    ).toEqual({ raw: 25, energy: 75 });
  });

  it('rounds so the shares add up to 100', () => {
    const weights = stackWeights([{ a: 1, b: 1, c: 1 }], ['a', 'b', 'c']);
    expect(weights.a + weights.b + weights.c).toBe(100);
    const quarters = stackWeights(
      [{ a: 0.5, b: 0.5, c: 0.5, d: 1.5 }],
      ['a', 'b', 'c', 'd'],
    );
    expect(Object.values(quarters).reduce((x, y) => x + y, 0)).toBe(100);
  });

  it('prefers the last row where every layer has a value', () => {
    expect(
      stackWeights(
        [
          { raw: 1, energy: 3 },
          { raw: 2, energy: null },
        ],
        KEYS,
      ),
    ).toEqual({ raw: 25, energy: 75 });
  });

  it('counts a negative value as 0', () => {
    expect(stackWeights([{ raw: 5, energy: -1 }], KEYS)).toEqual({
      raw: 100,
      energy: 0,
    });
  });

  it('is all zeros when no row has a total', () => {
    expect(stackWeights([{ raw: 0 }], KEYS)).toEqual({ raw: 0, energy: 0 });
    expect(stackWeights([], KEYS)).toEqual({ raw: 0, energy: 0 });
  });
});

describe('compareZones', () => {
  it('splits the x range where the line crosses the stack', () => {
    const rows = stackRows(ROWS, KEYS, null);
    expect(compareZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: '2024-01-01', x2: '2024-03-01', kind: 'above' },
      { x1: '2024-03-01', x2: '2024-04-01', kind: 'below' },
    ]);
  });

  it('counts the margin as part of the stack', () => {
    // total 4, margin 50% → stack 6, so a price of 5 is below it.
    const rows = stackRows(ROWS.slice(0, 2), KEYS, 50);
    expect(compareZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: '2024-01-01', x2: '2024-02-01', kind: 'below' },
    ]);
  });

  it('bridges gaps in the compare line and ends at its last value', () => {
    const rows = stackRows(
      [
        { date: 'a', raw: 1, energy: 0, paid: 5 },
        { date: 'b', raw: 1, energy: 0, paid: null },
        { date: 'c', raw: 1, energy: 0, paid: 5 },
        { date: 'd', raw: 1, energy: 0, paid: null },
      ],
      KEYS,
      null,
    );
    expect(compareZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: 'a', x2: 'c', kind: 'above' },
    ]);
  });

  it('places a crossing inside a gap at the bridged value', () => {
    // paid runs 6 → 2 over a stack of 4: the bridged b is 4.67 (above),
    // c is 3.33 (below).
    const rows = stackRows(
      ['a', 'b', 'c', 'd'].map((date, i) => ({
        date,
        raw: 4,
        energy: 0,
        paid: i === 0 ? 6 : i === 3 ? 2 : null,
      })),
      KEYS,
      null,
    );
    expect(compareZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: 'a', x2: 'c', kind: 'above' },
      { x1: 'c', x2: 'd', kind: 'below' },
    ]);
  });

  it('ends and starts ranges on a row where the line touches the stack', () => {
    const at = (paid: number[]) =>
      compareZones(
        stackRows(
          paid.map((value, i) => ({
            date: String.fromCharCode(97 + i),
            raw: 10,
            energy: 0,
            paid: value,
          })),
          KEYS,
          null,
        ),
        'date',
        KEYS,
        'paid',
      );
    expect(at([12, 10, 8, 8])).toEqual([
      { x1: 'a', x2: 'b', kind: 'above' },
      { x1: 'b', x2: 'd', kind: 'below' },
    ]);
    expect(at([10, 8, 8])).toEqual([{ x1: 'a', x2: 'c', kind: 'below' }]);
    expect(at([12, 10, 12])).toEqual([
      { x1: 'a', x2: 'b', kind: 'above' },
      { x1: 'b', x2: 'c', kind: 'above' },
    ]);
  });

  it('judges the line against the given layers only', () => {
    // Without raw (3), the stack is 1, so a price of 3 is above it.
    const rows = stackRows(ROWS.slice(2), KEYS, null, ['energy']);
    expect(compareZones(rows, 'date', ['energy'], 'paid')).toEqual([
      { x1: '2024-03-01', x2: '2024-04-01', kind: 'above' },
    ]);
  });

  it('returns nothing without a compare value', () => {
    expect(
      compareZones(
        stackRows([{ date: 'a', raw: 1 }], KEYS),
        'date',
        KEYS,
        'paid',
      ),
    ).toEqual([]);
  });
});

describe('compareZones with missing cost', () => {
  it('puts a row with no layer value on neither side', () => {
    const rows = stackRows(
      [
        { date: 'a', paid: 3 },
        { date: 'b', paid: 3 },
        { date: 'c', raw: 1, energy: 1, paid: 3 },
        { date: 'd', raw: 1, energy: 1, paid: 3 },
      ],
      KEYS,
      null,
    );
    expect(compareZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: 'c', x2: 'd', kind: 'above' },
    ]);
  });
});

describe('compareRowZones', () => {
  it('gives each row with a side its own zone', () => {
    const rows = stackRows(ROWS.slice(1, 3), KEYS, null);
    expect(compareRowZones(rows, 'date', KEYS, 'paid')).toEqual([
      { x1: '2024-02-01', x2: '2024-02-01', kind: 'above' },
      { x1: '2024-03-01', x2: '2024-03-01', kind: 'below' },
    ]);
  });
});

describe('yearTicks', () => {
  it('returns the first row of each year once there are enough years', () => {
    const rows = ['2022-06-01', '2022-12-01', '2023-01-01', '2024-03-01'].map(
      date => ({ date }),
    );
    expect(yearTicks(rows, 'date')).toEqual([
      '2022-06-01',
      '2023-01-01',
      '2024-03-01',
    ]);
  });

  it('is undefined below the minimum number of years or for non-dates', () => {
    expect(
      yearTicks([{ date: '2022-01-01' }, { date: '2023-01-01' }], 'date'),
    ).toBeUndefined();
    expect(
      yearTicks([{ q: 'Q1' }, { q: 'Q2' }, { q: 'Q3' }], 'q'),
    ).toBeUndefined();
    const epoch = [1704067200000, 1735689600000, 1767225600000];
    expect(
      yearTicks(
        epoch.map(t => ({ t })),
        't',
      ),
    ).toBeUndefined();
    expect(
      yearTicks(
        ['17040672', '17356896', '17672256'].map(t => ({ t })),
        't',
      ),
    ).toBeUndefined();
  });
});

describe('StackedAreaChart', () => {
  it('draws the layers as stacked areas with the overlay line', () => {
    const { container } = render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        overlays={[{ key: 'paid', label: 'Prices paid' }]}
      />,
    );
    expect(container.querySelectorAll('.recharts-area').length).toBe(2);
    expect(container.querySelectorAll('.recharts-bar').length).toBe(0);
    expect(container.querySelectorAll('.recharts-line').length).toBe(1);
    expect(screen.getByText('Prices paid')).toBeInTheDocument();
  });

  it('draws bars below barsBelow rows', () => {
    const { container } = render(
      <StackedAreaChart data={ROWS.slice(0, 2)} xKey="date" layers={LAYERS} />,
    );
    expect(container.querySelectorAll('.recharts-bar').length).toBe(2);
    expect(container.querySelectorAll('.recharts-area').length).toBe(0);
  });

  it('shows each layer weight in the legend', () => {
    render(<StackedAreaChart data={ROWS} xKey="date" layers={LAYERS} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shares the weights among the visible layers', () => {
    render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        hiddenKeys={new Set(['raw'])}
      />,
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText('75%')).toBeNull();
  });

  it('hides the weights when showWeights is false', () => {
    render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        showWeights={false}
      />,
    );
    expect(screen.queryByText('75%')).toBeNull();
  });

  it('shows the margin layer only with a positive pct', () => {
    const { container, rerender } = render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        margin={{ pct: 0 }}
      />,
    );
    expect(container.querySelectorAll('.recharts-area').length).toBe(2);
    expect(screen.queryByText('margin 0%')).toBeNull();

    rerender(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        margin={{ pct: 12 }}
      />,
    );
    expect(container.querySelectorAll('.recharts-area').length).toBe(3);
    expect(screen.getByText('margin 12%')).toBeInTheDocument();
  });

  it('shades the compare zones and names them in the legend', async () => {
    const { container } = render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        overlays={[{ key: 'paid', label: 'Prices paid', compare: true }]}
        zoneLabels={{ above: 'Paid above cost', below: 'Paid below cost' }}
      />,
    );
    expect(screen.getByText('Paid above cost')).toBeInTheDocument();
    expect(screen.getByText('Paid below cost')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        container.querySelectorAll('.recharts-reference-area').length,
      ).toBe(2),
    );
  });

  it('names only the zone kinds the chart has', () => {
    render(
      <StackedAreaChart
        data={ROWS.slice(0, 2)}
        xKey="date"
        layers={LAYERS}
        barsBelow={0}
        overlays={[{ key: 'paid', compare: true }]}
      />,
    );
    expect(screen.getByText('above')).toBeInTheDocument();
    expect(screen.queryByText('below')).toBeNull();
  });

  it('drops the zones when the compare line is hidden', async () => {
    const { container } = render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        overlays={[{ key: 'paid', label: 'Prices paid', compare: true }]}
      />,
    );
    await waitFor(() =>
      expect(
        container.querySelectorAll('.recharts-reference-area').length,
      ).toBe(2),
    );
    fireEvent.click(screen.getByRole('button', { name: /Prices paid/ }));
    expect(screen.queryByText('above')).toBeNull();
    await waitFor(() =>
      expect(
        container.querySelectorAll('.recharts-reference-area').length,
      ).toBe(0),
    );
  });

  it('draws no zones without a compare overlay', () => {
    render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        overlays={[{ key: 'paid' }]}
      />,
    );
    expect(screen.queryByText('above')).toBeNull();
  });

  it('hides a layer when its legend entry is clicked', () => {
    const onToggleKey = jest.fn();
    const { container } = render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        onToggleKey={onToggleKey}
      />,
    );
    const button = screen.getByRole('button', { name: /Energy/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(onToggleKey).toHaveBeenCalledWith('energy');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('.recharts-area').length).toBe(1);
  });

  it('makes the legend read-only with hiddenKeys and no onToggleKey', () => {
    render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        hiddenKeys={new Set()}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('leaves visibility to the host when hiddenKeys is given', () => {
    const onToggleKey = jest.fn();
    render(
      <StackedAreaChart
        data={ROWS}
        xKey="date"
        layers={LAYERS}
        hiddenKeys={new Set(['raw'])}
        onToggleKey={onToggleKey}
      />,
    );
    const raw = screen.getByRole('button', { name: /Raw material/ });
    expect(raw).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: /Energy/ }));
    expect(onToggleKey).toHaveBeenCalledWith('energy');
    expect(screen.getByRole('button', { name: /Energy/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('labels the x axis by year with yearTicks', async () => {
    const rows = ['2022', '2023', '2024'].flatMap(year =>
      ['01', '07'].map(month => ({
        date: `${year}-${month}-01`,
        raw: 1,
        energy: 1,
      })),
    );
    const { container } = render(
      <StackedAreaChart data={rows} xKey="date" layers={LAYERS} yearTicks />,
    );
    const xTicks = () =>
      Array.from(
        container.querySelectorAll(
          '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value',
        ),
      ).map(node => node.textContent);
    // Axis ticks paint a render after layout.
    await waitFor(() => expect(xTicks()).toEqual(['2022', '2023', '2024']));
  });
});

describe('StackedTooltip', () => {
  const config = {
    raw: { label: 'Raw material', color: '#111111' },
    paid: { label: 'Prices paid', color: '#222222' },
  };

  it('shows zero values, labels from the config and formatted values', () => {
    render(
      <StackedTooltip
        active
        label="2024-01-01"
        payload={[
          { dataKey: 'raw', name: 'raw', value: 0, color: 'white' },
          { dataKey: 'paid', name: 'paid', value: 3.5 },
          { dataKey: 'energy', name: 'energy', value: undefined },
        ]}
        config={config}
        valueFormatter={value => `€${value.toFixed(2)}`}
        labelFormatter={value => `Month ${value}`}
      />,
    );
    expect(screen.getByText('Month 2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Raw material')).toBeInTheDocument();
    expect(screen.getByText('€0.00')).toBeInTheDocument();
    expect(screen.getByText('€3.50')).toBeInTheDocument();
    expect(screen.queryByText('energy')).toBeNull();
  });

  it('colours each row from the config, not the stack stroke', () => {
    const { container } = render(
      <StackedTooltip
        active
        label="x"
        payload={[{ dataKey: 'raw', name: 'raw', value: 1, color: 'white' }]}
        config={config}
      />,
    );
    const dot = container.querySelector<HTMLElement>('[style]');
    expect(dot?.style.getPropertyValue('--color-bg')).toBe('#111111');
  });

  it('renders nothing when inactive', () => {
    const { container } = render(
      <StackedTooltip
        active={false}
        payload={[{ dataKey: 'raw', value: 1 }]}
        config={config}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
