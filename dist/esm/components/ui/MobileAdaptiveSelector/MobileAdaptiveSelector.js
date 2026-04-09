import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile.js';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select/Select.js';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup.js';
import S from './MobileAdaptiveSelector.styl.js';

function MobileAdaptiveSelector({ value, onChange, items, placeholder = 'Select option', disabled = false, className, size = 'md', variant = 'default', darker = false, isDropdown = useIsMobile() || items.length > 4, ...props }) {
    const handleToggleGroupChange = useCallback((newValue) => {
        if (newValue) {
            onChange(newValue);
        }
    }, [onChange]);
    const handleSelectChange = useCallback((newValue) => {
        onChange(newValue);
    }, [onChange]);
    const renderItem = (item) => (jsxs(Fragment, { children: [item.icon && (jsx("img", { src: item.icon, alt: item.label, className: S.selectItemIcon })), item.label] }));
    const hasSingleItem = items.length === 1;
    return (jsx("div", { className: cn(S.root, className), ...props, children: isDropdown ? (jsxs(Select, { value: String(value), onValueChange: handleSelectChange, disabled: disabled, children: [jsx(SelectTrigger, { className: cn(S.selectTrigger, hasSingleItem && S.disabledSelect), size: size, variant: variant, "aria-label": placeholder, "data-state": isDropdown ? 'open' : 'closed', disabled: disabled, darker: darker, hideChevron: hasSingleItem, children: jsx(SelectValue, { placeholder: placeholder }) }), jsx(SelectContent, { className: S.selectContent, children: items.map(item => (jsx(SelectItem, { value: String(item.value), selected: item.value === value, className: S.selectItem, children: renderItem(item) }, item.value))) })] })) : (jsx(ToggleGroup, { type: "single", size: size, value: String(value), onValueChange: handleToggleGroupChange, variant: "outline", className: S.toggleGroupDesktop, disabled: disabled, children: items.map(item => (jsx(ToggleGroupItem, { value: String(item.value), disabled: disabled, title: item.value.toString(), children: renderItem(item) }, item.value))) })) }));
}

export { MobileAdaptiveSelector };
