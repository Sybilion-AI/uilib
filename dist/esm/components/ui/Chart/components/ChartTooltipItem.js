import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { getPayloadConfigFromPayload } from '../Chart.helpers.js';
import S from '../Chart.styl.js';

function ChartTooltipItem({ item, index, config, indicator, hideIndicator, nestLabel, tooltipLabel, color, nameKey, formatter, }) {
    const key = `${nameKey || item.name || item.dataKey || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const payloadFill = item.payload &&
        typeof item.payload === 'object' &&
        'fill' in item.payload &&
        typeof item.payload.fill === 'string'
        ? item.payload.fill
        : undefined;
    const indicatorColor = color || payloadFill || item.color;
    return (jsx("div", { className: cn(S.tooltipItem, indicator === 'dot' && 'items-center'), children: formatter && item?.value !== undefined && item.name ? (formatter(item.value, item.name, item, index, item.payload)) : (jsxs(Fragment, { children: [itemConfig?.icon ? (jsx(itemConfig.icon, {})) : (!hideIndicator && (jsx("div", { className: cn(S.tooltipIndicator, S[`indicator-${indicator}`], nestLabel && S.nested), style: {
                        '--color-bg': indicatorColor,
                        '--color-border': indicatorColor,
                    } }))), jsxs("div", { className: cn(S.tooltipContent, nestLabel ? 'items-end' : 'items-center'), children: [jsxs("div", { className: S.tooltipLabel, children: [nestLabel ? tooltipLabel : null, jsx("span", { className: cn('text-muted-foreground', S.tooltipLabelText), children: itemConfig?.label || item.name })] }), item.value && (jsx("span", { className: S.tooltipValue, children: Array.isArray(item.value)
                                ? `${item.value[0].toLocaleString(undefined, { maximumFractionDigits: 20 })} – ${item.value[1].toLocaleString(undefined, { maximumFractionDigits: 20 })}`
                                : item.value.toLocaleString(undefined, {
                                    maximumFractionDigits: 20,
                                }) }))] })] })) }, item.dataKey));
}

export { ChartTooltipItem };
