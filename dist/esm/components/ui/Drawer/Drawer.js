import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { Drawer as Drawer$1 } from 'vaul';
import S from './Drawer.styl.js';

function Drawer({ ...props }) {
    return jsx(Drawer$1.Root, { "data-slot": "drawer", ...props });
}
function DrawerTrigger({ ...props }) {
    return jsx(Drawer$1.Trigger, { "data-slot": "drawer-trigger", ...props });
}
function DrawerPortal({ ...props }) {
    return jsx(Drawer$1.Portal, { "data-slot": "drawer-portal", ...props });
}
function DrawerClose({ ...props }) {
    return jsx(Drawer$1.Close, { "data-slot": "drawer-close", ...props });
}
function DrawerOverlay({ className, ...props }) {
    return (jsx(Drawer$1.Overlay, { "data-slot": "drawer-overlay", className: cn(S.overlay, className), ...props }));
}
function DrawerContent({ className, children, ...props }) {
    return (jsxs(DrawerPortal, { "data-slot": "drawer-portal", children: [jsx(DrawerOverlay, {}), jsxs(Drawer$1.Content, { "data-slot": "drawer-content", className: cn(S.content, className), ...props, children: [jsx("div", { className: S.handle }), children] })] }));
}
function DrawerHeader({ className, ...props }) {
    return (jsx("div", { "data-slot": "drawer-header", className: cn(S.header, className), ...props }));
}
function DrawerFooter({ className, ...props }) {
    return (jsx("div", { "data-slot": "drawer-footer", className: cn(S.footer, className), ...props }));
}
function DrawerTitle({ className, ...props }) {
    return (jsx(Drawer$1.Title, { "data-slot": "drawer-title", className: cn(S.title, className), ...props }));
}
function DrawerDescription({ className, ...props }) {
    return (jsx(Drawer$1.Description, { "data-slot": "drawer-description", className: cn(S.description, className), ...props }));
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };
