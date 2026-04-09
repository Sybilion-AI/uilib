export interface ToggleGroupContextValue {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

interface ToggleGroupBaseProps extends React.ComponentPropsWithoutRef<'div'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  rovingFocus?: boolean;
  disabled?: boolean;
  loop?: boolean;
}

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps =
  | ToggleGroupSingleProps
  | ToggleGroupMultipleProps;

export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<'button'> {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}
