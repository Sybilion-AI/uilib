import type { TooltipContentProps, TooltipProps, TooltipProviderProps, TooltipTriggerProps } from './Tooltip.types';
declare function TooltipProvider({ delayDuration, ...props }: TooltipProviderProps): import("react/jsx-runtime").JSX.Element;
declare function Tooltip(props: TooltipProps): import("react/jsx-runtime").JSX.Element;
declare function TooltipTrigger({ ...props }: TooltipTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function TooltipContent({ className, sideOffset, children, maxWidth, ...props }: TooltipContentProps): import("react/jsx-runtime").JSX.Element;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
