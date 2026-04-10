import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { createContext, useContext } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import S$1 from '../Toggle/Toggle.styl.js';
import { getDefaultContextValues, getContextValues } from './ToggleGroup.helpers.js';
import S from './ToggleGroup.styl.js';

const ToggleGroupContext = createContext(getDefaultContextValues());
function ToggleGroup({ className, variant, size, children, disabled, ...props }) {
    return (jsx(ToggleGroupPrimitive.Root, { "data-slot": "toggle-group", "data-disabled": disabled ? '' : undefined, className: cn(S.container, className), ...props, children: jsx(ToggleGroupContext.Provider, { value: { variant, size }, children: children }) }));
}
function ToggleGroupItem({ className, children, variant, size, ...props }) {
    const context = useContext(ToggleGroupContext);
    const { variant: contextVariant, size: contextSize } = getContextValues(context, variant, size);
    return (jsx(ToggleGroupPrimitive.Item, { "data-slot": "toggle-group-item", "data-variant": contextVariant, "data-size": contextSize, className: cn(S$1.toggle, S.item, S$1[`variant-${contextVariant}`], S$1[`size-${contextSize}`], className), ...props, children: children }));
}

export { ToggleGroup, ToggleGroupItem };
