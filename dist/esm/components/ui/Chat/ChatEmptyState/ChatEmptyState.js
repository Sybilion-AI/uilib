import { jsxs, jsx } from 'react/jsx-runtime';
import S from './ChatEmptyState.styl.js';
import SparklesIcon from './icons/sparkles.svg.js';

function ChatEmptyState({ icon = jsx(SparklesIcon, {}), title = 'Start a conversation', description, children, }) {
    return (jsxs("div", { className: S.root, children: [icon && jsx("div", { className: S.icon, children: icon }), title && jsx("h2", { children: title }), description && jsx("p", { children: description }), children] }));
}

export { ChatEmptyState };
