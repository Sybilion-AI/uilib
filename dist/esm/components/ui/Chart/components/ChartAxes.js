import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { XAxis, Label, YAxis } from 'recharts';
import { generateRoundedYTicks, formatNumber, formatYAxisNumber } from '../tools/formatters.js';

function ChartAxes({ xAxisClassName, yAxisClassName, xAxisLabel, yAxisLabel, formatDate, 
// formatNumber = formatYAxisNumber,
xMin, xMax, yMin, yMax, autoScaleYAxis = false, }) {
    const tickColor = 'var(--muted-foreground)';
    // Generate rounded ticks to avoid duplicates when we have explicit domain
    const yTicks = useMemo(() => {
        if (yMin !== undefined && yMax !== undefined && !autoScaleYAxis) {
            const ticks = generateRoundedYTicks(yMin, yMax);
            const formatter = formatNumber || formatYAxisNumber;
            // Group ticks by formatted value and keep the one closest to its rounded value
            const ticksByFormatted = new Map();
            ticks.forEach(tick => {
                const formatted = formatter(tick);
                // Parse formatted value back to number to find the target rounded value
                const targetValue = parseFloat(formatted.replace(/[KM]$/, '')) || 0;
                const multiplier = formatted.endsWith('M')
                    ? 1000000
                    : formatted.endsWith('K')
                        ? 1000
                        : 1;
                const roundedTarget = targetValue * multiplier;
                const existing = ticksByFormatted.get(formatted);
                if (existing === undefined ||
                    Math.abs(tick - roundedTarget) < Math.abs(existing - roundedTarget)) {
                    ticksByFormatted.set(formatted, tick);
                }
            });
            return Array.from(ticksByFormatted.values()).sort((a, b) => a - b);
        }
        return undefined;
    }, [yMin, yMax, autoScaleYAxis, formatNumber]);
    // Determine Y-axis domain
    let yDomain;
    if (autoScaleYAxis) {
        yDomain = [
            (dataMin) => dataMin * 0.95,
            (dataMax) => dataMax * 1.05,
        ];
    }
    else if (yMin !== undefined && yMax !== undefined) {
        yDomain = [yMin, yMax];
    }
    return (jsxs(Fragment, { children: [jsx(XAxis, { className: xAxisClassName, dataKey: "date", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 32, tick: { fill: tickColor }, tickFormatter: value => formatDate(value), ...(xMin !== undefined &&
                    xMax !== undefined && { domain: [xMin, xMax] }), children: xAxisLabel && (jsx(Label, { value: xAxisLabel, position: "insideBottom", offset: -5 })) }), jsx(YAxis, { className: yAxisClassName, tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 32, tick: { fill: tickColor }, tickFormatter: formatNumber, ...(yDomain && { domain: yDomain }), ...(yTicks && { ticks: yTicks }), allowDataOverflow: !autoScaleYAxis, children: yAxisLabel && (jsx(Label, { value: yAxisLabel, angle: -90, position: "insideLeft" })) })] }));
}

export { ChartAxes };
