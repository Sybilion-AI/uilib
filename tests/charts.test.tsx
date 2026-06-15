import type { ReactNode } from 'react';

import { BarChart } from '#uilib/components/ui/BarChart';
import { DonutChart } from '#uilib/components/ui/DonutChart';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// recharts' ResponsiveContainer measures the DOM via ResizeObserver, which
// jsdom does not implement; replace it with a fixed-size passthrough so the
// inner chart renders synchronously.
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

const DONUT_DATA = [
  { key: 'iron', value: 40, label: 'Iron ore' },
  { key: 'coal', value: 35, label: 'Coking coal' },
  { key: 'scrap', value: 25, label: 'Scrap', color: '#123456' },
];

const BAR_DATA = [
  { month: 'Jan', actual: 10, forecast: 12 },
  { month: 'Feb', actual: 14, forecast: 13 },
];

const BAR_SERIES = [
  { key: 'actual', label: 'Actual' },
  { key: 'forecast', label: 'Forecast' },
];

describe('DonutChart', () => {
  it('renders an svg chart with legend labels', () => {
    const { container } = render(<DonutChart data={DONUT_DATA} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('Iron ore')).toBeInTheDocument();
    expect(screen.getByText('Coking coal')).toBeInTheDocument();
    expect(screen.getByText('Scrap')).toBeInTheDocument();
  });

  it('registers per-slice colour variables, honouring overrides', () => {
    const { container } = render(<DonutChart data={DONUT_DATA} />);
    const style = container.querySelector('style');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('--color-iron');
    expect(style?.textContent).toContain('--color-scrap: #123456');
  });

  it('hides the legend when showLegend is false', () => {
    render(<DonutChart data={DONUT_DATA} showLegend={false} />);
    expect(screen.queryByText('Iron ore')).toBeNull();
  });

  it('renders the centre value and caption', () => {
    const { container } = render(
      <DonutChart data={DONUT_DATA} centerValue="100" centerCaption="total" />,
    );
    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('total');
  });

  it('falls back to slice keys when labels are missing', () => {
    render(<DonutChart data={[{ key: 'solo', value: 1 }]} />);
    expect(screen.getByText('solo')).toBeInTheDocument();
  });

  it('applies a fixed height and custom className', () => {
    const { container } = render(
      <DonutChart data={DONUT_DATA} height={240} className="custom" />,
    );
    expect(container.querySelector('.custom')).not.toBeNull();
    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart).not.toBeNull();
    expect(chart?.getAttribute('style')).toContain('height: 240px');
  });
});

describe('BarChart', () => {
  it('renders bars for every series with legend labels', () => {
    const { container } = render(
      <BarChart data={BAR_DATA} categoryKey="month" series={BAR_SERIES} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('.recharts-bar').length).toBe(2);
    expect(screen.getByText('Actual')).toBeInTheDocument();
    expect(screen.getByText('Forecast')).toBeInTheDocument();
  });

  it('renders category labels on the axis', () => {
    render(
      <BarChart data={BAR_DATA} categoryKey="month" series={BAR_SERIES} />,
    );
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
  });

  it('registers per-series colour variables', () => {
    const { container } = render(
      <BarChart
        data={BAR_DATA}
        categoryKey="month"
        series={[{ key: 'actual', color: '#abcdef' }]}
      />,
    );
    expect(container.querySelector('style')?.textContent).toContain(
      '--color-actual: #abcdef',
    );
  });

  it('hides the legend and grid when disabled', () => {
    const { container } = render(
      <BarChart
        data={BAR_DATA}
        categoryKey="month"
        series={BAR_SERIES}
        showLegend={false}
        showGrid={false}
      />,
    );
    expect(screen.queryByText('Actual')).toBeNull();
    expect(container.querySelector('.recharts-cartesian-grid')).toBeNull();
  });

  it('renders in horizontal orientation', () => {
    const { container } = render(
      <BarChart
        data={BAR_DATA}
        categoryKey="month"
        series={BAR_SERIES}
        orientation="horizontal"
      />,
    );
    expect(container.querySelectorAll('.recharts-bar').length).toBe(2);
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('renders stacked mode without crashing', () => {
    const { container } = render(
      <BarChart
        data={BAR_DATA}
        categoryKey="month"
        series={BAR_SERIES}
        mode="stacked"
      />,
    );
    expect(container.querySelectorAll('.recharts-bar').length).toBe(2);
  });

  it('formats numeric axis ticks with valueFormatter', () => {
    render(
      <BarChart
        data={BAR_DATA}
        categoryKey="month"
        series={BAR_SERIES}
        valueFormatter={value => `${value}t`}
      />,
    );
    expect(screen.getAllByText('0t').length).toBeGreaterThan(0);
  });
});
