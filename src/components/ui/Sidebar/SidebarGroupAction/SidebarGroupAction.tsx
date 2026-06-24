import cn from 'classnames';
import { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';

import S from './SidebarGroupAction.styl';

export function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(S.sidebarGroupAction, className)}
      {...props}
    />
  );
}
