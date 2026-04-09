export interface NumberControlProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}
