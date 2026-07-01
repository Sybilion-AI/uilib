import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarGroupLabel.styl';

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(S.sidebarGroupLabel, className)}
      {...props}
    />
  );
}
