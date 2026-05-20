import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import React__default, { useState, useRef, useId, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../Card/Card.js';
import { APP_MODAL_ID } from '../../../constants/appMount.js';
import { XIcon } from '@phosphor-icons/react';
import S from './Dialog.styl.js';

function Dialog({ open, onOpenChange, disabled, trigger, title, subtitle, disableCloseButton, icon, content, contentClassName, footer, footerClassName, footerAlignment = 'center', size = 'default', className, noScroll, maxHeight, autoScrollBottom, width, }) {
    const [isMounted, setIsMounted] = useState(false);
    const [modalContainer, setModalContainer] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);
    const previousActiveElementRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();
    // Track mount state for portal
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);
    useLayoutEffect(() => {
        setModalContainer(document.getElementById(APP_MODAL_ID));
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
        }
        else {
            setIsAnimating(true);
        }
    }, [open]);
    // Focus trap and keyboard handling
    useEffect(() => {
        if (!open || !dialogRef.current)
            return;
        // Store the element that had focus before dialog opened
        previousActiveElementRef.current = document.activeElement;
        // Focus the dialog
        const focusableElements = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        // Focus first element or dialog itself
        if (firstFocusable) {
            firstFocusable.focus();
        }
        else {
            dialogRef.current.focus();
        }
        const handleKeyDown = (e) => {
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
                }
                else {
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
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };
    const handleCloseClick = () => {
        onOpenChange(false);
    };
    // Store trigger ref for focus restoration
    useEffect(() => {
        if (trigger && React__default.isValidElement(trigger)) {
            // Try to get ref from trigger element
            const triggerElement = document.activeElement;
            if (triggerElement && triggerElement !== document.body) {
                triggerRef.current = triggerElement;
            }
        }
    }, [trigger]);
    if (!isMounted)
        return null;
    const dialogContent = (jsxs(Fragment, { children: [jsx("div", { className: cn(S.dialogOverlay, open && !isAnimating && S.isOpen), onClick: handleOverlayClick, "aria-hidden": "true" }), jsxs(Card, { ref: dialogRef, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? titleId : undefined, "aria-describedby": subtitle ? descriptionId : undefined, className: cn(S.dialogContent, S[`size-${size}`], open && !isAnimating && S.isOpen, !open && isAnimating && S.isClosed, className), tabIndex: -1, style: {
                    width,
                    maxHeight: maxHeight
                        ? `min(${maxHeight}, calc(100% - var(--p-4)))`
                        : null,
                }, children: [(title || subtitle || icon) && (jsx(CardHeader, { icon: icon, title: title, description: subtitle })), !disableCloseButton && (jsx("button", { className: S.dialogClose, onClick: handleCloseClick, "aria-label": "Close dialog", type: "button", children: jsx(XIcon, { size: 16 }) })), content && (jsx(CardContent, { className: contentClassName, noScroll: noScroll, autoScrollBottom: autoScrollBottom, children: content })), footer && (jsx(CardFooter, { className: cn(S.footer, S[`align-${footerAlignment}`], footerClassName), children: footer }))] })] }));
    const onTriggerClick = !disabled ? () => onOpenChange(true) : undefined;
    return (jsxs(Fragment, { children: [trigger && jsx("div", { onClick: onTriggerClick, children: trigger }), open &&
                !disabled &&
                modalContainer &&
                createPortal(dialogContent, modalContainer)] }));
}

export { Dialog, S as DialogStyles };
