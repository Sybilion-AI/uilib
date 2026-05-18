import cn from 'classnames';
import type { CSSProperties, ElementType, ReactNode } from 'react';

import S from './GridLayout.styl';

export interface GridLayoutProps {
  children: ReactNode;
  colWidth?: number;
  gap?: string;
  className?: string;
  as?: ElementType;
}

export function GridLayout({
  children,
  colWidth = 300,
  gap = 'var(--p-2)',
  className,
  as: asProp,
}: GridLayoutProps) {
  const As = asProp ?? 'div';

  return (
    <As
      className={cn(S.root, className)}
      style={
        {
          maxWidth: '100%',
          gap: gap,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${colWidth}px, 1fr))`,
        } as CSSProperties
      }
    >
      {children}
    </As>
  );
}
