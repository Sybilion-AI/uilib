import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { Check, Circle, CaretRight } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import S from './DropdownMenu.styl.js';

function DropdownMenu({ ...props }) {
    return jsx(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuPortal({ ...props }) {
    return (jsx(DropdownMenuPrimitive.Portal, { "data-slot": "dropdown-menu-portal", ...props }));
}
function DropdownMenuTrigger({ ...props }) {
    return (jsx(DropdownMenuPrimitive.Trigger, { "data-slot": "dropdown-menu-trigger", ...props }));
}
function DropdownMenuContent({ className, sideOffset = 4, collisionPadding = 8, elevation = 'sm', ...props }) {
    return (jsx(DropdownMenuPrimitive.Portal, { children: jsx(DropdownMenuPrimitive.Content, { "data-slot": "dropdown-menu-content", sideOffset: sideOffset, collisionPadding: collisionPadding, className: cn(S.content, S[`elevation-${elevation}`], className), ...props }) }));
}
function DropdownMenuGroup({ ...props }) {
    return (jsx(DropdownMenuPrimitive.Group, { "data-slot": "dropdown-menu-group", ...props }));
}
function DropdownMenuItem({ className, inset, variant = 'default', ...props }) {
    return (jsx(DropdownMenuPrimitive.Item, { "data-slot": "dropdown-menu-item", "data-inset": inset, "data-variant": variant, className: cn(S.item, className), ...props }));
}
function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
    return (jsxs(DropdownMenuPrimitive.CheckboxItem, { "data-slot": "dropdown-menu-checkbox-item", className: cn(S.checkboxItem, className), checked: checked, ...props, children: [jsx("span", { className: S.indicator, children: jsx(DropdownMenuPrimitive.ItemIndicator, { children: jsx(Check, { className: "size-4" }) }) }), children] }));
}
function DropdownMenuRadioGroup({ ...props }) {
    return (jsx(DropdownMenuPrimitive.RadioGroup, { "data-slot": "dropdown-menu-radio-group", ...props }));
}
function DropdownMenuRadioItem({ className, children, ...props }) {
    return (jsxs(DropdownMenuPrimitive.RadioItem, { "data-slot": "dropdown-menu-radio-item", className: cn(S.radioItem, className), ...props, children: [jsx("span", { className: S.indicator, children: jsx(DropdownMenuPrimitive.ItemIndicator, { children: jsx(Circle, { className: "size-2 fill-current" }) }) }), children] }));
}
function DropdownMenuLabel({ className, inset, ...props }) {
    return (jsx(DropdownMenuPrimitive.Label, { "data-slot": "dropdown-menu-label", "data-inset": inset, className: cn(S.label, className), ...props }));
}
function DropdownMenuSeparator({ className, ...props }) {
    return (jsx(DropdownMenuPrimitive.Separator, { "data-slot": "dropdown-menu-separator", className: cn(S.separator, className), ...props }));
}
function DropdownMenuShortcut({ className, ...props }) {
    return (jsx("span", { "data-slot": "dropdown-menu-shortcut", className: cn(S.shortcut, className), ...props }));
}
function DropdownMenuSub({ ...props }) {
    return jsx(DropdownMenuPrimitive.Sub, { "data-slot": "dropdown-menu-sub", ...props });
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
    return (jsxs(DropdownMenuPrimitive.SubTrigger, { "data-slot": "dropdown-menu-sub-trigger", "data-inset": inset, className: cn(S.subTrigger, className), ...props, children: [children, jsx(CaretRight, { className: "ml-auto size-4" })] }));
}
function DropdownMenuSubContent({ className, collisionPadding = 8, ...props }) {
    return (jsx(DropdownMenuPrimitive.SubContent, { "data-slot": "dropdown-menu-sub-content", collisionPadding: collisionPadding, className: cn(S.subContent, className), ...props }));
}

export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger };
