import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarMenuSub.styl';

export function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(S.sidebarMenuSub, className)}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn(S.sidebarMenuSubItem, className)}
      {...props}
    />
  );
}
