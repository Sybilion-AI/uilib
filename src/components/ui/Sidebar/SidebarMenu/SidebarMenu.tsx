import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarMenu.styl';

export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(S.sidebarMenu, className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn(S.sidebarMenuItem, className)}
      {...props}
    />
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(S.sidebarMenuBadge, className)}
      {...props}
    />
  );
}
