import type { ReactNode } from 'react';

import type { ButtonVariant } from '#uilib/components/ui/Button/Button.types';

export interface ConfirmProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  trigger?: ReactNode;
  disabled?: boolean;
  confirmVariant?: Extract<ButtonVariant, 'default' | 'destructive'>;
}
