import type { ReactNode } from 'react';
import type { LogoSize } from '#uilib/components/ui/Logo/Logo.types';
/** Same convention as {@link SYBILION_STANDALONE_LOGO_PUBLIC_URL}: copy `sybilion-bg.svg` from the package into `public/`. */
export declare const SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL: "/sybilion_bg.svg";
export type SybilionAuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: ReactNode;
    logoSize?: LogoSize;
    containerClassName?: string;
    /** Public URL for the hero watermark SVG (default {@link SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL}). */
    heroBackgroundUrl?: string;
};
export declare function SybilionAuthLayout({ title, subtitle, children, logoSize, containerClassName, heroBackgroundUrl, }: SybilionAuthLayoutProps): import("react/jsx-runtime").JSX.Element;
