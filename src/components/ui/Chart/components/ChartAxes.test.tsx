import { render } from '@testing-library/react';

import { formatNumber as compact } from '../tools/formatters';
import { ChartAxes } from './ChartAxes';

// Recharts' axes draw no tick text in jsdom, so this reads the formatter
// ChartAxes hands its YAxis.
const yAxisProps: Array<{ tickFormatter?: (v: number) => string }> = [];
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  XAxis: () => null,
  YAxis: (props: { tickFormatter?: (v: number) => string }) => {
    yAxisProps.push(props);
    return null;
  },
}));

const formatDate = (v: string) => v;

describe('ChartAxes y-axis numbers', () => {
  beforeEach(() => {
    yAxisProps.length = 0;
  });

  it("uses the host's formatNumber", () => {
    const own = (v: number) => `${v.toFixed(2)} u`;
    render(<ChartAxes formatDate={formatDate} formatNumber={own} />);
    expect(yAxisProps.at(-1)?.tickFormatter).toBe(own);
  });

  it('is compact without one', () => {
    render(<ChartAxes formatDate={formatDate} />);
    expect(yAxisProps.at(-1)?.tickFormatter).toBe(compact);
  });

  it('formats fixed-range ticks with it too', () => {
    const own = jest.fn((v: number) => `${v} u`);
    render(
      <ChartAxes
        formatDate={formatDate}
        formatNumber={own}
        yMin={0}
        yMax={1}
        autoScaleYAxis={false}
      />,
    );
    expect(own).toHaveBeenCalled();
  });
});
