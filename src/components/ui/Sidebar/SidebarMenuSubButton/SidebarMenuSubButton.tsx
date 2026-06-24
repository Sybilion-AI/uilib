import cn from 'classnames';
import { ComponentProps } from 'react';

import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate/SmartTextTruncate';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import { useIsSidebarSheetLayout } from '#uilib/hooks/useIsSidebarSheetLayout';
import { Slot } from '@radix-ui/react-slot';

import S from './SidebarMenuSubButton.styl';
import { useSidebarActions, useSidebarState } from '../sidebarContext';

export function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  tooltip,
  className,
  onClick,
  children,
  addon,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  tooltip?: string | ComponentProps<typeof TooltipContent>;
  addon?: React.ReactNode;
}) {
  const Comp = asChild ? Slot : 'a';
  const { isOpen } = useSidebarState();
  const { setOpen } = useSidebarActions();
  const isSidebarSheetLayout = useIsSidebarSheetLayout();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isSidebarSheetLayout && isOpen) setOpen(false);
    onClick?.(event);
  };

  const button = (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(S.sidebarMenuSubButton, S[`size-${size}`], className)}
      onClick={handleClick}
      {...props}
    >
      <SmartTextTruncate className={S.sidebarMenuSubButtonLabel}>
        {children}
      </SmartTextTruncate>
      {addon}
    </Comp>
  );

  if (!tooltip) return button;

  let tooltipProps = tooltip;
  if (typeof tooltipProps === 'string') {
    tooltipProps = {
      children: tooltipProps,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={!isOpen || isSidebarSheetLayout}
        {...tooltipProps}
      />
    </Tooltip>
  );
}
