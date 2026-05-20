import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import LogoMarkSvg from './logo.svg.js';
import S from './Logo.styl.js';

function Logo({ showText = true, size = 'md', className, ...props }) {
    return (jsxs("div", { className: cn(S.root, S[size], className), ...props, children: [jsx(LogoMarkSvg, { className: S.icon, ...(showText
                    ? { 'aria-hidden': true }
                    : { 'aria-label': 'Sybilion', role: 'img' }) }), showText && jsx("span", { className: S.text, children: "Sybilion" })] }));
}

export { Logo, LogoMarkSvg as LogoMark };
