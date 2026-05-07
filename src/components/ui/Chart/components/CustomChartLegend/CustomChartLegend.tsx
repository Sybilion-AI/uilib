import cn from 'classnames';
import { useCallback, useMemo } from 'react';

import { AnalysesSelector } from '#uilib/components/ui/AnalysesSelector';

import S from './CustomChartLegend.styl';

interface CustomChartLegendPayloadItem {
  value: string;
  // type: string;
  color: string;
  dataKey: string;
  icon?: string;
  status?: string;
  // pending?: boolean;
  // tooltip?: string;
  dimmed?: boolean;
  updated_at?: string;
}

interface CustomChartLegendProps {
  payload?: CustomChartLegendPayloadItem[];
  onClick?: (data: any, index: number, event: any) => void;
  className?: string;
  wrapperStyle?: React.CSSProperties;
  hiddenSeries?: Set<string>;
  onAnalysisSelect?: (analysisId: number) => void;
  onFailedAnalysisClick?: (analysisId?: number) => void;
  maxVisibleItems?: number;
  /**
   * When true (default), legend keeps all series "selected"; `hiddenSeries` only dims lines.
   * When false, hidden series drop out of selection (legacy; breaks +N overflow when
   * `items.length < 2` together with `enableToggleHidden`).
   */
  preventDeselection?: boolean;
}

function extractIdFromDataKey(dataKey?: string): number {
  if (!dataKey) return undefined;
  const id = dataKey.startsWith('forecast_')
    ? dataKey.replace('forecast_', '')
    : dataKey;
  return /^\d+$/.test(id) ? parseInt(id, 10) : undefined;
}

/**
 * Custom chart legend using AnalysesSelector (inline mode)
 * Supports forecast icon indicator, failed badge, toggle visibility
 */
export function CustomChartLegend({
  payload,
  onClick,
  hiddenSeries,
  className,
  onAnalysisSelect,
  onFailedAnalysisClick,
  maxVisibleItems,
  preventDeselection = true,
}: CustomChartLegendProps) {
  const items = useMemo(
    () =>
      (payload ?? []).map(p => ({
        id: extractIdFromDataKey(p.dataKey),
        label: p.value,
        color: p.color,
        status: p.status,
        icon: p.icon,
        updated_at: p.updated_at,
      })),
    [payload],
  );

  const selectedIds = useMemo(() => {
    if (preventDeselection) {
      // Always keep all items selected when preventDeselection is true
      // AnalysesSelector will show maxVisibleItems inline based on this
      return new Set(items.map(item => item.id));
    }
    return new Set(
      items
        .filter(item => {
          const dataKey = `forecast_${item.id}`;
          return !hiddenSeries?.has(dataKey);
        })
        .map(item => item.id),
    );
  }, [items, hiddenSeries, preventDeselection]);

  const handleToggleSeriesVisibility = useCallback(
    (analysisId: number | string) => {
      const dataKey =
        Number(analysisId) === -1 ? 'historical' : `forecast_${analysisId}`;
      const index =
        payload?.findIndex(p => p.dataKey === dataKey) ??
        payload?.findIndex(
          p => extractIdFromDataKey(p.dataKey) === Number(analysisId),
        ) ??
        0;
      const payloadItem = payload?.[index];
      onClick?.(
        { dataKey, value: payloadItem?.value, ...payloadItem },
        index,
        {},
      );
    },
    [onClick, payload],
  );

  const handleItemToggle = useCallback(
    (id: number) => {
      const dataKey = `forecast_${id}`;
      const payloadItem = payload?.find(
        p => extractIdFromDataKey(p.dataKey) === id,
      );
      const wasHidden = hiddenSeries?.has(dataKey);
      const index =
        payload?.findIndex(p => extractIdFromDataKey(p.dataKey) === id) ?? 0;

      onClick?.(
        { dataKey, value: payloadItem?.value, ...payloadItem },
        index,
        {},
      );

      if (wasHidden && onAnalysisSelect) {
        onAnalysisSelect(id);
      }
    },
    [onClick, payload, hiddenSeries, onAnalysisSelect],
  );

  if (!items.length) return null;

  return (
    <div className={cn(S.legendContainer, className)}>
      <AnalysesSelector
        items={items}
        selectedIds={selectedIds}
        onItemToggle={handleItemToggle}
        inlineMode
        size="sm"
        variant="clear"
        onFailedItemClick={onFailedAnalysisClick}
        enableToggleHidden
        maxVisibleItems={maxVisibleItems}
        preventDeselection={preventDeselection}
        hiddenSeries={hiddenSeries ?? new Set()}
        onToggleSeries={handleToggleSeriesVisibility}
      />
    </div>
  );
}
