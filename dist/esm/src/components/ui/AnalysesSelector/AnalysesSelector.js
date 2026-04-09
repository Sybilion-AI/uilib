import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useMemo, useEffect } from 'react';
import { AnalysisLineIcon } from '../AnalysisLineIcon/AnalysisLineIcon.js';
import { Badge } from '../Badge/Badge.js';
import { LabelWithId } from '../LabelWithId/LabelWithId.js';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select/Select.js';
import { TextShimmer } from '../TextShimmer/TextShimmer.js';
import { getLatestByUpdatedAt } from '../../../utils/analysisDate.js';
import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react';
import S from './AnalysesSelector.styl.js';

const isFailed = (item) => item.status?.toLowerCase() === 'fail';
const isDashedIcon = (item) => item.id !== -1;
const defaultIsAnalysisInProgress = (status) => ['pending', 'running', 'cancelling'].includes(status?.toLowerCase() ?? '');
function renderItemContent(item) {
    const failed = isFailed(item);
    if (failed) {
        return (jsx(Badge, { variant: "red", squared: true, children: "failed" }));
    }
    const color = item.color || 'var(--foreground)';
    return (jsx(AnalysisLineIcon, { color: color, variant: isDashedIcon(item) ? 'dashed' : 'solid' }));
}
function renderIcon(icon) {
    if (!icon)
        return null;
    if (typeof icon === 'string') {
        return jsx("img", { src: icon, alt: "", className: S.icon });
    }
    return jsx("span", { className: S.icon, children: icon });
}
function AnalysesSelector({ items, selectedIds, onItemToggle, inlineMode = false, placeholder, disabled, size = 'md', variant = 'default', darker = false, className, triggerProps, onFailedItemClick, showHistorical = true, enableToggleHidden = false, maxVisibleItems = 1, preventDeselection = false, hiddenSeries: hiddenSeriesProp = new Set(), onToggleSeries = () => { }, isAnalysisInProgress: isAnalysisInProgressProp = defaultIsAnalysisInProgress, }) {
    const historicalAutoSelectedRef = useRef(false);
    const hiddenSeries = hiddenSeriesProp;
    const toggleSeries = (analysisId) => {
        onToggleSeries(analysisId);
    };
    const latestAnalysisIds = useMemo(() => {
        const analysesOnly = items.filter(item => !isFailed(item) && !item.label?.includes('Manually adjusted'));
        return new Set(getLatestByUpdatedAt(analysesOnly, maxVisibleItems).map(i => i.id));
    }, [items, maxVisibleItems]);
    const selectedSet = useMemo(() => {
        if (selectedIds === undefined)
            return new Set();
        if (typeof selectedIds === 'number')
            return new Set([selectedIds]);
        return new Set(Array.isArray(selectedIds) ? selectedIds : Array.from(selectedIds));
    }, [selectedIds]);
    // In inlineMode, show Historical + selected analyses (limited by maxVisibleItems)
    const selectedItems = useMemo(() => {
        if (inlineMode) {
            const list = [];
            if (showHistorical) {
                list.push({
                    id: -1,
                    label: 'Historical',
                    dimmed: hiddenSeries.has('historical'),
                });
            }
            // Filter by selectedIds, exclude failed items and user series
            const analysesOnly = items.filter(item => selectedSet.has(item.id) &&
                !isFailed(item) &&
                !item.label?.includes('Manually adjusted'));
            // Limit to maxVisibleItems, preferring latest by updated_at
            const sorted = getLatestByUpdatedAt(analysesOnly, analysesOnly.length);
            const limited = sorted.slice(0, maxVisibleItems);
            const limitedItems = limited.map(item => ({
                ...item,
                dimmed: hiddenSeries.has(`forecast_${item.id}`),
            }));
            return list.concat(limitedItems);
        }
        // Non-inlineMode: keep original behavior
        const list = [];
        if (showHistorical) {
            list.push({
                id: -1,
                label: 'Historical',
            });
        }
        return list.concat(items.filter(item => selectedSet.has(item.id)));
    }, [
        items,
        selectedSet,
        showHistorical,
        inlineMode,
        hiddenSeries,
        maxVisibleItems,
    ]);
    const unselectedItems = useMemo(() => {
        if (inlineMode) {
            if (preventDeselection) {
                // When preventDeselection is true, show items beyond maxVisibleItems in dropdown
                // even though they're selected
                const analysesOnly = items.filter(item => selectedSet.has(item.id) &&
                    !isFailed(item) &&
                    !item.label?.includes('Manually adjusted'));
                const sorted = getLatestByUpdatedAt(analysesOnly, analysesOnly.length);
                const visibleItems = sorted.slice(0, maxVisibleItems);
                const visibleIds = new Set(visibleItems.map(item => item.id));
                return items.filter(item => selectedSet.has(item.id) && !visibleIds.has(item.id));
            }
            // In inlineMode, show items that are not selected
            return items.filter(item => !selectedSet.has(item.id));
        }
        // Non-inlineMode: show items that are not in latestAnalysisIds
        return items.filter(item => !latestAnalysisIds.has(item.id));
    }, [
        items,
        latestAnalysisIds,
        selectedSet,
        inlineMode,
        preventDeselection,
        maxVisibleItems,
    ]);
    useEffect(() => {
        if (!showHistorical) {
            historicalAutoSelectedRef.current = false;
            return;
        }
        const isSelected = selectedIds === undefined
            ? false
            : typeof selectedIds === 'number'
                ? selectedIds === -1
                : Array.isArray(selectedIds)
                    ? selectedIds.includes(-1)
                    : selectedIds.has(-1);
        if (!historicalAutoSelectedRef.current && !isSelected) {
            historicalAutoSelectedRef.current = true;
            onItemToggle(-1);
        }
    }, [showHistorical, selectedIds, onItemToggle]);
    const handleSelectValue = (value) => {
        if (!value)
            return;
        const id = /^-?\d+$/.test(value) ? parseInt(value, 10) : value;
        const item = items.find(i => i.id === id || String(i.id) === value);
        if (!item)
            return;
        // Use handleItemClick to properly handle both selection and visibility toggling
        handleItemClick(item);
    };
    const handleItemClick = (item) => {
        if (isFailed(item) && onFailedItemClick) {
            onFailedItemClick(item.id);
        }
        else if (preventDeselection || (inlineMode && enableToggleHidden)) {
            // When preventDeselection is true, or in inlineMode with enableToggleHidden,
            // toggle hidden series instead of selection
            toggleSeries(item.id);
        }
        else {
            // Non-inlineMode: keep original behavior
            onItemToggle(item.id);
        }
    };
    const selectPlaceholder = placeholder ??
        (inlineMode ? `+ ${unselectedItems.length}` : `${items.length} analyses`);
    const renderEyeIcon = (item) => {
        if (!enableToggleHidden && !preventDeselection)
            return null;
        return hiddenSeries.has(`forecast_${item.id}`) ? (jsx(EyeClosedIcon, {})) : (jsx(EyeIcon, {}));
    };
    const renderLabelWithId = (item) => (jsx(LabelWithId, { className: cn(S.label, S.itemLabelWithId), id: String(item.id), label: isAnalysisInProgressProp(item.status) ? (jsx(TextShimmer, { as: "span", children: item.label })) : (item.label) }));
    const renderSelectItem = (item) => (jsxs("div", { className: S.selectItemContent, children: [renderItemContent(item), renderIcon(item.icon), renderLabelWithId(item), renderEyeIcon(item)] }));
    if (inlineMode) {
        return (jsxs("div", { className: cn(S.root, S[`variant-${variant}`], selectedItems.length === 1 && S.single, className), children: [selectedItems.map(item => (jsxs("div", { className: cn(S.item, disabled && S.disabled, item.id === -1 && S.historical, item.dimmed && S.dimmed), onClick: () => !disabled && handleItemClick(item), children: [renderIcon(item.icon), renderItemContent(item), renderLabelWithId(item)] }, item.id))), unselectedItems.length > 0 && (jsxs(Select, { value: "", onValueChange: handleSelectValue, disabled: disabled, children: [jsx(SelectTrigger, { size: size, variant: variant, className: S.selectTrigger, darker: darker, style: {
                                minWidth: 'auto',
                                height: 'auto',
                                fontSize: 'var(--text-xs)',
                                pointerEvents: items.length < 2 ? 'none' : undefined,
                            }, children: jsx(SelectValue, { placeholder: selectPlaceholder }) }), jsx(SelectContent, { children: unselectedItems.map(item => (jsx(SelectItem, { value: String(item.id), children: renderSelectItem(item) }, item.id))) })] }))] }));
    }
    if (items.length === 0)
        return null;
    const selectedId = items.find(item => selectedSet.has(item.id))?.id ?? items[0]?.id;
    const selectValue = selectedId != null ? String(selectedId) : '';
    return (jsx("div", { className: cn(S.root, className), children: jsxs(Select, { value: selectValue, onValueChange: handleSelectValue, disabled: disabled, children: [jsx(SelectTrigger, { size: size, variant: variant, darker: darker, className: S.selectTrigger, hideChevron: items.length < 2, style: {
                        minWidth: 'auto',
                        height: 'auto',
                        fontSize: 'var(--text-xs)',
                        pointerEvents: items.length < 2 ? 'none' : undefined,
                    }, ...triggerProps, children: jsx(SelectValue, { placeholder: selectPlaceholder }) }), jsx(SelectContent, { children: items.map(item => (jsx(SelectItem, { value: String(item.id), selected: String(item.id) === selectValue, children: renderSelectItem(item) }, item.id))) })] }) }));
}

export { AnalysesSelector };
