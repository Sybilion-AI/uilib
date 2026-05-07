import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo, useCallback } from 'react';
import { AnalysesSelector } from '../../../AnalysesSelector/AnalysesSelector.js';
import S from './CustomChartLegend.styl.js';

function extractIdFromDataKey(dataKey) {
    if (!dataKey)
        return undefined;
    const id = dataKey.startsWith('forecast_')
        ? dataKey.replace('forecast_', '')
        : dataKey;
    return /^\d+$/.test(id) ? parseInt(id, 10) : undefined;
}
/**
 * Custom chart legend using AnalysesSelector (inline mode)
 * Supports forecast icon indicator, failed badge, toggle visibility
 */
function CustomChartLegend({ payload, onClick, hiddenSeries, className, onAnalysisSelect, onFailedAnalysisClick, maxVisibleItems, preventDeselection = true, }) {
    const items = useMemo(() => (payload ?? []).map(p => ({
        id: extractIdFromDataKey(p.dataKey),
        label: p.value,
        color: p.color,
        status: p.status,
        icon: p.icon,
        updated_at: p.updated_at,
    })), [payload]);
    const selectedIds = useMemo(() => {
        if (preventDeselection) {
            // Always keep all items selected when preventDeselection is true
            // AnalysesSelector will show maxVisibleItems inline based on this
            return new Set(items.map(item => item.id));
        }
        return new Set(items
            .filter(item => {
            const dataKey = `forecast_${item.id}`;
            return !hiddenSeries?.has(dataKey);
        })
            .map(item => item.id));
    }, [items, hiddenSeries, preventDeselection]);
    const handleToggleSeriesVisibility = useCallback((analysisId) => {
        const dataKey = Number(analysisId) === -1 ? 'historical' : `forecast_${analysisId}`;
        const index = payload?.findIndex(p => p.dataKey === dataKey) ??
            payload?.findIndex(p => extractIdFromDataKey(p.dataKey) === Number(analysisId)) ??
            0;
        const payloadItem = payload?.[index];
        onClick?.({ dataKey, value: payloadItem?.value, ...payloadItem }, index, {});
    }, [onClick, payload]);
    const handleItemToggle = useCallback((id) => {
        const dataKey = `forecast_${id}`;
        const payloadItem = payload?.find(p => extractIdFromDataKey(p.dataKey) === id);
        const wasHidden = hiddenSeries?.has(dataKey);
        const index = payload?.findIndex(p => extractIdFromDataKey(p.dataKey) === id) ?? 0;
        onClick?.({ dataKey, value: payloadItem?.value, ...payloadItem }, index, {});
        if (wasHidden && onAnalysisSelect) {
            onAnalysisSelect(id);
        }
    }, [onClick, payload, hiddenSeries, onAnalysisSelect]);
    if (!items.length)
        return null;
    return (jsx("div", { className: cn(S.legendContainer, className), children: jsx(AnalysesSelector, { items: items, selectedIds: selectedIds, onItemToggle: handleItemToggle, inlineMode: true, size: "sm", variant: "clear", onFailedItemClick: onFailedAnalysisClick, enableToggleHidden: true, maxVisibleItems: maxVisibleItems, preventDeselection: preventDeselection, hiddenSeries: hiddenSeries ?? new Set(), onToggleSeries: handleToggleSeriesVisibility }) }));
}

export { CustomChartLegend };
