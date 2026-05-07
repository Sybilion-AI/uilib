import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { X } from '@phosphor-icons/react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import S from './Sheet.styl.js';

function Sheet({ ...props }) {
    return jsx(SheetPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({ ...props }) {
    return jsx(SheetPrimitive.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetClose({ ...props }) {
    return jsx(SheetPrimitive.Close, { "data-slot": "sheet-close", ...props });
}
function SheetPortal({ ...props }) {
    return jsx(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({ className, ...props }) {
    return (jsx(SheetPrimitive.Overlay, { "data-slot": "sheet-overlay", className: cn(S.overlay, className), ...props }));
}
function SheetContent({ className, children, side = 'right', fullWidth = false, ...props }) {
    const sideClass = side
        ? S[`side${side.charAt(0).toUpperCase()}${side.slice(1)}`]
        : S.sideRight;
    return (jsxs(SheetPortal, { children: [jsx(SheetOverlay, {}), jsxs(SheetPrimitive.Content, { "data-slot": "sheet-content", className: cn(S.content, sideClass, fullWidth && S.fullWidth, className), ...props, children: [children, jsx(SheetPrimitive.Close, { className: cn(S.close), children: jsx(X, { className: "size-4" }) })] })] }));
}
function SheetHeader({ className, ...props }) {
    return (jsx("div", { "data-slot": "sheet-header", className: cn(S.header, className), ...props }));
}
function SheetFooter({ className, ...props }) {
    return (jsx("div", { "data-slot": "sheet-footer", className: cn(S.footer, className), ...props }));
}
function SheetTitle({ className, ...props }) {
    return (jsx(SheetPrimitive.Title, { "data-slot": "sheet-title", className: cn(S.title, className), ...props }));
}
function SheetDescription({ className, ...props }) {
    return (jsx(SheetPrimitive.Description, { "data-slot": "sheet-description", className: cn(S.description, className), ...props }));
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
