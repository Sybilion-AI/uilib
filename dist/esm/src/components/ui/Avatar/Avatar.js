import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import S from './Avatar.styl.js';

function Avatar({ className, size = 'md', ...props }) {
    return (jsx(AvatarPrimitive.Root, { "data-slot": "avatar", ...props, className: cn(S.root, S[`size-${size}`], className) }));
}
function AvatarImage({ className, ...props }) {
    return (jsx(AvatarPrimitive.Image, { "data-slot": "avatar-image", className: cn(S.image, className), ...props }));
}
function AvatarFallback({ className, ...props }) {
    return (jsx(AvatarPrimitive.Fallback, { "data-slot": "avatar-fallback", className: cn(S.fallback, className), ...props }));
}

export { Avatar, AvatarFallback, AvatarImage };
