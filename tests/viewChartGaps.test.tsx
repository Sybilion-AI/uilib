import type { ReactNode } from 'react';

import { BarChart } from '#uilib/components/ui/BarChart';
import { BaseChartWrapper } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import { StackedAreaChart } from '#uilib/components/ui/StackedAreaChart';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// ENG-1777: what the app's decision-view and chat charts need from uilib.

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

const BARS = [
  { supplier: 'A', q1: 3, q2: 4 },
  { supplier: 'B', q1: 5, q2: 2 },
];
const BAR_SERIES = [
  { key: 'q1', label: 'Quote 1' },
  { key: 'q2', label: 'Quote 2' },
];

describe('BarChart', () => {
  it('names both axes', () => {
    render(
      <BarChart
        data={BARS}
        categoryKey="supplier"
        series={BAR_SERIES}
        categoryAxisLabel="Supplier"
        valueAxisLabel="Price (EUR/t)"
      />,
    );
    expect(screen.getByText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Price (EUR/t)')).toBeInTheDocument();
  });

  it('formats the category ticks', () => {
    render(
      <BarChart
        data={BARS}
        categoryKey="supplier"
        series={BAR_SERIES}
        categoryTickFormatter={v => `Supplier ${v}`}
      />,
    );
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
  });

  it('hides a series from its legend entry by itself', () => {
    const { container } = render(
      <BarChart data={BARS} categoryKey="supplier" series={BAR_SERIES} />,
    );
    expect(container.querySelectorAll('.recharts-bar').length).toBe(2);
    const entry = screen.getByRole('button', { name: 'Quote 1' });
    expect(entry).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(entry);
    expect(entry).toHaveAttribute('aria-pressed', 'false');
  });

  it('leaves visibility to the host with hiddenKeys', () => {
    const onToggleKey = jest.fn();
    render(
      <BarChart
        data={BARS}
        categoryKey="supplier"
        series={BAR_SERIES}
        hiddenKeys={new Set(['q2'])}
        onToggleKey={onToggleKey}
      />,
    );
    const entry = screen.getByRole('button', { name: 'Quote 2' });
    expect(entry).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(entry);
    expect(onToggleKey).toHaveBeenCalledWith('q2');
    expect(entry).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows plain legend entries when the host fixes visibility', () => {
    render(
      <BarChart
        data={BARS}
        categoryKey="supplier"
        series={BAR_SERIES}
        hiddenKeys={new Set()}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Quote 1')).toBeInTheDocument();
  });
});

describe('StackedAreaChart axis titles', () => {
  it('names both axes', () => {
    render(
      <StackedAreaChart
        data={[
          { date: '2024-01-01', raw: 3 },
          { date: '2024-02-01', raw: 4 },
          { date: '2024-03-01', raw: 5 },
        ]}
        xKey="date"
        layers={[{ key: 'raw', label: 'Raw' }]}
        xAxisLabel="Month"
        yAxisLabel="Cost (EUR/t)"
      />,
    );
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Cost (EUR/t)')).toBeInTheDocument();
  });
});

const lineChart = (props: Partial<Parameters<typeof BaseChartWrapper>[0]>) =>
  render(
    <BaseChartWrapper
      renderId="gaps"
      chartData={[]}
      loading={false}
      hasCombinedData
      isDarkTheme={false}
      disableAnimation
      showEndDots={false}
      {...props}
    />,
  );

describe('BaseChartWrapper lines with gaps', () => {
  const ROWS = [
    { date: '2024-01-01', historical_a: 1 },
    { date: '2024-02-01' },
    { date: '2024-03-01', historical_a: 3 },
    { date: '2024-04-01' },
    { date: '2024-05-01', historical_a: 5, forecast_1: 5 },
    { date: '2024-06-01', historical_a: 6, forecast_1: 6 },
  ];

  it('dots a point the line leaves alone between two gaps', () => {
    const { container } = lineChart({
      chartData: ROWS,
      historyData: [{ id: 'a', name: 'A', color: '#000' }],
      connectHistoryNulls: false,
    });
    // Jan (gap after) and Mar (gaps on both sides); May and Jun join.
    expect(container.querySelectorAll('circle[r="3"]').length).toBe(2);
  });

  it('lets a line bridge its gaps on its own', () => {
    const { container } = lineChart({
      chartData: ROWS,
      historyData: [{ id: 'a', name: 'A', color: '#000', connectNulls: true }],
      connectHistoryNulls: false,
    });
    expect(container.querySelectorAll('circle[r="3"]').length).toBe(0);
  });
});

describe('BaseChartWrapper x axis', () => {
  it('labels only the given ticks', () => {
    lineChart({
      chartData: [
        { date: '2024-01-01', historical_a: 1 },
        { date: '2024-01-15', historical_a: 2 },
        { date: '2024-02-01', historical_a: 3 },
      ],
      historyData: [{ id: 'a', name: 'A' }],
      xTicks: ['2024-01-01', '2024-02-01'],
      formatDate: v => `tick ${v}`,
    });
    expect(screen.getAllByText('tick 2024-01-01').length).toBeGreaterThan(0);
    expect(screen.queryByText('tick 2024-01-15')).toBeNull();
  });

  it('spaces a number axis by value', () => {
    lineChart({
      chartData: [
        { date: '0', historical_a: 1 },
        { date: '1', historical_a: 2 },
        { date: '10', historical_a: 3 },
      ],
      historyData: [{ id: 'a', name: 'A' }],
      xAxisType: 'number',
      formatDate: v => `x=${v}`,
    });
    // A value axis labels round steps between the ends, not the rows.
    const ticks = screen.getAllByText(/^x=/).map(t => t.textContent);
    expect(ticks).toContain('x=0');
    expect(ticks).toContain('x=10');
    expect(ticks.some(t => !['x=0', 'x=1', 'x=10'].includes(t ?? ''))).toBe(
      true,
    );
  });
});
