import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarGroup.styl';

export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(S.sidebarGroup, className)}
      {...props}
    />
  );
}
