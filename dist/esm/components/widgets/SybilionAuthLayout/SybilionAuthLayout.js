import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Logo } from '../../ui/Logo/Logo.js';
import { SybilionAuthHeadline } from './SybilionAuthHeadline.js';
import S from './SybilionAuthLayout.styl.js';

/** Same convention as {@link SYBILION_STANDALONE_LOGO_PUBLIC_URL}: copy `sybilion-bg.svg` from the package into `public/`. */
const SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL = '/sybilion_bg.svg';
function SybilionAuthLayout({ title, subtitle, children, logoSize, containerClassName, heroBackgroundUrl = SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL, }) {
    const bg = heroBackgroundUrl
        ? `url(${JSON.stringify(heroBackgroundUrl)})`
        : 'none';
    return (jsxs("div", { className: S.root, children: [jsxs("div", { className: S.leftPanel, children: [jsx("div", { className: S.bgImage, style: { backgroundImage: bg }, "aria-hidden": true }), jsx("div", { className: S.logoContainer, children: jsx(Logo, { className: S.logo, size: logoSize }) }), jsx(SybilionAuthHeadline, {})] }), jsx("div", { className: S.rightPanel, children: jsxs("div", { className: cn(S.formContainer, containerClassName), children: [jsxs("div", { className: S.header, children: [jsx("h1", { className: S.title, children: title }), subtitle && jsx("p", { className: S.subtitle, children: subtitle })] }), children] }) })] }));
}

export { SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL, SybilionAuthLayout };
