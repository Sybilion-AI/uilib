import type { ReactNode } from 'react';
export interface PageMainContentProps {
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
    footer?: ReactNode;
}
/** Main column wrapper for sidebar + inset layouts (footer shares column width). */
export declare function PageMainContent({ className, bodyClassName, children, footer, }: PageMainContentProps): import("react/jsx-runtime").JSX.Element;
