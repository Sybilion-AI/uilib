import { jsxs, jsx } from 'react/jsx-runtime';
import S from './AnalysisLineIcon.styl.js';

function DashedLine({ color }) {
    return (jsx("svg", { className: S.line, width: 18, height: 2, viewBox: "0 0 18 2", fill: "currentColor", style: { color }, children: jsx("line", { x1: 0, y1: 1, x2: 18, y2: 1, stroke: "currentColor", strokeWidth: 2, strokeDasharray: "3 3" }) }));
}
function AnalysisLineIcon({ color = 'var(--foreground)', variant, }) {
    return (jsxs("div", { className: S.lineIcon, children: [variant === 'dashed' ? (jsx(DashedLine, { color: color })) : (jsx("div", { className: S.line, style: { backgroundColor: color } })), jsx("div", { className: S.dot, style: { backgroundColor: color } })] }));
}

export { AnalysisLineIcon };
