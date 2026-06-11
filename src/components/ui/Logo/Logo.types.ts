import { HTMLAttributes } from 'react';

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  // Optional props
  showText?: boolean;
  brandText?: string;
  size?: 'sm' | 'md' | 'lg';

  // Style-related props
  className?: string;
}

export type LogoSize = 'sm' | 'md' | 'lg';
