import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import S from './Toggle.styl.js';

function Toggle({ className, variant = 'default', size = 'md', ...props }) {
    return (jsx(TogglePrimitive.Root, { "data-slot": "toggle", className: cn(S.toggle, S[`variant-${variant}`], S[`size-${size}`], className), ...props }));
}

export { Toggle };
