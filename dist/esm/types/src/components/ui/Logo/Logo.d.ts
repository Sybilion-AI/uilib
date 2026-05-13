import type { LogoProps } from './Logo.types';
/**
 * Public URL for the Sybilion logo in standalone apps. Copy `@sybilion/uilib/logo.svg`
 * to `public/logo.svg` (Sybilion app template README documents postinstall copies).
 * Same path as the favicon `<link href>`.
 */
export declare const SYBILION_STANDALONE_LOGO_PUBLIC_URL: "/logo.svg";
export declare function Logo({ showText, size, className, ...props }: LogoProps): import("react/jsx-runtime").JSX.Element;
