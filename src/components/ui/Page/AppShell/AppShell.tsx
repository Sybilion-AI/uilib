import cn from 'classnames';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import type { ReactNode } from 'react';

import S from './AppShell.styl';

export type AppShellProps = ComponentPropsWithoutRef<'div'>;

export interface AppShellMainContentProps {
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

/** Main column in app shell (grid cell + header / body / footer). */
export function AppShellMainContent({
  className,
  bodyClassName,
  children,
  header,
  footer,
}: AppShellMainContentProps) {
  return (
    <div className={cn(S.mainColumn, className)}>
      {header}
      <div className={cn(S.mainBody, bodyClassName)}>{children}</div>
      {footer}
    </div>
  );
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell({ className, ...props }, ref) {
    return <div ref={ref} className={cn(S.root, className)} {...props} />;
  },
);
