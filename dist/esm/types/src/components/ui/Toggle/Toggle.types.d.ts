import type { ComponentProps } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
export interface ToggleProps extends ComponentProps<typeof TogglePrimitive.Root> {
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}
