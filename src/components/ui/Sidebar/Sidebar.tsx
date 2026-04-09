import cn from 'classnames';
import {
  CSSProperties,
  ComponentProps,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from '#uilib/components/ui/Button';
import type { ButtonProps } from '#uilib/components/ui/Button/Button.types';
import { Separator } from '#uilib/components/ui/Separator';
import { Sheet, SheetContent, SheetTitle } from '#uilib/components/ui/Sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import {
  CHAT_WIDTH_DEFAULT_PX,
  CHAT_WIDTH_MIN_PX,
  CHAT_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_DEFAULT_PX,
  SIDEBAR_WIDTH_MIN_PX,
  SIDEBAR_WIDTH_STORAGE_KEY_PCT,
  SIDEBAR_WIDTH_STORAGE_KEY_PX,
  clampChatWidthPx,
  clampSidebarWidthPx,
  defaultChatWidthPx,
} from '#uilib/hooks/panelWidth';
import useElemDrag, { Delta } from '#uilib/hooks/useDragElem';
import useEvent from '#uilib/hooks/useEvent';
import { useIsMobile } from '#uilib/hooks/useIsMobile';
import { useShellWidthObserver } from '#uilib/hooks/useShellWidthObserver';
import { getCookie, setCookie } from '#uilib/lib/cookie';
import { getCookiePreferences } from '#uilib/lib/cookie-consent/cookie-consent';
import { LS, Scroll } from '@homecode/ui';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';

import S from './Sidebar.styl';

const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

function isEditableKeyboardTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function readInitialSidebarWidthPx(): number {
  if (typeof window === 'undefined') return SIDEBAR_WIDTH_DEFAULT_PX;
  const stored = LS.get(SIDEBAR_WIDTH_STORAGE_KEY_PX);
  if (typeof stored === 'number' && stored >= SIDEBAR_WIDTH_MIN_PX) {
    return stored;
  }
  const legacyPct = LS.get(SIDEBAR_WIDTH_STORAGE_KEY_PCT);
  if (typeof legacyPct === 'number' && legacyPct > 0) {
    const w = window.innerWidth;
    return clampSidebarWidthPx(Math.round((legacyPct / 100) * w), w, {
      chatPanelOpen: false,
      chatWidthPx: 0,
    });
  }
  return SIDEBAR_WIDTH_DEFAULT_PX;
}

function readInitialChatWidthPx(): number {
  if (typeof window === 'undefined') return CHAT_WIDTH_DEFAULT_PX;
  const stored = LS.get(CHAT_WIDTH_STORAGE_KEY);
  if (typeof stored === 'number' && stored >= CHAT_WIDTH_MIN_PX) {
    return stored;
  }
  return defaultChatWidthPx(window.innerWidth);
}

type SetPanelWidthOptions = { persist?: boolean };

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

const SidebarContext = createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

function SidebarProvider({
  defaultOpen = (getCookie('isSidebarOpen') as unknown as boolean) ?? true,
  className,
  style,
  children,
  ...props
}: ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(isMobile ? false : defaultOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const shellWidthRef = useRef(0);
  const prevShellWidthRef = useRef(0);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const [chatPanelContainer, setChatPanelContainer] =
    useState<HTMLDivElement | null>(null);
  const onChatPanelMount = useCallback((node: HTMLDivElement | null) => {
    setChatPanelContainer(node);
  }, []);

  const [sidebarWidthPx, _setSidebarWidthPx] = useState(
    readInitialSidebarWidthPx,
  );
  const [chatWidthPx, _setChatWidthPx] = useState(readInitialChatWidthPx);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const sidebarWidthRef = useRef(sidebarWidthPx);
  const chatWidthRef = useRef(chatWidthPx);
  sidebarWidthRef.current = sidebarWidthPx;
  chatWidthRef.current = chatWidthPx;

  const mergeWrapperRef = useCallback((el: HTMLDivElement | null) => {
    wrapperRef.current = el;
    setShellEl(el);
  }, []);

  const getShellWidth = useCallback((): number => {
    const w = shellWidthRef.current;
    if (w > 0) return w;
    if (wrapperRef.current) {
      const cw = wrapperRef.current.getBoundingClientRect().width;
      if (cw > 0) return cw;
    }
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  }, []);

  const setSidebarWidthPx = useCallback(
    (px: number, options?: SetPanelWidthOptions) => {
      const persist = options?.persist !== false;
      const shellW = getShellWidth();
      const next = clampSidebarWidthPx(px, shellW, {
        chatPanelOpen,
        chatWidthPx,
      });
      _setSidebarWidthPx(next);
      if (persist && getCookiePreferences()?.functional) {
        LS.set(SIDEBAR_WIDTH_STORAGE_KEY_PX, next);
      }
    },
    [getShellWidth, chatPanelOpen, chatWidthPx],
  );

  const setChatWidthPx = useCallback(
    (px: number, options?: SetPanelWidthOptions) => {
      const persist = options?.persist !== false;
      const shellW = getShellWidth();
      const effectiveSidebarW = isOpen ? sidebarWidthPx : 0;
      const next = clampChatWidthPx(px, shellW, effectiveSidebarW);
      _setChatWidthPx(next);
      if (persist && getCookiePreferences()?.functional) {
        LS.set(CHAT_WIDTH_STORAGE_KEY, next);
      }
    },
    [getShellWidth, isOpen, sidebarWidthPx],
  );

  const handleShellResize = useCallback(
    (shellW: number) => {
      shellWidthRef.current = shellW;
      const prev = prevShellWidthRef.current;
      if (prev > 0 && shellW > 0) {
        const s = sidebarWidthRef.current;
        const c = chatWidthRef.current;
        const sScaled = Math.round((s * shellW) / prev);
        const cScaled = Math.round((c * shellW) / prev);
        const effS = (navOpen: boolean, sidebarPx: number) =>
          navOpen ? sidebarPx : 0;
        let cNext = clampChatWidthPx(cScaled, shellW, effS(isOpen, sScaled));
        let sNext = clampSidebarWidthPx(sScaled, shellW, {
          chatPanelOpen,
          chatWidthPx: cNext,
        });
        cNext = clampChatWidthPx(cScaled, shellW, effS(isOpen, sNext));
        sNext = clampSidebarWidthPx(sScaled, shellW, {
          chatPanelOpen,
          chatWidthPx: cNext,
        });
        _setSidebarWidthPx(sNext);
        _setChatWidthPx(cNext);
        if (getCookiePreferences()?.functional) {
          LS.set(SIDEBAR_WIDTH_STORAGE_KEY_PX, sNext);
          LS.set(CHAT_WIDTH_STORAGE_KEY, cNext);
        }
      }
      prevShellWidthRef.current = shellW;
    },
    [chatPanelOpen, isOpen],
  );

  const fitPanelWidthsToShell = useCallback(() => {
    const shellW = getShellWidth();
    if (shellW <= 0) return;
    const s = sidebarWidthRef.current;
    const c = chatWidthRef.current;
    const effS = isOpen ? s : 0;
    let cNext = clampChatWidthPx(c, shellW, effS);
    let sNext = clampSidebarWidthPx(s, shellW, {
      chatPanelOpen,
      chatWidthPx: cNext,
    });
    cNext = clampChatWidthPx(c, shellW, isOpen ? sNext : 0);
    sNext = clampSidebarWidthPx(s, shellW, {
      chatPanelOpen,
      chatWidthPx: cNext,
    });
    if (sNext !== s || cNext !== c) {
      _setSidebarWidthPx(sNext);
      _setChatWidthPx(cNext);
      if (getCookiePreferences()?.functional) {
        LS.set(SIDEBAR_WIDTH_STORAGE_KEY_PX, sNext);
        LS.set(CHAT_WIDTH_STORAGE_KEY, cNext);
      }
    }
  }, [chatPanelOpen, getShellWidth, isOpen]);

  useLayoutEffect(() => {
    if (!shellEl || isMobile) return;
    fitPanelWidthsToShell();
  }, [shellEl, chatPanelOpen, isMobile, isOpen, fitPanelWidthsToShell]);

  useShellWidthObserver(shellEl, handleShellResize);

  const setOpen = useCallback(
    (value: boolean) => {
      if (
        !isMobile &&
        'startViewTransition' in document &&
        document.startViewTransition
      ) {
        document.startViewTransition(() => {
          setIsOpen(value);
        });
      } else {
        setIsOpen(value);
      }

      if (getCookiePreferences()?.functional) {
        setCookie('isSidebarOpen', value.toString(), 60 * 60 * 24 * 7);
      }
    },
    [isMobile],
  );

  const toggleSidebar = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  useEffect(() => {
    const shell = wrapperRef.current;
    if (!shell) return;
    if (chatPanelOpen) {
      shell.setAttribute('data-chat-open', '');
      if (isMobile) {
        shell.style.setProperty('--chat-panel-width', '100%');
        shell.style.setProperty('--chat-panel-height', '100dvh');
      } else {
        shell.style.setProperty('--chat-panel-width', `${chatWidthPx}px`);
        shell.style.removeProperty('--chat-panel-height');
      }
    } else {
      shell.removeAttribute('data-chat-open');
      shell.style.setProperty('--chat-panel-width', '0px');
      shell.style.removeProperty('--chat-panel-height');
    }
  }, [chatPanelOpen, isMobile, chatWidthPx]);

  useEffect(() => {
    return () => {
      const shell = wrapperRef.current;
      if (!shell) return;
      shell.removeAttribute('data-chat-open');
      shell.style.setProperty('--chat-panel-width', '0px');
      shell.style.removeProperty('--chat-panel-height');
    };
  }, []);

  useEvent({
    event: 'keydown',
    callback: (e: KeyboardEvent) => {
      const isToggleShortcut =
        (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !isEditableKeyboardTarget(document.activeElement));

      if (isToggleShortcut) {
        e.preventDefault();
        toggleSidebar();
      }
    },
  });

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      isOpen,
      setOpen,
      toggleSidebar,
      sidebarWidthPx,
      setSidebarWidthPx,
      chatWidthPx,
      setChatWidthPx,
      chatPanelOpen,
      setChatPanelOpen,
      getShellWidth,
      chatPanelContainer,
      sidebarWrapperRef: wrapperRef,
    }),
    [
      isOpen,
      setOpen,
      toggleSidebar,
      sidebarWidthPx,
      setSidebarWidthPx,
      chatWidthPx,
      setChatWidthPx,
      chatPanelOpen,
      getShellWidth,
      chatPanelContainer,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={mergeWrapperRef}
          data-slot="sidebar-wrapper"
          data-state={isOpen ? 'expanded' : 'collapsed'}
          style={
            {
              '--sidebar-width': `${sidebarWidthPx}px`,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          className={cn(S.sidebarWrapper, className)}
          {...props}
        >
          <div
            className={S.sidebarMainShell}
            // style={{ viewTransitionName: 'sidebar-gap' }}
          >
            {children}
          </div>
          <div
            ref={onChatPanelMount}
            className={S.chatPanelMount}
            data-slot="chat-panel-mount"
            // style={{ viewTransitionName: 'sidebar-container' }}
          />
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  children,
  fullHeightResizer = false,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();
  const { isOpen, setOpen } = useSidebar();

  // Only force-close on mobile. Do not call setOpen(true) on desktop — that ran on every
  // load and overwrote the isSidebarOpen cookie (collapsed → opened + cookie "true").
  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [isMobile, setOpen]);

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

  if (isMobile) {
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
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className={cn(S.sheetSidebarInner)}>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        S.sidebar,
        S[`variant-${variant}`],
        className,
        fullHeightResizer && S.fullHeightResizer,
      )}
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

function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

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
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

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

function PanelResizeHandle({
  className,
  edge,
  isActive,
  startWidthPx,
  getShellWidth,
  onDragWidth,
  onDragComplete,
  ...props
}: ComponentProps<'div'> & {
  edge: 'leading' | 'trailing';
  isActive: boolean;
  startWidthPx: number;
  getShellWidth: () => number;
  onDragWidth: (rawPx: number) => void;
  onDragComplete?: (finalRawPx: number) => void;
}) {
  const handleRef = useRef<HTMLDivElement>(null);
  const startWidthRef = useRef(0);
  const lastRawRef = useRef(0);

  const handleDrag = useCallback(
    (delta: Delta) => {
      const shellW = getShellWidth();
      if (shellW <= 0) return;
      const raw =
        edge === 'trailing'
          ? startWidthRef.current + delta.x
          : startWidthRef.current - delta.x;
      lastRawRef.current = raw;
      onDragWidth(raw);
    },
    [edge, getShellWidth, onDragWidth],
  );

  const handleDragStart = useCallback(
    (e: PointerEvent) => {
      startWidthRef.current = startWidthPx;
      lastRawRef.current = startWidthPx;
      handleRef.current?.setPointerCapture(e.pointerId);
    },
    [startWidthPx],
  );

  const handleDragEnd = useCallback(
    (e: PointerEvent) => {
      onDragComplete?.(lastRawRef.current);
      try {
        handleRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Capture already released
      }
      startWidthRef.current = 0;
    },
    [onDragComplete],
  );

  useElemDrag({
    elem: handleRef,
    onDrag: handleDrag,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    isActive,
  });

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      data-slot="panel-resize-handle"
      data-edge={edge}
      className={className}
      {...props}
    />
  );
}

function SidebarResizeHandle({
  className,
  side = 'left',
  ...props
}: ComponentProps<'div'> & { side?: 'left' | 'right' }) {
  const { isOpen, sidebarWidthPx, setSidebarWidthPx, getShellWidth } =
    useSidebar();
  const isMobile = useIsMobile();

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

  if (isMobile || !isOpen) {
    return null;
  }

  return (
    <PanelResizeHandle
      edge={edge}
      isActive={isOpen && !isMobile}
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

function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(S.sidebarFooter, className)}
      {...props}
    />
  );
}

function SidebarSeparator({
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

function SidebarContent({
  className,
  innerClassName,
  children,
}: ComponentProps<typeof Scroll>) {
  // const sidebarContentTransition = useViewTransition({
  //   transitionName: 'sidebar-content',
  // });

  return (
    <Scroll
      y
      autoHide
      fadeSize="l"
      offset={{ y: { before: 40, after: 20 } }}
      className={cn(S.sidebarContent, className)}
      innerClassName={innerClassName}
    >
      {children}
    </Scroll>
  );
}

function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(S.sidebarGroup, className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(S.sidebarGroupLabel, className)}
      {...props}
    />
  );
}

function SidebarGroupAction({
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

function SidebarGroupContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn(S.sidebarGroupContent, className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(S.sidebarMenu, className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn(S.sidebarMenuItem, className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'ghost',
  size = 'sm',
  className,
  ...props
}: ButtonProps & { isActive?: boolean }) {
  return (
    <Button
      asChild={asChild}
      variant={variant}
      size={size}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        variant === 'default' ? S.sidebarMenuButtonCta : S.sidebarMenuButton,
        S[`size-${size}`],
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        S.sidebarMenuAction,
        showOnHover && S.showOnHover,
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(S.sidebarMenuBadge, className)}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(S.sidebarMenuSub, className)}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn(S.sidebarMenuSubItem, className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  tooltip,
  className,
  onClick,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  tooltip?: string | ComponentProps<typeof TooltipContent>;
}) {
  const Comp = asChild ? Slot : 'a';
  const { isOpen, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile && isOpen) setOpen(false);
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
    />
  );

  if (!tooltip) return button;

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={!isOpen || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

export {
  PanelResizeHandle,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
