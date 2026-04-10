import { jsxs, jsx } from 'react/jsx-runtime';
import S from './PageEmptyCanvas.styl.js';

function PageEmptyCanvas({ title, hint, children, }) {
    return (jsxs("div", { className: S.root, children: [jsx("p", { className: S.title, children: title }), jsx("p", { className: S.hint, children: hint }), children] }));
}

export { PageEmptyCanvas };
