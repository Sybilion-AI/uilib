import cn from 'classnames';

import * as AvatarPrimitive from '@radix-ui/react-avatar';

import S from './Avatar.styl';
import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarProps,
} from './Avatar.types';

function Avatar({ className, size = 'md', ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      {...props}
      className={cn(S.root, S[`size-${size}`], className)}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(S.image, className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(S.fallback, className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
