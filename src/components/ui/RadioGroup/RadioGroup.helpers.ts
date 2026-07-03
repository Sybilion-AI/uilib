import { RadioGroupContextValue, RadioGroupSize } from './RadioGroup.types';

export const getRadioGroupContextValues = (
  context: RadioGroupContextValue,
  itemSize?: RadioGroupSize,
): RadioGroupSize => context.size || itemSize || 'md';

export const getDefaultRadioGroupContextValues =
  (): RadioGroupContextValue => ({
    size: 'md',
  });
