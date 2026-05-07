import { type ComponentPropsWithoutRef } from 'react';
import type { ReactNode } from 'react';
export type AppShellProps = ComponentPropsWithoutRef<'div'>;
export interface AppShellMainContentProps {
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
}
/** Main column in app shell (grid cell + header / body / footer). */
export declare function AppShellMainContent({ className, bodyClassName, children, header, footer, }: AppShellMainContentProps): import("react/jsx-runtime").JSX.Element;
export declare const AppShell: import("react").ForwardRefExoticComponent<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
