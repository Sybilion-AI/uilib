import type { ComponentProps, RefObject } from 'react';

/** Pass `viewTransition: false` to avoid nesting `document.startViewTransition` (e.g. chat open already animating). */
export type SetSidebarOpenOptions = {
  viewTransition?: boolean;
  /** Nav closed for layout (chat/width); restore when chat closes — do not persist closed cookie. */
  layoutAutoClose?: boolean;
};

export type SetPanelWidthOptions = { persist?: boolean };

export type SidebarActionsContextProps = {
  setOpen: (open: boolean, options?: SetSidebarOpenOptions) => void;
  toggleSidebar: () => void;
  setSidebarWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
  setChatWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
  setChatPanelOpen: (open: boolean) => void;
  getShellWidth: () => number;
  /** Read shell chat open without subscribing to SidebarStateContext. */
  getChatPanelOpen: () => boolean;
};

export type SidebarStateContextProps = {
  isOpen: boolean;
  sidebarWidthPx: number;
  chatWidthPx: number;
  chatPanelOpen: boolean;
  /** Portal target for the AI chat side panel (right column). */
  chatPanelContainer: HTMLDivElement | null;
  /** App shell wrapper; used to set `--chat-panel-width` (and `--chat-panel-height` on mobile only). */
  sidebarWrapperRef: RefObject<HTMLDivElement | null>;
};

export type SidebarContextProps = SidebarStateContextProps &
  SidebarActionsContextProps;

export type SidebarProps = ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  fullHeightResizer?: boolean;
  brandText?: string;
};
