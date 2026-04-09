import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './Logo.styl.js';

function Logo({ showText = true, size = 'md', className, ...props }) {
    return (jsxs("div", { className: cn(S.root, S[size], className), ...props, children: [jsx("img", { src: "/logo.svg", alt: "Sybilion", className: S.icon }), showText && jsx("span", { className: S.text, children: "Sybilion" })] }));
}

export { Logo };
