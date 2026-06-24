import cn from 'classnames';
import { ComponentProps } from 'react';

import { Separator } from '#uilib/components/ui/Separator';

import S from './SidebarSeparator.styl';

export function SidebarSeparator({
  className,
  ...props
}: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(S.sidebarSeparator, className)}
      {...props}
    />
  );
}
