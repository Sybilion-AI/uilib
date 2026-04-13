import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { createContext, useContext, useState, useRef, useCallback, useLayoutEffect, useEffect, useMemo } from 'react';
import { Button } from '../Button/Button.js';
import { Separator } from '../Separator/Separator.js';
import { Sheet, SheetContent, SheetTitle } from '../Sheet/Sheet.js';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip.js';
import { clampSidebarWidthPx, SIDEBAR_WIDTH_STORAGE_KEY_PX, CHAT_WIDTH_STORAGE_KEY, SIDEBAR_WIDTH_DEFAULT_PX, SIDEBAR_WIDTH_MIN_PX, SIDEBAR_WIDTH_STORAGE_KEY_PCT, CHAT_WIDTH_DEFAULT_PX, CHAT_WIDTH_MIN_PX, defaultChatWidthPx, clampChatWidthPx } from '../../../hooks/panelWidth.js';
import useElemDrag from '../../../hooks/useDragElem.js';
import useEvent from '../../../hooks/useEvent.js';
import { useIsMobile } from '../../../hooks/useIsMobile.js';
import { useShellWidthObserver } from '../../../hooks/useShellWidthObserver.js';
import { setCookie, getCookie } from '../../../lib/cookie.js';
import { getCookiePreferences } from '../../../lib/cookie-consent/cookie-consent.js';
import { LS, Scroll } from '@homecode/ui';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';
import SidebarStem from './Sidebar.styl.js';

const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
function isEditableKeyboardTarget(el) {
    if (!el)
        return false;
    if (el instanceof HTMLElement && el.isContentEditable)
        return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
function readInitialSidebarWidthPx() {
    if (typeof window === 'undefined')
        return SIDEBAR_WIDTH_DEFAULT_PX;
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
function readInitialChatWidthPx() {
    if (typeof window === 'undefined')
        return CHAT_WIDTH_DEFAULT_PX;
    const stored = LS.get(CHAT_WIDTH_STORAGE_KEY);
    if (typeof stored === 'number' && stored >= CHAT_WIDTH_MIN_PX) {
        return stored;
    }
    return defaultChatWidthPx(window.innerWidth);
}
const SidebarContext = createContext(null);
function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }
    return context;
}
function SidebarProvider({ defaultOpen = getCookie('isSidebarOpen') ?? true, className, style, children, ...props }) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(isMobile ? false : defaultOpen);
    const wrapperRef = useRef(null);
    const shellWidthRef = useRef(0);
    const prevShellWidthRef = useRef(0);
    const [shellEl, setShellEl] = useState(null);
    const [chatPanelContainer, setChatPanelContainer] = useState(null);
    const onChatPanelMount = useCallback((node) => {
        setChatPanelContainer(node);
    }, []);
    const [sidebarWidthPx, _setSidebarWidthPx] = useState(readInitialSidebarWidthPx);
    const [chatWidthPx, _setChatWidthPx] = useState(readInitialChatWidthPx);
    const [chatPanelOpen, setChatPanelOpen] = useState(false);
    const sidebarWidthRef = useRef(sidebarWidthPx);
    const chatWidthRef = useRef(chatWidthPx);
    sidebarWidthRef.current = sidebarWidthPx;
    chatWidthRef.current = chatWidthPx;
    const mergeWrapperRef = useCallback((el) => {
        wrapperRef.current = el;
        setShellEl(el);
    }, []);
    const getShellWidth = useCallback(() => {
        const w = shellWidthRef.current;
        if (w > 0)
            return w;
        if (wrapperRef.current) {
            const cw = wrapperRef.current.getBoundingClientRect().width;
            if (cw > 0)
                return cw;
        }
        return typeof window !== 'undefined' ? window.innerWidth : 1200;
    }, []);
    const setSidebarWidthPx = useCallback((px, options) => {
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
    }, [getShellWidth, chatPanelOpen, chatWidthPx]);
    const setChatWidthPx = useCallback((px, options) => {
        const persist = options?.persist !== false;
        const shellW = getShellWidth();
        const effectiveSidebarW = isOpen ? sidebarWidthPx : 0;
        const next = clampChatWidthPx(px, shellW, effectiveSidebarW);
        _setChatWidthPx(next);
        if (persist && getCookiePreferences()?.functional) {
            LS.set(CHAT_WIDTH_STORAGE_KEY, next);
        }
    }, [getShellWidth, isOpen, sidebarWidthPx]);
    const handleShellResize = useCallback((shellW) => {
        shellWidthRef.current = shellW;
        const prev = prevShellWidthRef.current;
        if (prev > 0 && shellW > 0) {
            const s = sidebarWidthRef.current;
            const c = chatWidthRef.current;
            const sScaled = Math.round((s * shellW) / prev);
            const cScaled = Math.round((c * shellW) / prev);
            const effS = (navOpen, sidebarPx) => navOpen ? sidebarPx : 0;
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
    }, [chatPanelOpen, isOpen]);
    const fitPanelWidthsToShell = useCallback(() => {
        const shellW = getShellWidth();
        if (shellW <= 0)
            return;
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
        if (!shellEl || isMobile)
            return;
        fitPanelWidthsToShell();
    }, [shellEl, chatPanelOpen, isMobile, isOpen, fitPanelWidthsToShell]);
    useShellWidthObserver(shellEl, handleShellResize);
    const setOpen = useCallback((value) => {
        if (!isMobile &&
            'startViewTransition' in document &&
            document.startViewTransition) {
            document.startViewTransition(() => {
                setIsOpen(value);
            });
        }
        else {
            setIsOpen(value);
        }
        if (getCookiePreferences()?.functional) {
            setCookie('isSidebarOpen', value.toString(), 60 * 60 * 24 * 7);
        }
    }, [isMobile]);
    const toggleSidebar = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);
    useEffect(() => {
        const shell = wrapperRef.current;
        if (!shell)
            return;
        if (chatPanelOpen) {
            shell.setAttribute('data-chat-open', '');
            if (isMobile) {
                shell.style.setProperty('--chat-panel-width', '100%');
                shell.style.setProperty('--chat-panel-height', '100dvh');
            }
            else {
                shell.style.setProperty('--chat-panel-width', `${chatWidthPx}px`);
                shell.style.removeProperty('--chat-panel-height');
            }
        }
        else {
            shell.removeAttribute('data-chat-open');
            shell.style.setProperty('--chat-panel-width', '0px');
            shell.style.removeProperty('--chat-panel-height');
        }
    }, [chatPanelOpen, isMobile, chatWidthPx]);
    useEffect(() => {
        return () => {
            const shell = wrapperRef.current;
            if (!shell)
                return;
            shell.removeAttribute('data-chat-open');
            shell.style.setProperty('--chat-panel-width', '0px');
            shell.style.removeProperty('--chat-panel-height');
        };
    }, []);
    useEvent({
        event: 'keydown',
        callback: (e) => {
            const isToggleShortcut = (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) ||
                (e.key === '/' && !isEditableKeyboardTarget(document.activeElement));
            if (isToggleShortcut) {
                e.preventDefault();
                toggleSidebar();
            }
        },
    });
    const contextValue = useMemo(() => ({
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
    }), [
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
    ]);
    return (jsx(SidebarContext.Provider, { value: contextValue, children: jsx(TooltipProvider, { delayDuration: 0, children: jsxs("div", { ref: mergeWrapperRef, "data-slot": "sidebar-wrapper", "data-state": isOpen ? 'expanded' : 'collapsed', style: {
                    '--sidebar-width': `${sidebarWidthPx}px`,
                    '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                    ...style,
                }, className: cn(SidebarStem.sidebarWrapper, className), ...props, children: [jsx("div", { className: SidebarStem.sidebarMainShell, children: children }), jsx("div", { ref: onChatPanelMount, className: SidebarStem.chatPanelMount, "data-slot": "chat-panel-mount" })] }) }) }));
}
function Sidebar({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, side = 'left', variant = 'sidebar', collapsible = 'offcanvas', children, fullHeightResizer = false, ...props }) {
    const isMobile = useIsMobile();
    const { isOpen, setOpen } = useSidebar();
    // Only force-close on mobile. Do not call setOpen(true) on desktop — that ran on every
    // load and overwrote the isSidebarOpen cookie (collapsed → opened + cookie "true").
    useEffect(() => {
        if (isMobile)
            setOpen(false);
    }, [isMobile, setOpen]);
    if (collapsible === 'none') {
        return (jsx("div", { "data-slot": "sidebar", className: cn(SidebarStem.sidebarNone, className), ...props, children: children }));
    }
    if (isMobile) {
        return (jsx(Sheet, { open: isOpen, onOpenChange: setOpen, ...props, children: jsxs(SheetContent, { "data-sidebar": "sidebar", "data-slot": "sidebar", className: cn(SidebarStem.sheetContentSidebar, className), style: {
                    '--gap-top': '40px',
                    '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                }, side: side, children: [jsx(SheetTitle, { className: "sr-only", children: "Navigation Menu" }), jsx("div", { className: cn(SidebarStem.sheetSidebarInner), children: children })] }) }));
    }
    return (jsxs("aside", { className: cn(SidebarStem.sidebar, SidebarStem[`variant-${variant}`], className, fullHeightResizer && SidebarStem.fullHeightResizer), "data-state": isOpen ? 'expanded' : 'collapsed', "data-collapsible": !isOpen ? collapsible : '', "data-variant": variant, "data-side": side, ...props, children: [children, jsx(SidebarResizeHandle, { side: side })] }));
}
function SidebarTrigger({ className, onClick, ...props }) {
    const { toggleSidebar } = useSidebar();
    return (jsx(Button, { "data-sidebar": "trigger", "data-slot": "sidebar-trigger", variant: "ghost", icon: true, className: cn(SidebarStem.sidebarTrigger, className), onClick: event => {
            onClick?.(event);
            toggleSidebar();
        }, ...props, children: jsx(PanelLeft, { size: 20, strokeWidth: 1.5, className: "text-foreground" }) }));
}
function SidebarRail({ className, ...props }) {
    const { toggleSidebar } = useSidebar();
    return (jsx("button", { "data-sidebar": "rail", "data-slot": "sidebar-rail", "aria-label": "Toggle Sidebar", tabIndex: -1, onClick: toggleSidebar, title: "Toggle Sidebar", className: cn(SidebarStem.sidebarRail, className), ...props }));
}
function PanelResizeHandle({ className, edge, isActive, startWidthPx, getShellWidth, onDragWidth, onDragComplete, ...props }) {
    const handleRef = useRef(null);
    const startWidthRef = useRef(0);
    const lastRawRef = useRef(0);
    const handleDrag = useCallback((delta) => {
        const shellW = getShellWidth();
        if (shellW <= 0)
            return;
        const raw = edge === 'trailing'
            ? startWidthRef.current + delta.x
            : startWidthRef.current - delta.x;
        lastRawRef.current = raw;
        onDragWidth(raw);
    }, [edge, getShellWidth, onDragWidth]);
    const handleDragStart = useCallback((e) => {
        startWidthRef.current = startWidthPx;
        lastRawRef.current = startWidthPx;
        handleRef.current?.setPointerCapture(e.pointerId);
    }, [startWidthPx]);
    const handleDragEnd = useCallback((e) => {
        onDragComplete?.(lastRawRef.current);
        try {
            handleRef.current?.releasePointerCapture(e.pointerId);
        }
        catch {
            // Capture already released
        }
        startWidthRef.current = 0;
    }, [onDragComplete]);
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
    return (jsx("div", { ref: handleRef, "data-slot": "panel-resize-handle", "data-edge": edge, className: className, ...props }));
}
function SidebarResizeHandle({ className, side = 'left', ...props }) {
    const { isOpen, sidebarWidthPx, setSidebarWidthPx, getShellWidth } = useSidebar();
    const isMobile = useIsMobile();
    const edge = side === 'left' ? 'trailing' : 'leading';
    const onDragWidth = useCallback((rawPx) => {
        setSidebarWidthPx(rawPx, { persist: false });
    }, [setSidebarWidthPx]);
    const onDragComplete = useCallback((finalRawPx) => {
        setSidebarWidthPx(finalRawPx, { persist: true });
    }, [setSidebarWidthPx]);
    if (isMobile || !isOpen) {
        return null;
    }
    return (jsx(PanelResizeHandle, { edge: edge, isActive: isOpen && !isMobile, startWidthPx: sidebarWidthPx, getShellWidth: getShellWidth, onDragWidth: onDragWidth, onDragComplete: onDragComplete, "data-sidebar": "resize-handle", "data-slot": "sidebar-resize-handle", "data-side": side, className: cn(SidebarStem.sidebarResizeHandle, className), ...props }));
}
function SidebarFooter({ className, ...props }) {
    return (jsx("div", { "data-slot": "sidebar-footer", "data-sidebar": "footer", className: cn(SidebarStem.sidebarFooter, className), ...props }));
}
function SidebarSeparator({ className, ...props }) {
    return (jsx(Separator, { "data-slot": "sidebar-separator", "data-sidebar": "separator", className: cn(SidebarStem.sidebarSeparator, className), ...props }));
}
function SidebarContent({ className, innerClassName, children, }) {
    // const sidebarContentTransition = useViewTransition({
    //   transitionName: 'sidebar-content',
    // });
    return (jsx(Scroll, { y: true, autoHide: true, fadeSize: "l", offset: { y: { before: 40, after: 20 } }, className: cn(SidebarStem.sidebarContent, className), innerClassName: innerClassName, children: children }));
}
function SidebarGroup({ className, ...props }) {
    return (jsx("div", { "data-slot": "sidebar-group", "data-sidebar": "group", className: cn(SidebarStem.sidebarGroup, className), ...props }));
}
function SidebarGroupLabel({ className, asChild = false, ...props }) {
    const Comp = asChild ? Slot : 'div';
    return (jsx(Comp, { "data-slot": "sidebar-group-label", "data-sidebar": "group-label", className: cn(SidebarStem.sidebarGroupLabel, className), ...props }));
}
function SidebarGroupAction({ className, asChild = false, ...props }) {
    const Comp = asChild ? Slot : 'button';
    return (jsx(Comp, { "data-slot": "sidebar-group-action", "data-sidebar": "group-action", className: cn(SidebarStem.sidebarGroupAction, className), ...props }));
}
function SidebarGroupContent({ className, ...props }) {
    return (jsx("div", { "data-slot": "sidebar-group-content", "data-sidebar": "group-content", className: cn(SidebarStem.sidebarGroupContent, className), ...props }));
}
function SidebarMenu({ className, ...props }) {
    return (jsx("ul", { "data-slot": "sidebar-menu", "data-sidebar": "menu", className: cn(SidebarStem.sidebarMenu, className), ...props }));
}
function SidebarMenuItem({ className, ...props }) {
    return (jsx("li", { "data-slot": "sidebar-menu-item", "data-sidebar": "menu-item", className: cn(SidebarStem.sidebarMenuItem, className), ...props }));
}
function SidebarMenuButton({ asChild = false, isActive = false, variant = 'ghost', size = 'sm', className, ...props }) {
    return (jsx(Button, { asChild: asChild, variant: variant, size: size, "data-slot": "sidebar-menu-button", "data-sidebar": "menu-button", "data-active": isActive, className: cn(variant === 'default' ? SidebarStem.sidebarMenuButtonCta : SidebarStem.sidebarMenuButton, SidebarStem[`size-${size}`], className), ...props }));
}
function SidebarMenuAction({ className, asChild = false, showOnHover = false, ...props }) {
    const Comp = asChild ? Slot : 'button';
    return (jsx(Comp, { "data-slot": "sidebar-menu-action", "data-sidebar": "menu-action", className: cn(SidebarStem.sidebarMenuAction, showOnHover && SidebarStem.showOnHover, className), ...props }));
}
function SidebarMenuBadge({ className, ...props }) {
    return (jsx("div", { "data-slot": "sidebar-menu-badge", "data-sidebar": "menu-badge", className: cn(SidebarStem.sidebarMenuBadge, className), ...props }));
}
function SidebarMenuSub({ className, ...props }) {
    return (jsx("ul", { "data-slot": "sidebar-menu-sub", "data-sidebar": "menu-sub", className: cn(SidebarStem.sidebarMenuSub, className), ...props }));
}
function SidebarMenuSubItem({ className, ...props }) {
    return (jsx("li", { "data-slot": "sidebar-menu-sub-item", "data-sidebar": "menu-sub-item", className: cn(SidebarStem.sidebarMenuSubItem, className), ...props }));
}
function SidebarMenuSubButton({ asChild = false, size = 'md', isActive = false, tooltip, className, onClick, ...props }) {
    const Comp = asChild ? Slot : 'a';
    const { isOpen, setOpen } = useSidebar();
    const isMobile = useIsMobile();
    const handleClick = (event) => {
        if (isMobile && isOpen)
            setOpen(false);
        onClick?.(event);
    };
    const button = (jsx(Comp, { "data-slot": "sidebar-menu-sub-button", "data-sidebar": "menu-sub-button", "data-size": size, "data-active": isActive, className: cn(SidebarStem.sidebarMenuSubButton, SidebarStem[`size-${size}`], className), onClick: handleClick, ...props }));
    if (!tooltip)
        return button;
    if (typeof tooltip === 'string') {
        tooltip = {
            children: tooltip,
        };
    }
    return (jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: button }), jsx(TooltipContent, { side: "right", align: "center", hidden: !isOpen || isMobile, ...tooltip })] }));
}

export { PanelResizeHandle, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarResizeHandle, SidebarSeparator, SidebarTrigger, useSidebar };
