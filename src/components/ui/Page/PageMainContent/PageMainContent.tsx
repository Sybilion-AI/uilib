import cn from 'classnames';
import type { ReactNode } from 'react';

import S from './PageMainContent.styl';

export interface PageMainContentProps {
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/** Main column wrapper for sidebar + inset layouts (footer shares column width). */
export function PageMainContent({
  className,
  bodyClassName,
  children,
  footer,
}: PageMainContentProps) {
  return (
    <div className={cn(S.root, className)}>
      <div className={cn(S.body, bodyClassName)}>{children}</div>
      {footer}
    </div>
  );
}
