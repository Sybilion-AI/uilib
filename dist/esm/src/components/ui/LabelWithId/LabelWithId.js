import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './LabelWithId.styl.js';

function LabelWithId({ id, label, className }) {
    return (jsxs("span", { "data-slot": "label-with-id", className: cn(S.root, className), children: [String(id) !== '-1' && jsx("div", { className: S.id, children: id }), " ", label] }));
}

export { LabelWithId };
