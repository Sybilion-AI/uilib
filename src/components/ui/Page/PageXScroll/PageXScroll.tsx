import cn from 'classnames';
import { useEffect, useState } from 'react';

import { Scroll } from '@homecode/ui';

import S from './PageXScroll.styl';

const scrollSizeMap = {
  sm: 's',
  md: 'm',
  lg: 'l',
} as const;

interface PageXScrollProps extends Omit<
  React.ComponentProps<typeof Scroll>,
  'size'
> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollbarClassName?: string;
  fullWidth?: boolean;
}

export function PageXScroll({
  children,
  className,
  innerClassName,
  scrollbarClassName,
  fullWidth = false,
  size = 'md',
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
          before: pageXPadding,
          after: pageXPadding,
        },
      }}
      autoHide
      {...props}
    >
      {children}
    </Scroll>
  );
}
