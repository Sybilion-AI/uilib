import cn from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

import { AnalysisLineIcon } from '#uilib/components/ui/AnalysisLineIcon';
import { Badge } from '#uilib/components/ui/Badge';
import { Button } from '#uilib/components/ui/Button';
import { LabelWithId } from '#uilib/components/ui/LabelWithId';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';
import { TextShimmer } from '#uilib/components/ui/TextShimmer/TextShimmer';
import { getLatestByUpdatedAt } from '#uilib/utils/analysisDate';
import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react';

import S from './AnalysesSelector.styl';
import type {
  AnalysesSelectorItem,
  AnalysesSelectorProps,
} from './AnalysesSelector.types';

const isFailed = (item: AnalysesSelectorItem) =>
  item.status?.toLowerCase() === 'fail';

const isDashedIcon = (item: AnalysesSelectorItem) => item.id !== -1;

const defaultIsAnalysisInProgress = (status?: string) =>
  ['pending', 'running', 'cancelling'].includes(status?.toLowerCase() ?? '');

function renderItemContent(item: AnalysesSelectorItem) {
  const failed = isFailed(item);

  if (failed) {
    return (
      <Badge variant="red" squared>
        failed
      </Badge>
    );
  }

  const color = item.color || 'var(--foreground)';

  return (
    <AnalysisLineIcon
      color={color}
      variant={isDashedIcon(item) ? 'dashed' : 'solid'}
    />
  );
}

function renderIcon(icon: AnalysesSelectorItem['icon']) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <img src={icon} alt="" className={S.icon} />;
  }
  return <span className={S.icon}>{icon}</span>;
}

export function AnalysesSelector({
  items,
  selectedIds,
  onItemToggle,
  inlineMode = false,
  placeholder,
  disabled,
  size = 'md',
  variant = 'default',
  darker = false,
  className,
  triggerProps,
  onFailedItemClick,
  showHistorical = true,
  enableToggleHidden = false,
  maxVisibleItems = 1,
  preventDeselection = false,
  hiddenSeries: hiddenSeriesProp = new Set(),
  onToggleSeries = () => {},
  isAnalysisInProgress: isAnalysisInProgressProp = defaultIsAnalysisInProgress,
}: AnalysesSelectorProps) {
  const historicalAutoSelectedRef = useRef(false);
  const hiddenSeries = hiddenSeriesProp;

  const toggleSeries = (analysisId: number | string) => {
    onToggleSeries(analysisId);
  };

  const latestAnalysisIds = useMemo(() => {
    const analysesOnly = items.filter(
      item => !isFailed(item) && !item.label?.includes('Manually adjusted'),
    );
    return new Set(
      getLatestByUpdatedAt(analysesOnly, maxVisibleItems).map(i => i.id),
    );
  }, [items, maxVisibleItems]);

  const selectedSet = useMemo(() => {
    if (selectedIds === undefined) return new Set<number>();
    if (typeof selectedIds === 'number') return new Set([selectedIds]);
    return new Set(
      Array.isArray(selectedIds) ? selectedIds : Array.from(selectedIds),
    );
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
      const analysesOnly = items.filter(
        item =>
          selectedSet.has(item.id) &&
          !isFailed(item) &&
          !item.label?.includes('Manually adjusted'),
      );
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
        const analysesOnly = items.filter(
          item =>
            selectedSet.has(item.id) &&
            !isFailed(item) &&
            !item.label?.includes('Manually adjusted'),
        );
        const sorted = getLatestByUpdatedAt(analysesOnly, analysesOnly.length);
        const visibleItems = sorted.slice(0, maxVisibleItems);
        const visibleIds = new Set(visibleItems.map(item => item.id));

        return items.filter(
          item => selectedSet.has(item.id) && !visibleIds.has(item.id),
        );
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
    const isSelected =
      selectedIds === undefined
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

  const handleSelectValue = (value: string) => {
    if (!value) return;
    const id = /^-?\d+$/.test(value) ? parseInt(value, 10) : value;
    const item = items.find(i => i.id === id || String(i.id) === value);
    if (!item) return;
    // Use handleItemClick to properly handle both selection and visibility toggling
    handleItemClick(item);
  };

  const handleItemClick = (item: AnalysesSelectorItem) => {
    if (isFailed(item) && onFailedItemClick) {
      onFailedItemClick(item.id);
    } else if (preventDeselection || (inlineMode && enableToggleHidden)) {
      // When preventDeselection is true, or in inlineMode with enableToggleHidden,
      // toggle hidden series instead of selection
      toggleSeries(item.id);
    } else {
      // Non-inlineMode: keep original behavior
      onItemToggle(item.id);
    }
  };

  const selectPlaceholder =
    placeholder ??
    (inlineMode ? `+ ${unselectedItems.length}` : `${items.length} analyses`);

  const renderEyeIcon = (item: AnalysesSelectorItem) => {
    if (!enableToggleHidden && !preventDeselection) return null;
    return hiddenSeries.has(`forecast_${item.id}`) ? (
      <EyeClosedIcon />
    ) : (
      <EyeIcon />
    );
  };

  const renderLabelWithId = (item: AnalysesSelectorItem) => (
    <LabelWithId
      className={cn(S.label, S.itemLabelWithId)}
      id={String(item.id)}
      label={
        isAnalysisInProgressProp(item.status) ? (
          <TextShimmer as="span">{item.label}</TextShimmer>
        ) : (
          item.label
        )
      }
    />
  );

  const renderSelectItem = (item: AnalysesSelectorItem) => (
    <div className={S.selectItemContent}>
      {renderItemContent(item)}
      {renderIcon(item.icon)}
      {renderLabelWithId(item)}
      {renderEyeIcon(item)}
    </div>
  );

  if (inlineMode) {
    return (
      <div
        className={cn(
          S.root,
          S[`variant-${variant}`],
          selectedItems.length === 1 && S.single,
          className,
        )}
      >
        {selectedItems.map(item => (
          <div
            key={item.id}
            className={cn(
              S.item,
              disabled && S.disabled,
              item.id === -1 && S.historical,
              item.dimmed && S.dimmed,
            )}
            onClick={() => !disabled && handleItemClick(item)}
          >
            {renderIcon(item.icon)}
            {renderItemContent(item)}
            {renderLabelWithId(item)}
          </div>
        ))}
        {unselectedItems.length > 0 && (
          <Select
            value=""
            onValueChange={handleSelectValue}
            disabled={disabled}
          >
            <SelectTrigger
              size={size}
              variant={variant}
              className={S.selectTrigger}
              darker={darker}
              style={{
                minWidth: 'auto',
                height: 'auto',
                fontSize: 'var(--text-xs)',
                pointerEvents: items.length < 2 ? 'none' : undefined,
              }}
            >
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {unselectedItems.map(item => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {renderSelectItem(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  if (items.length === 0) return null;

  const selectedId =
    items.find(item => selectedSet.has(item.id))?.id ?? items[0]?.id;
  const selectValue = selectedId != null ? String(selectedId) : '';

  return (
    <div className={cn(S.root, className)}>
      <Select
        value={selectValue}
        onValueChange={handleSelectValue}
        disabled={disabled}
      >
        <SelectTrigger
          size={size}
          variant={variant}
          darker={darker}
          className={S.selectTrigger}
          hideChevron={items.length < 2}
          style={{
            minWidth: 'auto',
            height: 'auto',
            fontSize: 'var(--text-xs)',
            pointerEvents: items.length < 2 ? 'none' : undefined,
          }}
          {...triggerProps}
        >
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map(item => (
            <SelectItem
              key={item.id}
              value={String(item.id)}
              selected={String(item.id) === selectValue}
            >
              {renderSelectItem(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
