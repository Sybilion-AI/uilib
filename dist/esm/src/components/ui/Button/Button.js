import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Slot } from '@radix-ui/react-slot';
import S from './Button.styl.js';

const sizeClass = (s) => s === 'sm' ? S.sizeSm : s === 'md' ? S.sizeMd : S.sizeLg;
function Button({ className, variant = 'default', size = 'md', icon = false, asChild = false, ...props }) {
    const Comp = asChild ? Slot : 'button';
    return (jsx(Comp, { "data-slot": "button", className: cn(S.root, S[variant], icon ? S.sizeIcon : sizeClass(size), className), ...props }));
}

export { Button };
