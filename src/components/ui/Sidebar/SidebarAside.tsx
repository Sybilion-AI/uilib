import { CSSProperties, useEffect, useRef } from 'react';
import { Sheet, SheetContent } from '#uilib/components/ui/Sheet';
import { useSidebarActions, useSidebarState } from './sidebarContext';

import { Logo } from '#uilib/components/ui/Logo/Logo';
import S from './Sidebar.styl';
import { SIDEBAR_WIDTH_MOBILE } from './sidebarConstants';
import type { SidebarProps } from './Sidebar.types';
import { SidebarResizeHandle } from './SidebarResizeHandle/SidebarResizeHandle';
import cn from 'classnames';
import { useIsSidebarSheetLayout } from '#uilib/hooks/useIsSidebarSheetLayout';

export function Sidebar({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  children,
  fullHeightResizer = false,
  brandText = 'Sybilion',
  ...props
}: SidebarProps) {
  const isSidebarSheetLayout = useIsSidebarSheetLayout();
  const { isOpen } = useSidebarState();
  const { setOpen } = useSidebarActions();

  const prevSheetLayoutRef = useRef(isSidebarSheetLayout);

  /** Narrow shell: sidebar is a sheet; collapse only when crossing into this mode. */
  useEffect(() => {
    const enteredSheetLayout =
      isSidebarSheetLayout && !prevSheetLayoutRef.current;
    prevSheetLayoutRef.current = isSidebarSheetLayout;
    if (enteredSheetLayout) setOpen(false);
  }, [isSidebarSheetLayout, setOpen]);

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(S.sidebarNone, className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isSidebarSheetLayout) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          className={cn(S.sheetContentSidebar, className)}
          style={
            {
              '--gap-top': '40px',
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as CSSProperties
          }
          side={side}
        >
          <div className={cn(S.sheetSidebarInner)} data-sheet-sidebar-inner="">
            <div className={S.sheetSidebarLogo}>
              <Logo size="md" brandText={brandText} />
            </div>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(S.sidebar, S[`variant-${variant}`], className)}
      data-full-height-resizer={fullHeightResizer ? '' : undefined}
      data-state={isOpen ? 'expanded' : 'collapsed'}
      data-collapsible={!isOpen ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      {children}
      <SidebarResizeHandle side={side} />
    </aside>
  );
}
