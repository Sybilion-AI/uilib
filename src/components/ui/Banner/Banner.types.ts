import type { ComponentType, ReactNode } from 'react';

export interface BannerProps {
  children: ReactNode;
  icon?: ComponentType<{ className?: string; size?: number }> | false;
  onClose?: () => void;
  className?: string;
}
