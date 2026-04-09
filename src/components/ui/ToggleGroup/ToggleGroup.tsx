import cn from 'classnames';
import { createContext, useContext } from 'react';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

import toggleStyles from '../Toggle/Toggle.styl';
import {
  getContextValues,
  getDefaultContextValues,
} from './ToggleGroup.helpers';
import S from './ToggleGroup.styl';
import {
  ToggleGroupContextValue,
  ToggleGroupItemProps,
  ToggleGroupProps,
} from './ToggleGroup.types';

const ToggleGroupContext = createContext<ToggleGroupContextValue>(
  getDefaultContextValues(),
);

function ToggleGroup({
  className,
  variant,
  size,
  children,
  disabled,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-disabled={disabled ? '' : undefined}
      className={cn(S.container, className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const { variant: contextVariant, size: contextSize } = getContextValues(
    context,
    variant,
    size,
  );

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={contextVariant}
      data-size={contextSize}
      className={cn(
        toggleStyles.toggle,
        S.item,
        toggleStyles[`variant-${contextVariant}`],
        toggleStyles[`size-${contextSize}`],
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
