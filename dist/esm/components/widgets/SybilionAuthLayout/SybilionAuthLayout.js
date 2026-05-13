import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Logo } from '../../ui/Logo/Logo.js';
import { SybilionAuthHeadline } from './SybilionAuthHeadline.js';
import S from './SybilionAuthLayout.styl.js';

function SybilionAuthLayout({ title, subtitle, children, logoSize, containerClassName, style, }) {
    return (jsxs("div", { className: S.root, style: style, children: [jsxs("div", { className: S.leftPanel, children: [jsx(Logo, { showText: false, className: S.heroWatermark, "aria-hidden": true }), jsx("div", { className: S.logoContainer, children: jsx(Logo, { className: S.logo, size: logoSize }) }), jsx(SybilionAuthHeadline, {})] }), jsx("div", { className: S.rightPanel, children: jsxs("div", { className: cn(S.formContainer, containerClassName), children: [jsxs("div", { className: S.header, children: [jsx("h1", { className: S.title, children: title }), subtitle && jsx("p", { className: S.subtitle, children: subtitle })] }), children] }) })] }));
}

export { SybilionAuthLayout };
