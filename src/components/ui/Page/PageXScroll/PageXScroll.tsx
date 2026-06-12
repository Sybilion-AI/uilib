import { useEffect, useState } from 'react';

import S from './PageXScroll.styl';
import { Scroll } from '@homecode/ui';
import cn from 'classnames';

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
  ...props
}: PageXScrollProps) {
  const [pageXPadding, setPageXPadding] = useState(24); // Default fallback

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--page-x-padding')
        .trim();
      if (value) {
        // Convert rem/px to number (assuming px, if rem multiply by 16)
        const numValue = parseFloat(value);
        setPageXPadding(value.includes('rem') ? numValue * 16 : numValue);
      }
    }
  }, []);

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
      {...props}
    >
      {children}
    </Scroll>
  );
}
