import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { createContext, useContext, useRef, useCallback } from 'react';
import { Button } from '../Button/Button.js';
import '@radix-ui/react-separator';
import '../Separator/Separator.styl.js';
import '@phosphor-icons/react';
import '@radix-ui/react-dialog';
import '../Sheet/Sheet.styl.js';
import '@radix-ui/react-tooltip';
import '../Tooltip/Tooltip.styl.js';
import useElemDrag from '../../../hooks/useDragElem.js';
import '../../../tools/env.js';
import '@homecode/ui';
import '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';
import SidebarStem from './Sidebar.styl.js';

const SidebarContext = createContext(null);
function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }
    return context;
}
function SidebarTrigger({ className, onClick, ...props }) {
    const { toggleSidebar } = useSidebar();
    return (jsxs(Button, { "data-sidebar": "trigger", "data-slot": "sidebar-trigger", variant: "ghost", icon: true, className: cn(SidebarStem.sidebarTrigger, className), onClick: event => {
            onClick?.(event);
            toggleSidebar();
        }, ...props, children: [jsx(PanelLeft, { size: 20, strokeWidth: 1.5, className: "text-foreground" }), jsx("span", { className: "sr-only", children: "Toggle Sidebar" })] }));
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

export { PanelResizeHandle, SidebarTrigger, useSidebar };
