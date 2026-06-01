import { CSSProperties, ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  disabled?: boolean;
  /** When true, the header close control is hidden. */
  disableCloseButton?: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trigger?: ReactNode;
  triggerClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  icon?: ReactNode;
  content?: ReactNode;
  contentClassName?: string;
  contentScrollbarClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  footerAlignment?: 'left' | 'center' | 'right' | 'between';
  size?: 'login' | 'wide' | 'default';
  className?: string;
  noScroll?: boolean;
  autoScrollBottom?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  width?: CSSProperties['width'];
}
