import { type ComponentProps } from 'react';
export interface BadgeProps extends ComponentProps<'div'> {
    variant?: 'default' | 'outline' | 'red' | 'green' | 'yellow';
    squared?: boolean;
    asChild?: boolean;
}
