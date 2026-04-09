import * as SwitchPrimitive from '@radix-ui/react-switch';
export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
    size?: 'sm' | 'md' | 'lg';
}
