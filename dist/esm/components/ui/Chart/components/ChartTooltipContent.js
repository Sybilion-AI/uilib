import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect, useMemo } from 'react';
import { useChart } from '../Chart.context.js';
import { getPayloadConfigFromPayload } from '../Chart.helpers.js';
import S from '../Chart.styl.js';
import { ChartTooltipItem } from './ChartTooltipItem.js';

function ChartTooltipContent({ active, className, indicator = 'dot', hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, payload, formatter, color, nameKey, labelKey, }) {
    const { config } = useChart();
    // Keep last tooltip data in state to maintain position when inactive
    const [lastTooltipData, setLastTooltipData] = useState(null);
    // Update last tooltip data when active
    useEffect(() => {
        // Clear lastTooltipData immediately if label changed (prevents stale data)
        // Only clear if label is explicitly provided and different (not undefined)
        if (lastTooltipData && label && lastTooltipData.label !== label) {
            setLastTooltipData(null);
        }
        if (active && payload?.length) {
            setLastTooltipData({
                active,
                payload: payload,
                label,
            });
        }
        // Don't clear lastTooltipData when mouse moves out - keep it for position maintenance
        // It will be cleared when label changes (above) or when new active data arrives
    }, [active, payload, label]);
    // Use last tooltip data if current is inactive, otherwise use current
    // lastTooltipData is already cleared in useEffect if label changed, so safe to use here
    active || (lastTooltipData?.active ?? false);
    const displayPayload = active && payload?.length
        ? payload
        : lastTooltipData?.payload;
    const displayLabel = active ? label : lastTooltipData?.label;
    const tooltipLabel = useMemo(() => {
        if (hideLabel || !displayPayload?.length) {
            return null;
        }
        const payloadArray = displayPayload;
        const [item] = payloadArray;
        const key = `${labelKey || item.dataKey || item.name || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const value = !labelKey && typeof displayLabel === 'string'
            ? config[displayLabel]?.label || displayLabel
            : itemConfig?.label;
        if (labelFormatter) {
            return (jsx("div", { className: cn('font-medium', labelClassName), children: labelFormatter(value, displayPayload) }));
        }
        if (!value) {
            return null;
        }
        return jsx("div", { className: cn('font-medium', labelClassName), children: value });
    }, [
        displayLabel,
        labelFormatter,
        displayPayload,
        hideLabel,
        labelClassName,
        config,
        labelKey,
    ]);
    // Don't return null - keep rendering last tooltip to maintain position
    if (!displayPayload?.length) {
        return null;
    }
    const nestLabel = displayPayload.length === 1 && indicator !== 'dot';
    return (jsxs("div", { className: cn(S.tooltipContainer, className), children: [!nestLabel ? tooltipLabel : null, jsx("div", { className: "grid gap-1.5", children: displayPayload
                    .filter(item => item.type !== 'none')
                    .map((item, index) => (jsx(ChartTooltipItem, { item: item, index: index, config: config, indicator: indicator, hideIndicator: hideIndicator, nestLabel: nestLabel, tooltipLabel: tooltipLabel, color: color, nameKey: nameKey, formatter: formatter }, item.dataKey || index))) })] }));
}

export { ChartTooltipContent };
