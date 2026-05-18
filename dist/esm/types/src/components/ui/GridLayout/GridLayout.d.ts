import type { ElementType, ReactNode } from 'react';
export interface GridLayoutProps {
    children: ReactNode;
    colWidth?: number;
    gap?: string;
    className?: string;
    as?: ElementType;
}
export declare function GridLayout({ children, colWidth, gap, className, as: asProp, }: GridLayoutProps): import("react/jsx-runtime").JSX.Element;
