import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';
import { CheckIcon } from '@phosphor-icons/react';
import S from './LabeledInput.styl.js';

const LabeledInput = ({ label, id, type, name, value, onChange, placeholder = '', size = 'md', showCheckmark = false, disabled = false, }) => {
    return (jsxs("div", { className: cn(S.root, S[`size-${size}`]), children: [jsx(Label, { htmlFor: id, className: S.label, children: label }), jsxs("div", { className: S.inputWrapper, children: [jsx(Input, { className: S.input, id: id, type: type, size: size, name: name, value: value, onChange: onChange, placeholder: placeholder, disabled: disabled }), showCheckmark && jsx(CheckIcon, { className: S.checkmark, weight: "bold" })] })] }));
};

export { LabeledInput };
