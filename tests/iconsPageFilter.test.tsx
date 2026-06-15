import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { icons } from 'lucide-react';

import IconsPage from '../src/docs/pages/IconsPage';

// The docs header actions mount the full ChatSheet (tiptap editor, portals)
// and the page header needs a SidebarProvider; both are irrelevant to the
// filter logic under test.
jest.mock('../src/docs/docsHeaderActions', () => ({
  DocsHeaderActions: () => null,
}));
jest.mock('../src/docs/components/AppPageHeader/AppPageHeader', () => ({
  AppPageHeader: () => null,
}));

const TOTAL = Object.keys(icons).length;

function getFilterInput() {
  return screen.getByLabelText('Filter icons by name');
}

describe('IconsPage filter', () => {
  it('shows the full icon count without a query', () => {
    render(<IconsPage />);
    expect(screen.getByText(`${TOTAL} of ${TOTAL} icons`)).toBeInTheDocument();
  });

  it('narrows matches by case-insensitive substring', () => {
    render(<IconsPage />);
    fireEvent.change(getFilterInput(), { target: { value: 'TRENDING' } });

    const expected = Object.keys(icons).filter(name =>
      name.toLowerCase().includes('trending'),
    );
    expect(expected.length).toBeGreaterThan(0);
    expect(
      screen.getByText(`${expected.length} of ${TOTAL} icons`),
    ).toBeInTheDocument();
    expect(screen.getByText('TrendingUp')).toBeInTheDocument();
  });

  it('ignores surrounding whitespace in the query', () => {
    render(<IconsPage />);
    fireEvent.change(getFilterInput(), { target: { value: '  activity  ' } });

    const expected = Object.keys(icons).filter(name =>
      name.toLowerCase().includes('activity'),
    );
    expect(
      screen.getByText(`${expected.length} of ${TOTAL} icons`),
    ).toBeInTheDocument();
  });

  it('shows an empty state for a query with no matches', () => {
    render(<IconsPage />);
    fireEvent.change(getFilterInput(), {
      target: { value: 'no-such-icon-xyz' },
    });

    expect(screen.getByText(`0 of ${TOTAL} icons`)).toBeInTheDocument();
    expect(
      screen.getByText('No icons match “no-such-icon-xyz”.'),
    ).toBeInTheDocument();
  });

  it('restores the full set when the query is cleared', () => {
    render(<IconsPage />);
    const input = getFilterInput();
    fireEvent.change(input, { target: { value: 'activity' } });
    fireEvent.change(input, { target: { value: '' } });

    expect(screen.getByText(`${TOTAL} of ${TOTAL} icons`)).toBeInTheDocument();
  });

  it('caps the rendered gallery and reports hidden matches', () => {
    const { container } = render(<IconsPage />);
    const cells = container.querySelectorAll('.cell');
    expect(cells.length).toBeLessThanOrEqual(300);
    expect(
      screen.getByText(
        `${TOTAL - 300} more match — refine the filter to see them.`,
      ),
    ).toBeInTheDocument();
  });
});
