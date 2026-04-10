import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as React from 'react';
import S from './Input.styl.js';

const Input = React.forwardRef(({ className, type, size = 'md', variant = 'default', ...props }, ref) => {
    if (type === 'textarea') {
        return (jsx("textarea", { ref: ref, className: cn(S.root, S[`size-${size}`], S[`variant-${variant}`], className), ...props }));
    }
    return (jsx("input", { ref: ref, className: cn(S.root, S[`size-${size}`], S[`variant-${variant}`], className), type: type, ...props }));
});
Input.displayName = 'Input';

export { Input };
