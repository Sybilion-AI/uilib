import { useCallback, useEffect, useRef, useState } from 'react';

import S from './PageXScroll.styl';
import { Scroll } from '@homecode/ui';
import cn from 'classnames';

/** The inset used until the row has been measured (on the server, and on the
 * first client render). */
const DEFAULT_PAGE_X_PADDING = 24;

/**
 * The page's side padding as the cascade resolves it for this row, in px: the
 * width of the spacer `.inner::before` draws, which is `var(--page-x-padding)`.
 * Reading the spacer, not the variable on `:root`, means an app that sets
 * `--page-x-padding` on any ancestor of the row (or inside a media query)
 * gets the same inset in the scrollbar and fade as in the spacers.
 * Null when the spacer's width is not a length in px (it is not laid out, or
 * a consumer's style gave it something else).
 */
function readPageXPadding(inner: Element): number | null {
  const { width } = getComputedStyle(inner, '::before');
  return /^\d+(\.\d+)?px$/.test(width) ? parseFloat(width) : null;
}

const scrollSizeMap = {
  sm: 's',
  md: 'm',
  lg: 'l',
} as const;

export interface PageXScrollProps extends Omit<
  React.ComponentProps<typeof Scroll>,
  'size'
> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollbarClassName?: string;
  fullWidth?: boolean;
  scrollbarOffset?: {
    x?: {
      before?: number;
      after?: number;
    };
  };
}

export function PageXScroll({
  children,
  className,
  innerClassName,
  scrollbarClassName,
  fullWidth = false,
  size = 'md',
  scrollbarOffset,
  onInnerRef,
  ...props
}: PageXScrollProps) {
  const [pageXPadding, setPageXPadding] = useState(DEFAULT_PAGE_X_PADDING);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(() => {
    const width = innerRef.current && readPageXPadding(innerRef.current);
    if (typeof width === 'number') setPageXPadding(width);
  }, []);

  // The caller's callback is read through a ref, so an inline one does not hand
  // Scroll a new handler (and make it observe the row again) on every render.
  const onInnerRefRef = useRef(onInnerRef);
  onInnerRefRef.current = onInnerRef;

  // Measure when Scroll hands the row over, so the order of the effects does
  // not matter.
  const handleInnerRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      measure();
      onInnerRefRef.current?.(el);
    },
    [measure],
  );

  useEffect(() => {
    // A media query can change `--page-x-padding` when the window is resized.
    // Measuring forces a style recalculation, so once per frame at most.
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  return (
    <Scroll
      x
      size={scrollSizeMap[size]}
      fadeSize="xl"
      className={cn(className, S.root, fullWidth && S.fullWidth)}
      innerClassName={cn(innerClassName, S.inner)}
      xScrollbarClassName={scrollbarClassName}
      offset={{
        x: {
          before: pageXPadding + (scrollbarOffset?.x?.before ?? 0),
          after: pageXPadding + (scrollbarOffset?.x?.after ?? 0),
        },
      }}
      autoHide
      onInnerRef={handleInnerRef}
      {...props}
    >
      {children}
    </Scroll>
  );
}
