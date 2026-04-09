import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useChart } from '../Chart.context.js';
import S from '../Chart.styl.js';
import { ChartLegendItem } from './ChartLegendItem.js';

function ChartLegendContent({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey, }) {
    const { config } = useChart();
    if (!payload?.length) {
        return null;
    }
    return (jsx("div", { className: cn(S.legendContainer, verticalAlign === 'top' ? 'pb-3' : 'pt-3', className), children: payload
            .filter(item => item.type !== 'none')
            .map(item => (jsx(ChartLegendItem, { item: item, config: config, hideIcon: hideIcon, nameKey: nameKey }, item.value))) }));
}

export { ChartLegendContent };
