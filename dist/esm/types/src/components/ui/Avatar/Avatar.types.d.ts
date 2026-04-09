import { type ComponentProps } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
export interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
    size?: 'sm' | 'md' | 'lg';
}
export interface AvatarImageProps extends ComponentProps<typeof AvatarPrimitive.Image> {
}
export interface AvatarFallbackProps extends ComponentProps<typeof AvatarPrimitive.Fallback> {
}
