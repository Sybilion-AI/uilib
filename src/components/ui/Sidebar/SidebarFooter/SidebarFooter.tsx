import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarFooter.styl';

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(S.sidebarFooter, className)}
      {...props}
    />
  );
}
