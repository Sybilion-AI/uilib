import { jsx } from 'react/jsx-runtime';
import S from './LegacyPlatformLink.styl.js';

function LegacyPlatformLink({ redirectPath, children, className, ...props }) {
    const apiDomain = 'https://api.sybilion.com';
    const legacyUrl = `${apiDomain}${redirectPath}`;
    return (jsx("a", { href: legacyUrl, className: className || S.link, ...props, children: children }));
}

export { LegacyPlatformLink };
