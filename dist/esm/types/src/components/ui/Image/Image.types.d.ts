import type { ReactNode } from 'react';
export interface ImageProps extends Omit<React.ComponentProps<'img'>, 'src'> {
    url: string;
    fallback: ReactNode;
}
