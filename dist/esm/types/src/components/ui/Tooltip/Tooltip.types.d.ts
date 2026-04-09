import * as TooltipPrimitive from '@radix-ui/react-tooltip';
export interface TooltipProviderProps extends React.ComponentProps<typeof TooltipPrimitive.Provider> {
    delayDuration?: number;
}
export interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {
}
export interface TooltipTriggerProps extends React.ComponentProps<typeof TooltipPrimitive.Trigger> {
}
export interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
    className?: string;
    sideOffset?: number;
    maxWidth?: number;
}
