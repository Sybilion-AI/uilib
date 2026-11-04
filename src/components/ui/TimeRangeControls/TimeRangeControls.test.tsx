import { render, screen } from '@testing-library/react';

import { TimeRangeControls } from './TimeRangeControls';

const noop = () => {};

describe('TimeRangeControls', () => {
  it('renders the toggle row and the select, so a phone still has the control', () => {
    render(<TimeRangeControls timeRange="1y" onTimeRangeChange={noop} />);
    expect(screen.getByRole('group')).toBeTruthy();
    const select = screen.getByRole('combobox', { name: 'Time range' });
    expect(select.textContent).toContain('1y');
  });

  it('says "Custom" for a range that is not a preset', () => {
    const { rerender } = render(
      <TimeRangeControls timeRange="1y" onTimeRangeChange={noop} />,
    );
    rerender(
      <TimeRangeControls
        timeRange="2024-01-01_2024-06-01"
        onTimeRangeChange={noop}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Time range' });
    expect(select.textContent).toContain('Custom');
    expect(select.textContent).not.toContain('1y');
  });

  it('disables both while loading', () => {
    render(
      <TimeRangeControls timeRange="1y" onTimeRangeChange={noop} loading />,
    );
    expect(
      screen.getByRole('combobox', { name: 'Time range' }).hasAttribute(
        'disabled',
      ),
    ).toBe(true);
  });
});
