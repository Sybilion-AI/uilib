import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button.js';
import S from './NumberControl.styl.js';

function NumberControl({ className, value = 1, onChange, min, max, step = 0.1, ...props }) {
    const round = (v) => (v ? Number(v.toFixed(2)) : 0);
    const handleMinus = () => {
        const newValue = round(value - step);
        if (min === undefined || newValue >= min) {
            onChange(newValue);
        }
    };
    const handlePlus = () => {
        const newValue = round(value + step);
        if (max === undefined || newValue <= max) {
            onChange(newValue);
        }
    };
    const isMinDisabled = min !== undefined && value <= min;
    const isMaxDisabled = max !== undefined && value >= max;
    return (jsxs("div", { className: cn(S.root, className), ...props, children: [jsx(Button, { variant: "ghost", size: "sm", onClick: handleMinus, disabled: isMinDisabled, children: jsx(MinusIcon, { size: 16 }) }), jsx("span", { className: S.value, children: value }), jsx(Button, { variant: "ghost", size: "sm", onClick: handlePlus, disabled: isMaxDisabled, children: jsx(PlusIcon, { size: 16 }) })] }));
}

export { NumberControl };
