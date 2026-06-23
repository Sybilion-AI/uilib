import cn from 'classnames';
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AnalysisLineIcon } from '#uilib/components/ui/AnalysisLineIcon';
import { Button } from '#uilib/components/ui/Button';
import { Chip } from '#uilib/components/ui/Chip';
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
import { SelectInlineRenamer } from './SelectInlineRenamer';

const isFailed = (item: AnalysesSelectorItem) =>
  item.status?.toLowerCase() === 'fail';

const isDashedIcon = (item: AnalysesSelectorItem) => item.id !== -1;

const defaultIsAnalysisInProgress = (status?: string) =>
  ['pending', 'running', 'cancelling'].includes(status?.toLowerCase() ?? '');

const shouldBlockSelectKeydownWhileRenaming = (e: KeyboardEvent) => {
  if (!(e.target instanceof HTMLInputElement)) {
    return true;
  }

  return (
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown' ||
    e.key === ' ' ||
    e.key === 'Enter'
  );
};

function renderItemContent(item: AnalysesSelectorItem) {
  const failed = isFailed(item);

  if (failed) {
    return (
      <Chip variant="negative" squared className={S.itemBadge}>
        failed
      </Chip>
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
    return (
      <img
        src={icon}
        alt=""
        width={16}
        height={16}
        data-slot="analysis-icon"
        className={cn(S.icon, S.iconImage)}
      />
    );
  }
  return (
    <span data-slot="analysis-icon" className={cn(S.icon, S.iconWrapper)}>
      {icon}
    </span>
  );
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
  rename,
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

  const selectedItem = items.find(item => selectedSet.has(item.id)) ?? items[0];
  const selectedId = selectedItem?.id;

  const [isRenaming, setIsRenaming] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    setIsRenaming(false);
  }, [selectedId, rename?.value]);

  useEffect(() => {
    if (isRenaming) {
      setSelectOpen(false);
    }
  }, [isRenaming]);

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

  const renderItemLabel = (item: AnalysesSelectorItem) => (
    <LabelWithId
      id={item.id}
      label={
        isAnalysisInProgressProp(item.status) ? (
          <TextShimmer as="span">{item.label}</TextShimmer>
        ) : (
          item.label
        )
      }
      className={cn(S.label, S.itemLabelWithId)}
    />
  );

  const renderSelectItem = (item: AnalysesSelectorItem) => (
    <div className={S.selectItemContent}>
      {renderItemContent(item)}
      {renderIcon(item.icon)}
      {renderItemLabel(item)}
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
            {renderItemLabel(item)}
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
                pointerEvents:
                  items.length < 2 && unselectedItems.length === 0
                    ? 'none'
                    : undefined,
              }}
            >
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {unselectedItems.map(item => (
                <SelectItem
                  key={item.id}
                  value={String(item.id)}
                  textValue={item.label}
                >
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

  const selectValue = selectedId != null ? String(selectedId) : '';
  const showRenamer =
    rename && selectedItem && rename.renameableItemIds.has(selectedItem.id);
  const singleItemSelect = items.length < 2;

  const { className: triggerClassName, ...restTriggerProps } =
    triggerProps ?? {};

  const triggerStyle = {
    minWidth: 'auto',
    height: 'auto',
    fontSize: 'var(--text-xs)',
    pointerEvents:
      singleItemSelect && !showRenamer ? ('none' as const) : undefined,
  };

  const triggerClassNameMerged = cn(
    S.selectTrigger,
    isRenaming && S.selectTriggerRenaming,
    triggerClassName,
  );

  const renamerTriggerContent = showRenamer ? (
    <div
      className={cn(
        S.selectTriggerContent,
        disabled && S.selectTriggerRenamerDisabled,
      )}
    >
      {renderItemContent(selectedItem)}
      {renderIcon(selectedItem.icon)}
      <SelectInlineRenamer
        value={rename.value}
        displayLabel={selectedItem.label}
        onChange={rename.onChange}
        disabled={disabled}
        className={S.selectTriggerRenamer}
        isRenaming={isRenaming}
        onEnterRenaming={() => setIsRenaming(prev => !prev)}
      />
    </div>
  ) : null;

  return (
    <div className={cn(S.root, className)}>
      <Select
        value={selectValue}
        onValueChange={handleSelectValue}
        disabled={disabled}
        open={isRenaming || singleItemSelect ? false : selectOpen}
        onOpenChange={open => {
          if (!isRenaming && !singleItemSelect) {
            setSelectOpen(open);
          }
        }}
      >
        <SelectTrigger
          asChild={showRenamer}
          size={size}
          variant={variant}
          darker={darker}
          hideChevron={singleItemSelect}
          {...restTriggerProps}
          {...(showRenamer
            ? {}
            : {
                style: triggerStyle,
                className: triggerClassNameMerged,
                onKeyDown: (e: KeyboardEvent) => {
                  if (isRenaming && shouldBlockSelectKeydownWhileRenaming(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                },
              })}
        >
          {showRenamer ? (
            <div
              className={triggerClassNameMerged}
              style={triggerStyle}
              onKeyDown={e => {
                if (isRenaming && shouldBlockSelectKeydownWhileRenaming(e)) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {renamerTriggerContent}
            </div>
          ) : (
            <SelectValue placeholder={selectPlaceholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {items.map(item => (
            <SelectItem
              key={item.id}
              value={String(item.id)}
              selected={selectedSet.has(item.id)}
              textValue={item.label}
            >
              {renderSelectItem(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
