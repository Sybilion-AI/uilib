import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import S from './Select.styl.js';

function Select({ variant = 'default', ...props }) {
    return (jsx(SelectPrimitive.Root, { "data-slot": "select", "data-variant": variant, ...props }));
}
function SelectGroup({ ...props }) {
    return jsx(SelectPrimitive.Group, { "data-slot": "select-group", ...props });
}
function SelectValue({ ...props }) {
    return jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({ className, size = 'md', variant = 'default', darker = false, children, hideChevron = false, ...props }) {
    return (jsxs(SelectPrimitive.Trigger, { "data-slot": "select-trigger", "data-size": size, "data-variant": variant, className: cn(S.selectTrigger, darker && S.darker, className), ...props, children: [children, !hideChevron && (jsx(SelectPrimitive.Icon, { asChild: true, children: jsx(ChevronDownIcon, { className: S.selectIcon }) }))] }));
}
function SelectContent({ className, children, position = 'popper', ...props }) {
    return (jsx(SelectPrimitive.Portal, { children: jsxs(SelectPrimitive.Content, { "data-slot": "select-content", className: cn(S.selectContent, position === 'popper' && S.selectContentPopper, className), position: position, ...props, children: [jsx(SelectScrollUpButton, {}), jsx(SelectPrimitive.Viewport, { className: cn(S.selectViewport, position === 'popper' && S.selectViewportPopper, className), children: children }), jsx(SelectScrollDownButton, {})] }) }));
}
function SelectItem({ className, children, selected, ...props }) {
    return (jsx(SelectPrimitive.Item, { "data-slot": "select-item", className: cn(S.selectItem, className, selected && S.selected), ...props, children: jsx(SelectPrimitive.ItemText, { children: children }) }));
}
function SelectSeparator({ className, ...props }) {
    return (jsx(SelectPrimitive.Separator, { "data-slot": "select-separator", className: cn(S.selectSeparator, className), ...props }));
}
function SelectScrollUpButton({ className, ...props }) {
    return (jsx(SelectPrimitive.ScrollUpButton, { "data-slot": "select-scroll-up-button", className: cn(S.selectScrollButton, className), ...props, children: jsx(ChevronUpIcon, { className: S.selectScrollIcon }) }));
}
function SelectScrollDownButton({ className, ...props }) {
    return (jsx(SelectPrimitive.ScrollDownButton, { "data-slot": "select-scroll-down-button", className: cn(S.selectScrollButton, className), ...props, children: jsx(ChevronDownIcon, { className: S.selectScrollIcon }) }));
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
