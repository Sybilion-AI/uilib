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
import { Logo } from '#uilib/components/ui/Logo/Logo';
import { Separator } from '#uilib/components/ui/Separator';
import { Sheet, SheetContent, SheetTitle } from '#uilib/components/ui/Sheet';
import {
  SmartTextTruncate,
  notifyPanelWidthDragEnd,
  notifyPanelWidthDragStart,
} from '#uilib/components/ui/SmartTextTruncate/SmartTextTruncate';
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
  shellFitsSidebarsLayout,
} from '#uilib/hooks/panelWidth';
import useElemDrag, { Delta } from '#uilib/hooks/useDragElem';
import useEvent from '#uilib/hooks/useEvent';
import { useIsSidebarSheetLayout } from '#uilib/hooks/useIsSidebarSheetLayout';
import { useShellWidthObserver } from '#uilib/hooks/useShellWidthObserver';
import { getCookie, setCookie } from '#uilib/lib/cookie';
import { getCookiePreferences } from '#uilib/lib/cookie-consent/cookie-consent';
import { LS, Scroll } from '@homecode/ui';
import { Slot } from '@radix-ui/react-slot';
import { ChevronDown, ChevronRight, PanelLeft } from 'lucide-react';

import S from './Sidebar.styl';

const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/** Fired when nav open closes chat for layout; ChatSheet clears `?chat=` so URL sync does not reopen chat. */
export const DISMISS_CHAT_FOR_LAYOUT_EVENT = 'sybilion:dismiss-chat-for-layout';

function isEditableKeyboardTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function readInitialSidebarWidthPx(storageKeyPx: string): number {
  if (typeof window === 'undefined') return SIDEBAR_WIDTH_DEFAULT_PX;
  const stored = LS.get(storageKeyPx);
  if (typeof stored === 'number' && stored >= SIDEBAR_WIDTH_MIN_PX) {
    return stored;
  }
  if (storageKeyPx === SIDEBAR_WIDTH_STORAGE_KEY_PX) {
    const legacyPct = LS.get(SIDEBAR_WIDTH_STORAGE_KEY_PCT);
    if (typeof legacyPct === 'number' && legacyPct > 0) {
      const w = window.innerWidth;
      return clampSidebarWidthPx(Math.round((legacyPct / 100) * w), w, {
        chatPanelOpen: false,
        chatWidthPx: 0,
      });
    }
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

/** Pass `viewTransition: false` to avoid nesting `document.startViewTransition` (e.g. chat open already animating). */
export type SetSidebarOpenOptions = {
  viewTransition?: boolean;
  /** Nav closed for layout (chat/width); restore when chat closes — do not persist closed cookie. */
  layoutAutoClose?: boolean;
};

type SidebarActionsContextProps = {
  setOpen: (open: boolean, options?: SetSidebarOpenOptions) => void;
  toggleSidebar: () => void;
  setSidebarWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
  setChatWidthPx: (px: number, options?: SetPanelWidthOptions) => void;
  setChatPanelOpen: (open: boolean) => void;
  getShellWidth: () => number;
  /** Read shell chat open without subscribing to SidebarStateContext. */
  getChatPanelOpen: () => boolean;
};

type SidebarStateContextProps = {
  isOpen: boolean;
  sidebarWidthPx: number;
  chatWidthPx: number;
  chatPanelOpen: boolean;
  /** Portal target for the AI chat side panel (right column). */
  chatPanelContainer: HTMLDivElement | null;
  /** App shell wrapper; used to set `--chat-panel-width` (and `--chat-panel-height` on mobile only). */
  sidebarWrapperRef: RefObject<HTMLDivElement | null>;
};

type SidebarContextProps = SidebarStateContextProps &
  SidebarActionsContextProps;

type SidebarProps = ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  fullHeightResizer?: boolean;
  brandText?: string;
};

const SidebarActionsContext = createContext<SidebarActionsContextProps | null>(
  null,
);
const SidebarStateContext = createContext<SidebarStateContextProps | null>(
  null,
);

function useSidebarActions() {
  const context = useContext(SidebarActionsContext);
  if (!context) {
    throw new Error('useSidebarActions must be used within a SidebarProvider.');
  }

  return context;
}

function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error('useSidebarState must be used within a SidebarProvider.');
  }

  return context;
}

function useSidebar(): SidebarContextProps {
  const actions = useSidebarActions();
  const state = useSidebarState();
  return useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  );
}

function SidebarProvider({
  defaultOpen = (getCookie('isSidebarOpen') as unknown as boolean) ?? true,
  className,
  style,
  children,
  userId,
  sidebarWidthStorageKey,
  persistSidebarWidthWithoutConsent = false,
  ...props
}: ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userId?: string | number | null;
  /** LocalStorage key for sidebar width (pixels). Defaults to `sidebarWidthPx`. */
  sidebarWidthStorageKey?: string;
  /** When true, sidebar width is saved without functional cookie consent (e.g. internal docs). */
  persistSidebarWidthWithoutConsent?: boolean;
}) {
  const sidebarLsKey = sidebarWidthStorageKey ?? SIDEBAR_WIDTH_STORAGE_KEY_PX;
  const allowPersistSidebarWidth =
    persistSidebarWidthWithoutConsent ||
    Boolean(getCookiePreferences(userId)?.functional);

  const isSidebarSheetLayout = useIsSidebarSheetLayout();
  const [isOpen, setIsOpen] = useState(
    isSidebarSheetLayout ? false : defaultOpen,
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const shellWidthRef = useRef(0);
  const prevShellWidthRef = useRef(0);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const [chatPanelContainer, setChatPanelContainer] =
    useState<HTMLDivElement | null>(null);
  const onChatPanelMount = useCallback((node: HTMLDivElement | null) => {
    setChatPanelContainer(node);
  }, []);

  const [sidebarWidthPx, _setSidebarWidthPx] = useState(() =>
    readInitialSidebarWidthPx(sidebarLsKey),
  );
  const [chatWidthPx, _setChatWidthPx] = useState(readInitialChatWidthPx);
  const [chatPanelOpen, _setChatPanelOpen] = useState(false);
  const sidebarWidthRef = useRef(sidebarWidthPx);
  const chatWidthRef = useRef(chatWidthPx);
  const isOpenRef = useRef(isOpen);
  const chatPanelOpenRef = useRef(chatPanelOpen);
  /** Left nav was auto-closed because chat opened on a narrow shell; reopen when chat closes. */
  const sidebarAutoClosedForChatRef = useRef(false);
  sidebarWidthRef.current = sidebarWidthPx;
  chatWidthRef.current = chatWidthPx;
  isOpenRef.current = isOpen;
  chatPanelOpenRef.current = chatPanelOpen;

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

  const getChatPanelOpen = useCallback(
    (): boolean => chatPanelOpenRef.current,
    [],
  );

  const setSidebarWidthPx = useCallback(
    (px: number, options?: SetPanelWidthOptions) => {
      const persist = options?.persist !== false;
      const shellW = getShellWidth();
      const next = clampSidebarWidthPx(px, shellW, {
        chatPanelOpen: chatPanelOpenRef.current,
        chatWidthPx: chatWidthRef.current,
      });
      sidebarWidthRef.current = next;

      // Live drag: update CSS var only — avoid re-rendering the whole nav tree each frame.
      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty('--sidebar-width', `${next}px`);
      }

      if (!persist) return;

      _setSidebarWidthPx(next);
      if (allowPersistSidebarWidth) {
        LS.set(sidebarLsKey, next);
      }
    },
    [getShellWidth, sidebarLsKey, allowPersistSidebarWidth],
  );

  const setChatWidthPx = useCallback(
    (px: number, options?: SetPanelWidthOptions) => {
      const persist = options?.persist !== false;
      const shellW = getShellWidth();
      const effectiveSidebarW = isOpenRef.current ? sidebarWidthRef.current : 0;
      const next = clampChatWidthPx(px, shellW, effectiveSidebarW);
      _setChatWidthPx(next);
      if (persist && getCookiePreferences(userId)?.functional) {
        LS.set(CHAT_WIDTH_STORAGE_KEY, next);
      }
    },
    [getShellWidth, userId],
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
        let cNext = clampChatWidthPx(
          cScaled,
          shellW,
          effS(isOpenRef.current, sScaled),
        );
        let sNext = clampSidebarWidthPx(sScaled, shellW, {
          chatPanelOpen: chatPanelOpenRef.current,
          chatWidthPx: cNext,
        });
        cNext = clampChatWidthPx(
          cScaled,
          shellW,
          effS(isOpenRef.current, sNext),
        );
        sNext = clampSidebarWidthPx(sScaled, shellW, {
          chatPanelOpen: chatPanelOpenRef.current,
          chatWidthPx: cNext,
        });
        _setSidebarWidthPx(sNext);
        _setChatWidthPx(cNext);
        if (allowPersistSidebarWidth) {
          LS.set(sidebarLsKey, sNext);
        }
        if (getCookiePreferences(userId)?.functional) {
          LS.set(CHAT_WIDTH_STORAGE_KEY, cNext);
        }
      }
      prevShellWidthRef.current = shellW;
    },
    [userId, sidebarLsKey, allowPersistSidebarWidth],
  );

  const fitPanelWidthsToShell = useCallback(() => {
    const shellW = getShellWidth();
    if (shellW <= 0) return;
    const s = sidebarWidthRef.current;
    const c = chatWidthRef.current;
    const effS = isOpenRef.current ? s : 0;
    let cNext = clampChatWidthPx(c, shellW, effS);
    let sNext = clampSidebarWidthPx(s, shellW, {
      chatPanelOpen: chatPanelOpenRef.current,
      chatWidthPx: cNext,
    });
    cNext = clampChatWidthPx(c, shellW, isOpenRef.current ? sNext : 0);
    sNext = clampSidebarWidthPx(s, shellW, {
      chatPanelOpen: chatPanelOpenRef.current,
      chatWidthPx: cNext,
    });
    if (sNext !== s || cNext !== c) {
      _setSidebarWidthPx(sNext);
      _setChatWidthPx(cNext);
      if (allowPersistSidebarWidth) {
        LS.set(sidebarLsKey, sNext);
      }
      if (getCookiePreferences(userId)?.functional) {
        LS.set(CHAT_WIDTH_STORAGE_KEY, cNext);
      }
    }
  }, [getShellWidth, userId, sidebarLsKey, allowPersistSidebarWidth]);

  useLayoutEffect(() => {
    if (!shellEl || isSidebarSheetLayout) return;
    fitPanelWidthsToShell();
  }, [
    shellEl,
    chatPanelOpen,
    isSidebarSheetLayout,
    isOpen,
    fitPanelWidthsToShell,
  ]);

  useShellWidthObserver(shellEl, handleShellResize);

  const closeOppositeSidebarIfNoSpace = useCallback(
    (openingMain: boolean, openingChat: boolean) => {
      if (isSidebarSheetLayout) return;
      const shellW = getShellWidth();
      const layoutAfterOpen = {
        mainSidebarOpen: openingMain || isOpenRef.current,
        chatPanelOpen: openingChat || chatPanelOpenRef.current,
        sidebarWidthPx: sidebarWidthRef.current,
        chatWidthPx: chatWidthRef.current,
      };
      if (shellFitsSidebarsLayout(shellW, layoutAfterOpen)) return;
      if (openingMain && chatPanelOpenRef.current) {
        _setChatPanelOpen(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(DISMISS_CHAT_FOR_LAYOUT_EVENT));
        }
      } else if (openingChat && isOpenRef.current) {
        sidebarAutoClosedForChatRef.current = true;
        setIsOpen(false);
      }
    },
    [isSidebarSheetLayout, getShellWidth],
  );

  const setChatPanelOpen = useCallback(
    (open: boolean) => {
      if (open) {
        closeOppositeSidebarIfNoSpace(false, true);
        const shellW = getShellWidth();
        if (shellW > 0 && !isSidebarSheetLayout) {
          const navOpenAfter =
            isOpenRef.current && !sidebarAutoClosedForChatRef.current;
          const effNav = navOpenAfter ? sidebarWidthRef.current : 0;
          const cNext = clampChatWidthPx(chatWidthRef.current, shellW, effNav);
          if (cNext !== chatWidthRef.current) {
            _setChatWidthPx(cNext);
          }
        }
        _setChatPanelOpen(true);
        return;
      }
      _setChatPanelOpen(false);
      if (sidebarAutoClosedForChatRef.current) {
        sidebarAutoClosedForChatRef.current = false;
        setIsOpen(true);
        if (getCookiePreferences(userId)?.functional) {
          setCookie('isSidebarOpen', 'true', 60 * 60 * 24 * 7);
        }
      }
    },
    [
      closeOppositeSidebarIfNoSpace,
      getShellWidth,
      isSidebarSheetLayout,
      userId,
    ],
  );

  const setOpen = useCallback(
    (value: boolean, options?: SetSidebarOpenOptions) => {
      const layoutAutoClose = options?.layoutAutoClose === true;

      if (value) {
        sidebarAutoClosedForChatRef.current = false;
        closeOppositeSidebarIfNoSpace(true, false);
      } else if (layoutAutoClose) {
        sidebarAutoClosedForChatRef.current = true;
      } else {
        sidebarAutoClosedForChatRef.current = false;
      }

      const useViewTransition =
        options?.viewTransition !== false &&
        !isSidebarSheetLayout &&
        'startViewTransition' in document &&
        document.startViewTransition;

      if (useViewTransition) {
        document.startViewTransition(() => {
          setIsOpen(value);
        });
      } else {
        setIsOpen(value);
      }

      if (!layoutAutoClose && getCookiePreferences(userId)?.functional) {
        setCookie('isSidebarOpen', value.toString(), 60 * 60 * 24 * 7);
      }
    },
    [isSidebarSheetLayout, userId, closeOppositeSidebarIfNoSpace],
  );

  const toggleSidebar = useCallback(
    () => setOpen(!isOpenRef.current),
    [setOpen],
  );

  useEffect(() => {
    const shell = wrapperRef.current;
    if (!shell) return;
    if (chatPanelOpen) {
      shell.setAttribute('data-chat-open', '');
      if (isSidebarSheetLayout) {
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
  }, [chatPanelOpen, isSidebarSheetLayout, chatWidthPx]);

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

  const sidebarActionsValue = useMemo<SidebarActionsContextProps>(
    () => ({
      setOpen,
      toggleSidebar,
      setSidebarWidthPx,
      setChatWidthPx,
      setChatPanelOpen,
      getShellWidth,
      getChatPanelOpen,
    }),
    [
      setOpen,
      toggleSidebar,
      setSidebarWidthPx,
      setChatWidthPx,
      setChatPanelOpen,
      getShellWidth,
      getChatPanelOpen,
    ],
  );

  const sidebarStateValue = useMemo<SidebarStateContextProps>(
    () => ({
      isOpen,
      sidebarWidthPx,
      chatWidthPx,
      chatPanelOpen,
      chatPanelContainer,
      sidebarWrapperRef: wrapperRef,
    }),
    [isOpen, sidebarWidthPx, chatWidthPx, chatPanelOpen, chatPanelContainer],
  );

  return (
    <SidebarActionsContext.Provider value={sidebarActionsValue}>
      <SidebarStateContext.Provider value={sidebarStateValue}>
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
      </SidebarStateContext.Provider>
    </SidebarActionsContext.Provider>
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
          <div className={cn(S.sheetSidebarInner)}>
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

function SidebarRail({ className, ...props }: ComponentProps<'button'>) {
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
      notifyPanelWidthDragStart();
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
      notifyPanelWidthDragEnd();
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
  hasSubItems = false,
  isExpanded = false,
  variant = 'ghost',
  size = 'sm',
  className,
  icon,
  children,
  ...props
}: Omit<ButtonProps, 'icon'> & {
  icon?: React.ReactNode;
  isActive?: boolean;
  /** When true, renders an expand/collapse chevron (requires a non–asChild button). */
  hasSubItems?: boolean;
  /** Chevron direction when `hasSubItems` is true. */
  isExpanded?: boolean;
}) {
  const effectiveAsChild = asChild && !hasSubItems;

  const label = (
    <SmartTextTruncate className={S.sidebarMenuButtonLabel}>
      {children}
    </SmartTextTruncate>
  );

  const chevron = hasSubItems ? (
    <span
      className={cn(S.sidebarMenuButtonChevron, isExpanded && S.expanded)}
      aria-hidden="true"
    >
      <ChevronRight size={16} />
    </span>
  ) : null;

  return (
    <Button
      asChild={effectiveAsChild}
      variant={variant}
      size={size}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      aria-expanded={hasSubItems ? isExpanded : undefined}
      className={cn(
        variant === 'default' ? S.sidebarMenuButtonCta : S.sidebarMenuButton,
        S[`size-${size}`],
        className,
      )}
      {...props}
    >
      {icon}
      {effectiveAsChild ? (
        label
      ) : (
        <>
          {label}
          {chevron}
        </>
      )}
    </Button>
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
  children,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  tooltip?: string | ComponentProps<typeof TooltipContent>;
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
    </Comp>
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
        hidden={!isOpen || isSidebarSheetLayout}
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
  useSidebarActions,
  useSidebarState,
};
