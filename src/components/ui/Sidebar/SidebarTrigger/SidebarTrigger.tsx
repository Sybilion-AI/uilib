import cn from 'classnames';
import { ComponentProps } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { PanelLeft } from 'lucide-react';

import S from './SidebarTrigger.styl';
import { useSidebarActions } from '../sidebarContext';

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebarActions();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      icon
      className={cn(S.sidebarTrigger, className)}
      onClick={event => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft size={20} strokeWidth={1.5} className="text-foreground" />
      {/* <span className="sr-only">Toggle Sidebar</span> */}
    </Button>
  );
}
