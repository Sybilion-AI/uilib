import type { TooltipContentProps, TooltipProps, TooltipProviderProps, TooltipTriggerProps } from './Tooltip.types';
declare function TooltipProvider({ delayDuration, ...props }: TooltipProviderProps): import("react/jsx-runtime").JSX.Element;
declare function Tooltip({ children, ...props }: TooltipProps): import("react/jsx-runtime").JSX.Element;
declare function TooltipTrigger({ ref, ...props }: TooltipTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function TooltipContent({ className, sideOffset, children, maxWidth, overTrigger, align, side, avoidCollisions, style: styleProp, ...props }: TooltipContentProps): import("react/jsx-runtime").JSX.Element;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
