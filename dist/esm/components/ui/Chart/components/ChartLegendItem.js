import { jsxs, jsx } from 'react/jsx-runtime';
import { getPayloadConfigFromPayload } from '../Chart.helpers.js';
import S from '../Chart.styl.js';

function ChartLegendItem({ item, config, hideIcon, nameKey, }) {
    const key = `${nameKey || item.dataKey || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    return (jsxs("div", { className: S.legendItem, children: [itemConfig?.icon && !hideIcon ? (jsx(itemConfig.icon, {})) : (jsx("div", { className: S.legendIndicator, style: {
                    backgroundColor: item.color,
                } })), itemConfig?.label] }, item.value));
}

export { ChartLegendItem };
