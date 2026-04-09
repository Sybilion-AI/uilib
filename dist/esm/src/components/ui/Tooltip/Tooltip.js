import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import S from './Tooltip.styl.js';

function TooltipProvider({ delayDuration = 0, ...props }) {
    return (jsx(TooltipPrimitive.Provider, { "data-slot": "tooltip-provider", delayDuration: delayDuration, ...props }));
}
function Tooltip({ ...props }) {
    return (jsx(TooltipProvider, { children: jsx(TooltipPrimitive.Root, { "data-slot": "tooltip", ...props }) }));
}
function TooltipTrigger({ ...props }) {
    return jsx(TooltipPrimitive.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({ className, sideOffset = 0, children, maxWidth, ...props }) {
    const style = { ...props.style };
    if (maxWidth)
        style.maxWidth = `${maxWidth}px`;
    return (jsx(TooltipPrimitive.Portal, { children: jsxs(TooltipPrimitive.Content, { "data-slot": "tooltip-content", sideOffset: sideOffset, className: cn(S.tooltipContent, className), ...props, style: style, children: [children, jsx(TooltipPrimitive.Arrow, { className: S.tooltipArrow })] }) }));
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
