import { render } from '@testing-library/react';

describe('uilib', () => {
  it('loads testing-library', () => {
    const { getByTestId } = render(<span data-testid="x">ok</span>);
    expect(getByTestId('x').textContent).toBe('ok');
  });
});
