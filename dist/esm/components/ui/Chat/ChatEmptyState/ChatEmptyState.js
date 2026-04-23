import { jsxs, jsx } from 'react/jsx-runtime';
import S from './ChatEmptyState.styl.js';

function ChatEmptyState({ icon, title, description, }) {
    return (jsxs("div", { className: S.root, children: [icon && jsx("div", { className: S.icon, children: icon }), title && jsx("h2", { children: title }), description && jsx("p", { children: description })] }));
}

export { ChatEmptyState };
