import type { ReactNode } from 'react';
import type { LogoSize } from '#uilib/components/ui/Logo/Logo.types';
export type SybilionAuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: ReactNode;
    logoSize?: LogoSize;
    containerClassName?: string;
    style?: React.CSSProperties;
};
export declare function SybilionAuthLayout({ title, subtitle, children, logoSize, containerClassName, style, }: SybilionAuthLayoutProps): import("react/jsx-runtime").JSX.Element;
