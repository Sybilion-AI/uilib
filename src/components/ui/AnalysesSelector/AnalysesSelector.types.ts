import { ReactNode } from 'react';
import { SelectTriggerProps } from '#uilib/components/ui/Select/Select.types';

export interface AnalysesSelectorItem {
  id: number;
  label: string;
  color?: string;
  status?: string;
  icon?: ReactNode;
  updated_at?: string;
}

export interface AnalysesSelectorProps {
  items: AnalysesSelectorItem[];
  /** Single id, set, or array. Omit or `undefined` = nothing selected (Select falls back to first item for display). */
  selectedIds?: Set<number> | number[] | number;
  onItemToggle: (id: number) => void;
  inlineMode?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: SelectTriggerProps['size'];
  variant?: 'default' | 'clear';
  darker?: boolean;
  className?: string;
  triggerProps?: SelectTriggerProps;
  /** For failed items: optional callback when failed item is clicked (e.g. open re-run modal) */
  onFailedItemClick?: (id: number) => void;
  /** Show historical item as first in the list */
  showHistorical?: boolean;
  enableToggleHidden?: boolean;
  maxVisibleItems?: number;
  /** When true, prevents deselection and shows maxVisibleItems inline + rest in dropdown */
  preventDeselection?: boolean;
  /** Hidden series keys, e.g. `historical`, `forecast_<analysisId>` (app-owned state). */
  hiddenSeries?: Set<string>;
  /** Toggle hidden/visible for an analysis id (maps to `forecast_<id>` internally). */
  onToggleSeries?: (analysisId: number | string) => void;
  /** Override default pending/running/cancelling detection for labels. */
  isAnalysisInProgress?: (status?: string) => boolean;
  rename?: {
    value: string;
    onChange: (value: string) => void | Promise<void>;
    /** Only show Renamer when selected item id is in this set */
    renameableItemIds: Set<number>;
  };
}
