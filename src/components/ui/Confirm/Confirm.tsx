import { useCallback, useEffect, useRef } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Dialog } from '#uilib/components/ui/Dialog';

import type { ConfirmProps } from './Confirm.types';

export function Confirm({
  children,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = 'Confirm',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  trigger,
  disabled,
  confirmVariant = 'default',
}: ConfirmProps) {
  const closedByConfirmRef = useRef(false);

  useEffect(() => {
    if (open) {
      closedByConfirmRef.current = false;
    }
  }, [open]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        if (!closedByConfirmRef.current) {
          onCancel?.();
        }
        closedByConfirmRef.current = false;
      }
      onOpenChange(next);
    },
    [onCancel, onOpenChange],
  );

  const handleConfirm = () => {
    closedByConfirmRef.current = true;
    onConfirm();
    handleOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      trigger={trigger}
      title={title}
      width="min(fit-content, calc(100vw - var(--p-4)))"
      content={children}
      footerAlignment="between"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
