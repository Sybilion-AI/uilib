import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends React.ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  size?: CheckboxSize;
}
