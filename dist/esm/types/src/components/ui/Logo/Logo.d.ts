import type { LogoProps } from './Logo.types';
import LogoMarkSvg from './logo.svg';
export { LogoMarkSvg as LogoMark };
/**
 * Public URL for standalone apps. Copy `@sybilion/uilib/logo.svg` (Logo component asset)
 * to `public/logo.svg` (app template README documents postinstall copies).
 * Same path as the favicon `<link href>`.
 */
export declare const SYBILION_STANDALONE_LOGO_PUBLIC_URL: "/logo.svg";
export declare function Logo({ showText, size, className, ...props }: LogoProps): import("react/jsx-runtime").JSX.Element;
