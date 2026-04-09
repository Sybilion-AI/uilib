import { jsxs, jsx } from 'react/jsx-runtime';
import S from './ChatEmptyState.styl.js';

function ChatEmptyState() {
    return (jsxs("div", { className: S.root, children: [jsx("div", { className: S.icon }), jsx("h2", { children: "Chat with a forecast." }), jsx("p", { children: "Instantly get answers about the forecast\u2019s output and reasoning." })] }));
}

export { ChatEmptyState };
