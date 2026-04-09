import { ComponentProps } from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
export interface SheetContentProps extends ComponentProps<typeof SheetPrimitive.Content> {
    side?: 'top' | 'right' | 'bottom' | 'left';
    fullWidth?: boolean;
}
export type SheetProps = ComponentProps<typeof SheetPrimitive.Root>;
export type SheetTriggerProps = ComponentProps<typeof SheetPrimitive.Trigger>;
export type SheetCloseProps = ComponentProps<typeof SheetPrimitive.Close>;
export type SheetPortalProps = ComponentProps<typeof SheetPrimitive.Portal>;
export type SheetOverlayProps = ComponentProps<typeof SheetPrimitive.Overlay>;
export type SheetHeaderProps = ComponentProps<'div'>;
export type SheetFooterProps = ComponentProps<'div'>;
export type SheetTitleProps = ComponentProps<typeof SheetPrimitive.Title>;
export type SheetDescriptionProps = ComponentProps<typeof SheetPrimitive.Description>;
