import cn from 'classnames';
import { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';

import S from './SidebarMenuAction.styl';

export function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        S.sidebarMenuAction,
        showOnHover && S.showOnHover,
        className,
      )}
      {...props}
    />
  );
}
