import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './PageMainContent.styl.js';

/** Main column wrapper for sidebar + inset layouts (footer shares column width). */
function PageMainContent({ className, bodyClassName, children, footer, }) {
    return (jsxs("div", { className: cn(S.root, className), children: [jsx("div", { className: cn(S.body, bodyClassName), children: children }), footer] }));
}

export { PageMainContent };
