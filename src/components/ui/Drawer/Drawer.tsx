'use client';

import cn from 'classnames';

import { Drawer as DrawerPrimitive } from 'vaul';

import * as S from './Drawer.styles';
import type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerPortalProps,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './Drawer.types';

function Drawer({ ...props }: DrawerProps) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(S.overlay, className)}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(S.content, className)}
        {...props}
      >
        <div className={S.handle} />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(S.header, className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(S.footer, className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(S.title, className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(S.description, className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
