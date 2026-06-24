import cn from 'classnames';
import { ComponentProps } from 'react';

import S from './SidebarRail.styl';
import { useSidebarActions } from '../sidebarContext';

export function SidebarRail({ className, ...props }: ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebarActions();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(S.sidebarRail, className)}
      {...props}
    />
  );
}
