import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { CheckIcon } from '@phosphor-icons/react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import S from './Checkbox.styl.js';

function Checkbox({ className, ...props }) {
    return (jsx(CheckboxPrimitive.Root, { "data-slot": "checkbox", className: cn(S.checkboxRoot, className), ...props, children: jsx(CheckboxPrimitive.Indicator, { "data-slot": "checkbox-indicator", className: S.checkboxIndicator, children: jsx(CheckIcon, { className: "size-3.5" }) }) }));
}

export { Checkbox };
