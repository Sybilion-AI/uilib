import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '../Button/Button.js';
import { Input } from '../Input/Input.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip.js';
import { useIsMobile } from '../../../hooks/useIsMobile.js';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import S from './Renamer.styl.js';

function Renamer({ value = '', onInput, onChange, children, className, placeholder = 'Name', size = 'md', round = false, }) {
    const isMobile = useIsMobile();
    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState(value);
    const onKeyDown = useCallback((e) => {
        const stopAndExit = (v) => {
            e.preventDefault();
            e.stopPropagation();
            setIsRenaming(false);
            setName(v);
        };
        if (e.key === 'Enter' && name.trim()) {
            stopAndExit(name.trim());
            onChange(name.trim());
        }
        if (e.key === 'Escape')
            stopAndExit(value);
    }, [name, onChange, value]);
    useEffect(() => {
        setName(value);
    }, [value]);
    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        setName(newValue);
        onInput?.(newValue);
    }, [onInput]);
    const handleBlur = useCallback(() => {
        if (name.trim() && name.trim() !== value) {
            onChange(name.trim());
        }
        setIsRenaming(false);
        setName(value);
    }, [name, value, onChange]);
    const handleEditClick = useCallback(() => {
        setName(value);
        setIsRenaming(true);
    }, [value]);
    const sizeMap = {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
    };
    const buttonSizeMap = {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
    };
    return (jsx("div", { className: cn(S.root, !value && S.empty, className), onKeyDown: onKeyDown, children: isRenaming ? (jsx(Input, { className: S.input, autoFocus: !isMobile, variant: "clean", size: sizeMap[size], placeholder: placeholder, value: name, onChange: handleInputChange, onBlur: handleBlur, onKeyDown: onKeyDown })) : (jsxs(Fragment, { children: [jsx("span", { className: S.value, children: children }), jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: jsx(Button, { className: S.button, variant: "ghost", onClick: handleEditClick, size: buttonSizeMap[size], type: "button", children: jsx(PencilSimpleIcon, { size: 16 }) }) }), jsx(TooltipContent, { side: "bottom", children: "Rename" })] })] })) }));
}

export { Renamer };
