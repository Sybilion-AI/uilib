import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useRef, useEffect, useCallback } from 'react';
import { Button } from '../Button/Button.js';
import { Dialog } from '../Dialog/Dialog.js';

function Confirm({ children, open, onOpenChange, onConfirm, onCancel, title = 'Confirm', confirmLabel = 'Confirm', cancelLabel = 'Cancel', trigger, disabled, confirmVariant = 'default', }) {
    const closedByConfirmRef = useRef(false);
    useEffect(() => {
        if (open) {
            closedByConfirmRef.current = false;
        }
    }, [open]);
    const handleOpenChange = useCallback((next) => {
        if (!next) {
            if (!closedByConfirmRef.current) {
                onCancel?.();
            }
            closedByConfirmRef.current = false;
        }
        onOpenChange(next);
    }, [onCancel, onOpenChange]);
    const handleConfirm = () => {
        closedByConfirmRef.current = true;
        onConfirm();
        handleOpenChange(false);
    };
    return (jsx(Dialog, { open: open, onOpenChange: handleOpenChange, disabled: disabled, trigger: trigger, title: title, width: "min(fit-content, calc(100vw - var(--p-4)))", content: children, footerAlignment: "between", footer: jsxs(Fragment, { children: [jsx(Button, { type: "button", variant: "outline", onClick: () => handleOpenChange(false), children: cancelLabel }), jsx(Button, { type: "button", variant: confirmVariant, onClick: handleConfirm, children: confirmLabel })] }) }));
}

export { Confirm };
