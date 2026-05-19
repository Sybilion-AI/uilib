import { jsxs, jsx } from 'react/jsx-runtime';
import { LinkIcon } from 'lucide-react';
import S from './InteractiveContent.styl.js';

function displayUrlForAutolink(display) {
    if (display.startsWith('https://'))
        return display.slice(8);
    if (display.startsWith('http://'))
        return display.slice(7);
    return display;
}
function shouldRenderAutolinkPill(label, href) {
    const normalizedLabel = label.trim();
    const normalizedHref = href.trim();
    if (!normalizedLabel || !normalizedHref)
        return false;
    const labelAsHref = normalizeWwwToHttps(normalizedLabel);
    if (labelAsHref === normalizedHref)
        return true;
    return (/^https?:\/\//i.test(normalizedLabel) ||
        /^www\./i.test(normalizedLabel) ||
        normalizedLabel === displayUrlForAutolink(normalizedHref));
}
const normalizeWwwToHttps = (raw) => {
    const t = raw.trim();
    if (/^www\./i.test(t))
        return `https://${t}`;
    return t;
};
function AutolinkUrl({ href, display, target, rel }) {
    return (jsxs("a", { href: href, target: target, rel: rel, className: S.autolinkUrl, children: [jsx(LinkIcon, { size: 12, "aria-hidden": true, className: S.autolinkUrlIcon }), jsx("span", { className: S.autolinkUrlLabel, title: displayUrlForAutolink(display), children: displayUrlForAutolink(display) })] }));
}

export { AutolinkUrl, S as autolinkStyles, displayUrlForAutolink, shouldRenderAutolinkPill };
