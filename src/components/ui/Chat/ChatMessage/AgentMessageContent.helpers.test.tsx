import { render } from '@testing-library/react';

import { applyFormatting } from './AgentMessageContent.helpers';

function renderFormatting(text: string) {
  const parts = applyFormatting(text);
  return render(<>{parts}</>);
}

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
