import { jsx, jsxs } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';
import { GlobeIcon, MailIcon } from 'lucide-react';
import S from './PageFooter.styl.js';

function PageFooterLinkEl({ item }) {
    const { label, url, ariaLabel } = item;
    const openInNewTab = /^https?:\/\//i.test(url);
    return (jsx("a", { href: url, className: S.link, ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}), ...(openInNewTab ? { target: '_blank', rel: 'noreferrer' } : {}), children: label }));
}
function PageFooter({ children, versionLink, versionLabel, homeTo = '/', brandText = 'Sybilion', logo, websiteHref = 'https://sybilion.com', mailHref = 'mailto:support@sybilion.com', copyrightText = '© 2026 Sybilion. All rights reserved.', links: linksProp, }) {
    const resolvedLinks = linksProp !== undefined
        ? linksProp
        : [
            {
                id: 'website',
                label: jsx(GlobeIcon, { "aria-hidden": true }),
                url: websiteHref,
                ariaLabel: 'Visit Sybilion website',
            },
            {
                id: 'email',
                label: jsx(MailIcon, { "aria-hidden": true }),
                url: mailHref,
                ariaLabel: 'Contact support via email',
            },
        ];
    return (jsx("footer", { className: S.root, children: jsxs("div", { className: S.line, children: [jsxs("div", { className: S.logo, children: [jsxs(Link, { to: homeTo, children: [logo, "\u00A0", brandText] }), versionLink !== '' && (jsx("div", { className: S.version, children: jsx(Link, { to: versionLink, className: S.versionLink, children: versionLabel }) }))] }), children, jsxs("div", { className: S.meta, children: [jsx("div", { className: S.copyright, children: copyrightText }), resolvedLinks.length > 0 && (jsx("nav", { className: S.links, "aria-label": "Footer links", children: resolvedLinks.map(item => (jsx(PageFooterLinkEl, { item: item }, item.id))) }))] })] }) }));
}

export { PageFooter };
