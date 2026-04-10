import { jsx, jsxs } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';
import { GlobeIcon, MailIcon } from 'lucide-react';
import LogoSvg from '../../../../../assets/logo.svg.js';
import S from './PageFooter.styl.js';

function PageFooter({ children, versionLink, versionLabel, homeTo = '/', brandText = 'Sybilion', websiteHref = 'https://sybilion.com', mailHref = 'mailto:support@sybilion.com', copyrightText = '© 2026 Sybilion. All rights reserved.', }) {
    return (jsx("footer", { className: S.root, children: jsxs("div", { className: S.line, children: [jsxs("div", { className: S.logo, children: [jsxs(Link, { to: homeTo, children: [jsx(LogoSvg, {}), "\u00A0", brandText] }), versionLink !== '' && (jsx("div", { className: S.version, children: jsx(Link, { to: versionLink, className: S.versionLink, children: versionLabel }) }))] }), children, jsxs("div", { className: S.copyright, children: [copyrightText, jsx(Link, { to: websiteHref, target: "_blank", rel: "noreferrer", "aria-label": "Visit Sybilion website", children: jsx(GlobeIcon, {}) }), jsx("a", { href: mailHref, "aria-label": "Contact support via email", children: jsx(MailIcon, {}) })] })] }) }));
}

export { PageFooter };
