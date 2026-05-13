import { jsx, jsxs } from 'react/jsx-runtime';
import S from './SybilionAuthHeadline.styl.js';

function SybilionAuthHeadline() {
    return (jsx("div", { className: S.root, children: jsxs("div", { className: S.headline, children: [jsxs("p", { className: S.headlineParagraph, children: [jsx("span", { children: "External volatility" }), jsx("span", {})] }), jsx("p", { className: S.headlineParagraph, children: "turned into" }), jsx("p", { className: S.headlineParagraph, children: jsx("span", { className: S.headlineCyan, children: "confident decisions" }) })] }) }));
}

export { SybilionAuthHeadline };
