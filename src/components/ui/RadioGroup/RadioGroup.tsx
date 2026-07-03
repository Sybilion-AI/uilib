import cn from 'classnames';
import { createContext, useContext } from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import {
  getDefaultRadioGroupContextValues,
  getRadioGroupContextValues,
} from './RadioGroup.helpers';
import S from './RadioGroup.styl';
import type {
  RadioGroupContextValue,
  RadioGroupItemProps,
  RadioGroupProps,
} from './RadioGroup.types';

const RadioGroupContext = createContext<RadioGroupContextValue>(
  getDefaultRadioGroupContextValues(),
);

function RadioGroup({
  className,
  size = 'md',
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ size }}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn(S.groupRoot, className)}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({ className, size, ...props }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext);
  const resolvedSize = getRadioGroupContextValues(context, size);

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(S.radioRoot, S[`size-${resolvedSize}`], className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={S.radioIndicator}
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
