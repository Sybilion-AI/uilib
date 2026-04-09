import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Slot } from '@radix-ui/react-slot';
import S from './Badge.styl.js';

function Badge({ className, variant = 'default', asChild = false, squared = false, ...props }) {
    const Comp = asChild ? Slot : 'div';
    return (jsx(Comp, { "data-slot": "badge", className: cn(S.root, variant && S[`variant-${variant}`], squared && S.squared, className), ...props }));
}

export { Badge };
