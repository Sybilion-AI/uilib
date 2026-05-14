import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './PageContent.styl.js';

function PageContent({ className, children, variant = 'default', }) {
    return (jsx("div", { className: cn(S.root, S[`variant-${variant}`], className), children: children }));
}
function PageContentSection({ className, children, grow = true, ...rest }) {
    return (jsx("div", { className: cn(S.section, className, grow && S.grow), ...rest, children: children }));
}

export { PageContent, PageContentSection };
