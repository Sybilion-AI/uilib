import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { forwardRef } from 'react';
import { LineChart, Line } from 'recharts';
import { transformDataForChart, getStrokeColor } from './Sparkline.helpers.js';
import S from './Sparkline.styl.js';

const Sparkline = forwardRef(({ className, data, width = 100, height = 30, strokeWidth = 1, strokeColor = 'hsl(var(--foreground))', fillColor = 'hsl(var(--muted))', showValue = false, showEndDot = false, valueFormatter = value => value.toString(), ...props }, ref) => {
    if (!data || data.length === 0) {
        return (jsx("div", { ref: ref, className: cn(S.sparklineNoData, className), style: { width, height }, ...props, children: "No data" }));
    }
    const chartData = transformDataForChart(data);
    const finalStrokeColor = getStrokeColor(strokeColor);
    const dot = showEndDot
        ? (props) => {
            const { index, payload } = props;
            const isLastPoint = index === chartData.length - 1;
            if (!isLastPoint)
                return null;
            return (jsx("circle", { cx: props.cx, cy: props.cy, r: 3, fill: finalStrokeColor }));
        }
        : false;
    return (jsxs("div", { ref: ref, className: cn(S.sparklineContainer, className), ...props, children: [jsx(LineChart, { width: width, height: height, data: chartData, children: jsx(Line, { type: "monotone", dataKey: "value", stroke: finalStrokeColor, strokeWidth: strokeWidth, strokeDasharray: "2 2", dot: dot, activeDot: false }) }), showValue && (jsx("span", { className: cn(S.sparklineValue), children: valueFormatter(data[data.length - 1]) }))] }));
});
Sparkline.displayName = 'Sparkline';

export { Sparkline };
