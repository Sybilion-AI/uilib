import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react';
import S from './PerformanceUnderChartLegend.styl.js';

function PerformanceUnderChartLegendRow({ label, lineColor, lineStyle = 'solid', hidden, onToggle, }) {
    return (jsxs("button", { type: "button", className: S.row, onClick: onToggle, children: [lineStyle === 'solid' ? (jsx("span", { className: S.swatch, style: { background: lineColor }, "aria-hidden": true })) : (jsx("span", { className: cn(S.swatch, S.swatchDashed), style: { color: lineColor }, "aria-hidden": true })), jsx("span", { className: S.label, children: label }), onToggle &&
                (hidden ? (jsx(EyeClosedIcon, { className: S.eye })) : (jsx(EyeIcon, { className: S.eye })))] }));
}
/** Renders rows from tab-agnostic config (labels + toggles supplied by parent). */
function PerformanceUnderChartLegendFromItems({ items, }) {
    if (items?.length === 0)
        return null;
    return (jsx(PerformanceUnderChartLegend, { children: items.map(item => (jsx(PerformanceUnderChartLegendRow, { label: item.label, lineColor: item.lineColor, lineStyle: item.lineStyle ?? 'solid', hidden: item.hidden, onToggle: item.onToggle }, item.id))) }));
}
function PerformanceUnderChartLegend({ children, }) {
    return jsx("div", { className: S.root, children: children });
}

export { PerformanceUnderChartLegend, PerformanceUnderChartLegendFromItems, PerformanceUnderChartLegendRow };
