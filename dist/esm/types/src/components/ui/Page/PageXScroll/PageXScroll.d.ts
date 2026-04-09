import { Scroll } from '@homecode/ui';
interface PageXScrollProps extends Omit<React.ComponentProps<typeof Scroll>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
    innerClassName?: string;
    scrollbarClassName?: string;
    fullWidth?: boolean;
}
export declare function PageXScroll({ children, className, innerClassName, scrollbarClassName, fullWidth, size, ...props }: PageXScrollProps): import("react/jsx-runtime").JSX.Element;
export {};
