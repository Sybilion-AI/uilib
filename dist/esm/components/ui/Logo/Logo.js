import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './Logo.styl.js';

/**
 * Public URL for the Sybilion logo in standalone apps. Copy `@sybilion/uilib/logo.svg`
 * to `public/logo.svg` (Sybilion app template README documents postinstall copies).
 * Same path as the favicon `<link href>`.
 */
const SYBILION_STANDALONE_LOGO_PUBLIC_URL = '/logo.svg';
function Logo({ showText = true, size = 'md', className, ...props }) {
    return (jsxs("div", { className: cn(S.root, S[size], className), ...props, children: [jsx("img", { src: SYBILION_STANDALONE_LOGO_PUBLIC_URL, alt: showText ? '' : 'Sybilion', className: S.icon, ...(showText ? { 'aria-hidden': true } : {}) }), showText && jsx("span", { className: S.text, children: "Sybilion" })] }));
}

export { Logo, SYBILION_STANDALONE_LOGO_PUBLIC_URL };
