import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as LabelPrimitive from '@radix-ui/react-label';
import S from './Label.styl.js';

function Label({ className, ...props }) {
    return (jsx(LabelPrimitive.Root, { "data-slot": "label", className: cn(S.root, className), ...props }));
}

export { Label };
