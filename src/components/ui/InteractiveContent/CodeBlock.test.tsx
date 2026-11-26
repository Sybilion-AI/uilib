import { render } from '@testing-library/react';

import { InteractiveContent } from './InteractiveContent';
import { formatCodeBlock } from './CodeBlock';

describe('InteractiveContent fenced code blocks', () => {
  it('renders a ```json block as a pretty-printed code block', () => {
    const { container } = render(
      <InteractiveContent
        text={'Done.\n\n```json\n{"pushed": true, "items": [1, null]}\n```\nAfter.'}
      />,
    );

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.getAttribute('data-language')).toBe('json');
    expect(pre?.textContent).toBe(
      '{\n  "pushed": true,\n  "items": [\n    1,\n    null\n  ]\n}',
    );
    expect(container.textContent).not.toContain('```');
    expect(container.textContent).toContain('Done.');
    expect(container.textContent).toContain('After.');
  });

  it('keeps other languages verbatim and leaves markdown inside untouched', () => {
    const code = 'const a = **b**;\n  // https://example.com\n- item';
    const { container } = render(
      <InteractiveContent text={'```ts\n' + code + '\n```'} />,
    );

    const pre = container.querySelector('pre');
    expect(pre?.textContent).toBe(code);
    expect(pre?.querySelector('strong, a, br')).toBeNull();
  });

  it('renders an untagged fence and an unclosed fence', () => {
    const { container } = render(
      <InteractiveContent text={'```\nplain\n```\n\n```sh\nnpm i'} />,
    );

    const blocks = container.querySelectorAll('pre');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].textContent).toBe('plain');
    expect(blocks[1].textContent).toBe('npm i');
  });

  it('works in the inline variant too', () => {
    const { container } = render(
      <InteractiveContent variant="inline" text={'```\nx\n```'} />,
    );
    expect(container.querySelector('pre')?.textContent).toBe('x');
  });

  it('keeps invalid JSON as written', () => {
    expect(formatCodeBlock('{"a": 1,', 'json')).toEqual({
      code: '{"a": 1,',
      isJson: true,
    });
  });
});
