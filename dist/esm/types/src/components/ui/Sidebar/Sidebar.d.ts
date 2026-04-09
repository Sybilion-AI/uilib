import { ComponentProps, RefObject } from 'react';
import { Button } from '#uilib/components/ui/Button';
import type { ButtonProps } from '#uilib/components/ui/Button/Button.types';
import { Separator } from '#uilib/components/ui/Separator';
import { TooltipContent } from '#uilib/components/ui/Tooltip';
import { Scroll } from '@homecode/ui';
type SetPanelWidthOptions = {
    persist?: boolean;
};
type SidebarContextProps = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    sidebarWidthPx: number;
    setSidebarWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
    chatWidthPx: number;
    setChatWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
    chatPanelOpen: boolean;
    setChatPanelOpen: (open: boolean) => void;
    getShellWidth: () => number;
    /** Portal target for the AI chat side panel (right column). */
    chatPanelContainer: HTMLDivElement | null;
    /** App shell wrapper; used to set `--chat-panel-width` (and `--chat-panel-height` on mobile only). */
    sidebarWrapperRef: RefObject<HTMLDivElement | null>;
};
type SidebarProps = ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
    fullHeightResizer?: boolean;
};
declare function useSidebar(): SidebarContextProps;
declare function SidebarProvider({ defaultOpen, className, style, children, ...props }: ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
declare function Sidebar({ defaultOpen, open: openProp, onOpenChange: setOpenProp, className, side, variant, collapsible, children, fullHeightResizer, ...props }: SidebarProps): import("react/jsx-runtime").JSX.Element;
declare function SidebarTrigger({ className, onClick, ...props }: ComponentProps<typeof Button>): import("react/jsx-runtime").JSX.Element;
declare function SidebarRail({ className, ...props }: ComponentProps<'button'>): import("react/jsx-runtime").JSX.Element;
declare function PanelResizeHandle({ className, edge, isActive, startWidthPx, getShellWidth, onDragWidth, onDragComplete, ...props }: ComponentProps<'div'> & {
    edge: 'leading' | 'trailing';
    isActive: boolean;
    startWidthPx: number;
    getShellWidth: () => number;
    onDragWidth: (rawPx: number) => void;
    onDragComplete?: (finalRawPx: number) => void;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarResizeHandle({ className, side, ...props }: ComponentProps<'div'> & {
    side?: 'left' | 'right';
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarFooter({ className, ...props }: ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarSeparator({ className, ...props }: ComponentProps<typeof Separator>): import("react/jsx-runtime").JSX.Element;
declare function SidebarContent({ className, innerClassName, children, }: ComponentProps<typeof Scroll>): import("react/jsx-runtime").JSX.Element;
declare function SidebarGroup({ className, ...props }: ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarGroupLabel({ className, asChild, ...props }: ComponentProps<'div'> & {
    asChild?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarGroupAction({ className, asChild, ...props }: ComponentProps<'button'> & {
    asChild?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarGroupContent({ className, ...props }: ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenu({ className, ...props }: ComponentProps<'ul'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuButton({ asChild, isActive, variant, size, className, ...props }: ButtonProps & {
    isActive?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuAction({ className, asChild, showOnHover, ...props }: ComponentProps<'button'> & {
    asChild?: boolean;
    showOnHover?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuBadge({ className, ...props }: ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuSubItem({ className, ...props }: ComponentProps<'li'>): import("react/jsx-runtime").JSX.Element;
declare function SidebarMenuSubButton({ asChild, size, isActive, tooltip, className, onClick, ...props }: ComponentProps<'a'> & {
    asChild?: boolean;
    size?: 'sm' | 'md' | 'lg';
    isActive?: boolean;
    tooltip?: string | ComponentProps<typeof TooltipContent>;
}): import("react/jsx-runtime").JSX.Element;
export { PanelResizeHandle, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarResizeHandle, SidebarSeparator, SidebarTrigger, useSidebar, };
