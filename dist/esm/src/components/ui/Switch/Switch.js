import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import S from './Switch.styl.js';

function Switch({ className, checked, onCheckedChange, size = 'md', ...props }) {
    const handleCheckedChange = (checkedValue) => {
        // Radix Switch always returns boolean, ensure we pass it correctly
        onCheckedChange?.(checkedValue);
    };
    // Ensure checked is always a boolean (never undefined/null/indeterminate)
    // Default to false if undefined/null to ensure controlled component behavior
    // const checkedValue = checked === true || checked === false ? checked : false;
    return (jsx(SwitchPrimitive.Root, { "data-slot": "switch", className: cn(S.switchRoot, S[`size-${size}`], className), checked: checked, onCheckedChange: handleCheckedChange, ...props, children: jsx(SwitchPrimitive.Thumb, { "data-slot": "switch-thumb", className: S.switchThumb }) }));
}

export { Switch };
