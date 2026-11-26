import { PageXScroll } from '#uilib/components/ui/Page/PageXScroll/PageXScroll';
import { Scroll } from '@homecode/ui';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylus from 'stylus';

// What PageXScroll hands Scroll as its inset is the page's side padding as the
// row sees it, so an app can set `--page-x-padding` where it likes.
jest.mock('@homecode/ui', () => {
  const { createElement, useEffect, useRef } = jest.requireActual('react');
  return {
    // Like the real Scroll, hand the inner element over from an effect.
    Scroll: jest.fn(({ children, onInnerRef }) => {
      const ref = useRef(null);
      useEffect(() => {
        onInnerRef?.(ref.current);
      }, [onInnerRef]);
      return createElement('div', { ref, 'data-testid': 'inner' }, children);
    }),
  };
});

const scroll = Scroll as unknown as jest.Mock;
const realGetComputedStyle = window.getComputedStyle;

/** Make the spacer before the row `px` wide, whatever the page declares. */
function spacerWidth(px: string) {
  jest
    .spyOn(window, 'getComputedStyle')
    .mockImplementation(((el: Element, pseudo?: string | null) =>
      pseudo === '::before'
        ? ({ width: px } as CSSStyleDeclaration)
        : realGetComputedStyle(el, pseudo)) as typeof window.getComputedStyle);
}

function lastOffset() {
  return scroll.mock.calls.at(-1)?.[0].offset.x;
}

/** Frames that wait for flushFrames(), so a test sees how many are asked for. */
function holdFrames() {
  let next = 1;
  const pending = new Map<number, FrameRequestCallback>();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    pending.set(next, cb);
    return next++;
  });
  jest
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(id => void pending.delete(id));
  return {
    pending,
    flushFrames: () =>
      act(() => {
        const frames = [...pending.values()];
        pending.clear();
        frames.forEach(cb => cb(0));
      }),
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  scroll.mockClear();
});

describe('PageXScroll inset', () => {
  it('uses the width of the spacer the row draws, not a value read from :root', () => {
    spacerWidth('20px');
    render(<PageXScroll>tabs</PageXScroll>);
    expect(lastOffset()).toEqual({ before: 20, after: 20 });
  });

  it('adds scrollbarOffset to it', () => {
    spacerWidth('20px');
    render(
      <PageXScroll scrollbarOffset={{ x: { before: 3, after: 5 } }}>
        tabs
      </PageXScroll>,
    );
    expect(lastOffset()).toEqual({ before: 23, after: 25 });
  });

  it('follows the spacer when the window is resized across a breakpoint', () => {
    const { flushFrames } = holdFrames();
    spacerWidth('64px');
    render(<PageXScroll>tabs</PageXScroll>);
    expect(lastOffset()).toEqual({ before: 64, after: 64 });

    spacerWidth('24px');
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    flushFrames();
    expect(lastOffset()).toEqual({ before: 24, after: 24 });
  });

  it('measures once per frame however many resize events come', () => {
    const { pending, flushFrames } = holdFrames();
    spacerWidth('20px');
    render(<PageXScroll>tabs</PageXScroll>);

    const measured = jest.spyOn(window, 'getComputedStyle');
    measured.mockClear();
    act(() => {
      for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('resize'));
    });
    expect(pending.size).toBe(1);
    flushFrames();
    expect(
      measured.mock.calls.filter(([, pseudo]) => pseudo === '::before'),
    ).toHaveLength(1);
  });

  it('stops listening and drops a waiting frame when it unmounts', () => {
    const { pending } = holdFrames();
    spacerWidth('20px');
    const { unmount } = render(<PageXScroll>tabs</PageXScroll>);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(pending.size).toBe(1);
    unmount();
    expect(pending.size).toBe(0);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(pending.size).toBe(0);
  });

  it.each(['auto', '50%', ''])(
    'keeps the default inset when the spacer width is %p, not a length in px',
    width => {
      spacerWidth(width);
      render(<PageXScroll>tabs</PageXScroll>);
      expect(lastOffset()).toEqual({ before: 24, after: 24 });
    },
  );

  it('does not make Scroll observe the row again on every render', () => {
    spacerWidth('20px');
    const { rerender } = render(<PageXScroll>tabs</PageXScroll>);
    const first = scroll.mock.calls[0][0].onInnerRef;
    rerender(<PageXScroll>more tabs</PageXScroll>);
    expect(scroll.mock.calls.at(-1)?.[0].onInnerRef).toBe(first);
  });

  it('keeps the handler stable when the caller passes a new onInnerRef each render', () => {
    spacerWidth('20px');
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = render(
      <PageXScroll onInnerRef={el => first(el)}>tabs</PageXScroll>,
    );
    const handler = scroll.mock.calls[0][0].onInnerRef;
    rerender(<PageXScroll onInnerRef={el => second(el)}>tabs</PageXScroll>);
    expect(scroll.mock.calls.at(-1)?.[0].onInnerRef).toBe(handler);

    // Whoever asks next gets the latest callback.
    handler(document.createElement('div'));
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('still hands the inner element to the caller', () => {
    spacerWidth('20px');
    const onInnerRef = jest.fn();
    render(<PageXScroll onInnerRef={onInnerRef}>tabs</PageXScroll>);
    expect(onInnerRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('PageTabs focus ring', () => {
  it('draws the ring inside the tab, because the scrolling row clips the outside', () => {
    const file = join(
      __dirname,
      '../src/components/ui/Page/PageTabs/PageTabs.styl',
    );
    const css = stylus(readFileSync(file, 'utf8'))
      .set('filename', file)
      .render();
    const rules = css.match(/\.listInner\s*\{[^}]*\}/g) ?? [];
    expect(
      rules.some(rule =>
        rule.includes(
          '--focus-outline-offset: calc(-1 * var(--focus-outline-width, 2px) - 2px)',
        ),
      ),
    ).toBe(true);
  });
});
