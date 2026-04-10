import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './SectionHeader.styl.js';

function SectionHeader({ title, description, actions, className, withMargin = false, ...props }) {
    return (jsxs("div", { className: cn(S.root, withMargin && S.withMargin, className), ...props, children: [jsxs("div", { className: S.content, children: [jsx("h2", { className: S.title, children: title }), description && jsx("p", { className: S.description, children: description })] }), actions && jsx("div", { className: S.actions, children: actions })] }));
}

export { SectionHeader };
