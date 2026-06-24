import cn from 'classnames';
import { ComponentProps, useCallback } from 'react';

import { PanelResizeHandle } from '#uilib/components/ui/PanelResizeHandle/PanelResizeHandle';
import { useIsSidebarSheetLayout } from '#uilib/hooks/useIsSidebarSheetLayout';

import { useSidebarActions, useSidebarState } from '../sidebarContext';
import S from './SidebarResizeHandle.styl';

export function SidebarResizeHandle({
  className,
  side = 'left',
  ...props
}: ComponentProps<'div'> & { side?: 'left' | 'right' }) {
  const { isOpen, sidebarWidthPx } = useSidebarState();
  const { setSidebarWidthPx, getShellWidth } = useSidebarActions();
  const isSidebarSheetLayout = useIsSidebarSheetLayout();

  const edge: 'leading' | 'trailing' = side === 'left' ? 'trailing' : 'leading';

  const onDragWidth = useCallback(
    (rawPx: number) => {
      setSidebarWidthPx(rawPx, { persist: false });
    },
    [setSidebarWidthPx],
  );

  const onDragComplete = useCallback(
    (finalRawPx: number) => {
      setSidebarWidthPx(finalRawPx, { persist: true });
    },
    [setSidebarWidthPx],
  );

  if (isSidebarSheetLayout || !isOpen) {
    return null;
  }

  return (
    <PanelResizeHandle
      edge={edge}
      isActive={isOpen && !isSidebarSheetLayout}
      startWidthPx={sidebarWidthPx}
      getShellWidth={getShellWidth}
      onDragWidth={onDragWidth}
      onDragComplete={onDragComplete}
      data-sidebar="resize-handle"
      data-slot="sidebar-resize-handle"
      data-side={side}
      className={cn(S.sidebarResizeHandle, className)}
      {...props}
    />
  );
}
