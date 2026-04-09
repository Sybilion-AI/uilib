import * as SliderPrimitive from '@radix-ui/react-slider';

export interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {
  className?: string;
}
