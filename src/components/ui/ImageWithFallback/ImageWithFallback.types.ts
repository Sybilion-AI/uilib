import type { ReactNode } from 'react';

export interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  url: string;
  fallback?: ReactNode;
}
