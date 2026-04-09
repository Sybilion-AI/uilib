import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useId } from 'react';
import { ChartContext } from '../Chart.context.js';
import { THEMES } from '../Chart.types.js';
import * as RechartsPrimitive from 'recharts';
import S from '../Chart.styl.js';

function ChartContainer({ id, className, children, config, ...props }) {
    const uniqueId = useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
    return (jsx(ChartContext.Provider, { value: { config }, children: jsxs("div", { "data-slot": "chart", "data-chart": chartId, className: cn(S.chartContainer, className), ...props, children: [jsx(ChartStyle, { id: chartId, config: config }), jsx(RechartsPrimitive.ResponsiveContainer, { children: children })] }) }));
}
const ChartStyle = ({ id, config, }) => {
    const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);
    if (!colorConfig.length)
        return null;
    return (jsx("style", { children: Object.entries(THEMES).map(([theme, prefix]) => `
          ${prefix} [data-chart=${id}] {
            ${colorConfig
            .map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] ||
                itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
        })
            .join('\n')}
          }
        `) }));
};

export { ChartContainer, ChartStyle };
