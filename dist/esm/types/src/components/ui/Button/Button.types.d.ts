export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    /** Square icon-only button (fixed width/height); use with `size` ignored for dimensions. */
    icon?: boolean;
    asChild?: boolean;
}
