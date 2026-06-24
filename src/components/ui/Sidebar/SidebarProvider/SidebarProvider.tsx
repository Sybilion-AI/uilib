import cn from 'classnames';
import {
  CSSProperties,
  ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TooltipProvider } from '#uilib/components/ui/Tooltip';
import {
  CHAT_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_STORAGE_KEY_PX,
  clampChatWidthPx,
  clampSidebarWidthPx,
  shellFitsSidebarsLayout,
} from '#uilib/hooks/panelWidth';
import useEvent from '#uilib/hooks/useEvent';
import { useIsSidebarSheetLayout } from '#uilib/hooks/useIsSidebarSheetLayout';
import { useShellWidthObserver } from '#uilib/hooks/useShellWidthObserver';
import { getCookie, setCookie } from '#uilib/lib/cookie';
import { getCookiePreferences } from '#uilib/lib/cookie-consent/cookie-consent';
import { LS } from '@homecode/ui';

import type { SetSidebarOpenOptions } from '../Sidebar.types';
import S from './SidebarProvider.styl';
import {
  DISMISS_CHAT_FOR_LAYOUT_EVENT,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH_ICON,
} from '../sidebarConstants';
import { SidebarActionsContext, SidebarStateContext } from '../sidebarContext';
import {
  isEditableKeyboardTarget,
  readInitialChatWidthPx,
  readInitialSidebarWidthPx,
} from '../sidebarUtils';

export function SidebarProvider({
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
    (px: number, options?: { persist?: boolean }) => {
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
    (px: number, options?: { persist?: boolean }) => {
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

  const sidebarActionsValue = useMemo(
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

  const sidebarStateValue = useMemo(
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
