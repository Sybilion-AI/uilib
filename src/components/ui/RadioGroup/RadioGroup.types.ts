import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export type RadioGroupSize = 'sm' | 'md' | 'lg';

export interface RadioGroupContextValue {
  size?: RadioGroupSize;
}

export interface RadioGroupProps extends React.ComponentProps<
  typeof RadioGroupPrimitive.Root
> {
  size?: RadioGroupSize;
}

export interface RadioGroupItemProps extends React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> {
  size?: RadioGroupSize;
}
