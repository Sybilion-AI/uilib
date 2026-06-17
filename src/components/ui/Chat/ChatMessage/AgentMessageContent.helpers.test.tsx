import { render } from '@testing-library/react';

import {
  applyFormatting,
  applyFormattingInline,
} from './AgentMessageContent.helpers';

function renderFormatting(text: string) {
  const parts = applyFormatting(text);
  return render(<>{parts}</>);
}

describe('applyFormatting emphasis', () => {
  it('renders asterisk italic and bold in the same line', () => {
    const { container } = renderFormatting(
      'Use **bold** and *italic* in formatted text.',
    );

    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
  });

  it('renders underscore italic', () => {
    const { container } = renderFormatting('Use _italic_ emphasis.');

    expect(container.querySelector('em')?.textContent).toBe('italic');
  });
});

describe('applyFormattingInline code', () => {
  it('renders HTML code tags', () => {
    const parts = applyFormattingInline(
      'Restored <code>?prompt=</code> URLs for deep links.',
    );
    const { container } = render(<>{parts}</>);

    expect(container.querySelector('code')?.textContent).toBe('?prompt=');
  });

  it('renders backtick inline code', () => {
    const parts = applyFormattingInline('Use `?prompt=` in the query string.');
    const { container } = render(<>{parts}</>);

    expect(container.querySelector('code')?.textContent).toBe('?prompt=');
  });
});

describe('applyFormatting headers', () => {
  it('renders bold inside markdown headers', () => {
    const { container } = renderFormatting(
      "### 2. **Monitor Estonia's Balance of Payments** ⭐",
    );

    const heading = container.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe(
      "2. Monitor Estonia's Balance of Payments ⭐",
    );
    expect(heading?.querySelector('strong')?.textContent).toBe(
      "Monitor Estonia's Balance of Payments",
    );
  });
});
