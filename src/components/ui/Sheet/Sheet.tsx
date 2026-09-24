import cn from 'classnames';

import { X } from '@phosphor-icons/react';
import * as SheetPrimitive from '@radix-ui/react-dialog';

import S from './Sheet.styl';
import {
  SheetCloseProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetOverlayProps,
  SheetPortalProps,
  SheetProps,
  SheetTitleProps,
  SheetTriggerProps,
} from './Sheet.types';

function Sheet({ ...props }: SheetProps) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPortalProps) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(S.overlay, className)}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  fullWidth = false,
  ...props
}: SheetContentProps) {
  const sideClass = side
    ? S[`side${side.charAt(0).toUpperCase()}${side.slice(1)}`]
    : S.sideRight;

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          S.content,
          sideClass,
          fullWidth && S.fullWidth,
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className={cn(S.close)}>
          <X size={16} />
          {/* <span className="sr-only">Close</span> */}
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(S.header, className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(S.footer, className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(S.title, className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(S.description, className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
