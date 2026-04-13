import cn from 'classnames';
import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#uilib/components/ui/Card/Card';
import { XIcon } from '@phosphor-icons/react';

import S from './Dialog.styl';
import type { DialogProps } from './Dialog.types';

const FOOTER_ALIGN_CLASS: Record<
  NonNullable<DialogProps['footerAlignment']>,
  string
> = {
  left: S.footerAlignLeft,
  center: S.footerAlignCenter,
  right: S.footerAlignRight,
};

export function Dialog({
  open,
  onOpenChange,
  disabled,
  trigger,
  title,
  subtitle,
  icon,
  content,
  contentClassName,
  footer,
  footerAlignment = 'center',
  size = 'default',
  className,
  noScroll,
  maxHeight,
  autoScrollBottom,
  width,
}: DialogProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Track mount state for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle open/close animations
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      });
    } else {
      setIsAnimating(true);
    }
  }, [open]);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    // Store the element that had focus before dialog opened
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the dialog
    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus first element or dialog itself
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      dialogRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      // Trap focus with Tab key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previous element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [open, onOpenChange]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleCloseClick = () => {
    onOpenChange(false);
  };

  // Store trigger ref for focus restoration
  useEffect(() => {
    if (trigger && React.isValidElement(trigger)) {
      // Try to get ref from trigger element
      const triggerElement = document.activeElement as HTMLElement;
      if (triggerElement && triggerElement !== document.body) {
        triggerRef.current = triggerElement;
      }
    }
  }, [trigger]);

  if (!isMounted) return null;

  const dialogContent = (
    <>
      <div
        className={cn(S.dialogOverlay, open && !isAnimating && S.isOpen)}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? descriptionId : undefined}
        className={cn(
          S.dialogContent,
          S[`size-${size}`],
          open && !isAnimating && S.isOpen,
          !open && isAnimating && S.isClosed,
          className,
        )}
        tabIndex={-1}
        style={{
          width,
          maxHeight: maxHeight
            ? `min(${maxHeight}, calc(100% - var(--p-4)))`
            : null,
        }}
      >
        {(title || subtitle || icon) && (
          <CardHeader icon={icon} title={title} description={subtitle} />
        )}

        <button
          className={S.dialogClose}
          onClick={handleCloseClick}
          aria-label="Close dialog"
          type="button"
        >
          <XIcon size={16} />
          <span className="sr-only">Close</span>
        </button>

        {content && (
          <CardContent
            className={contentClassName}
            noScroll={noScroll}
            autoScrollBottom={autoScrollBottom}
          >
            {content}
          </CardContent>
        )}

        {footer && (
          <CardFooter className={S[`align-${footerAlignment}`]}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </>
  );

  const onTriggerClick = !disabled ? () => onOpenChange(true) : undefined;

  return (
    <>
      {trigger && <div onClick={onTriggerClick}>{trigger}</div>}
      {open && !disabled && createPortal(dialogContent, document.body)}
    </>
  );
}

// Export Stylus classes for direct use if needed
export { default as DialogStyles } from './Dialog.styl';
