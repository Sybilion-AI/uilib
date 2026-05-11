import { useEffect, useMemo, useState } from 'react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '#uilib/components/ui/Sidebar/Sidebar';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';
import { ChevronDown, ChevronRight, PackageOpen } from 'lucide-react';

import S from './SidebarDatasetsItemsGrouped.styl';
import {
  type SidebarDatasetsItemsGroupBy,
  type SidebarDatasetsItemsGroupedDataset,
  groupSidebarDatasets,
} from './groupSidebarDatasets';

export type SidebarDatasetsItemsGroupedProps = {
  groupBy: SidebarDatasetsItemsGroupBy;
  datasets: SidebarDatasetsItemsGroupedDataset[];
  selectedDatasetId?: number;
  onDatasetClick?: (datasetId: number) => void;
  /** When omitted, all groups start expanded. */
  defaultExpandedGroupNames?: string[];
  className?: string;
};

export function SidebarDatasetsItemsGrouped({
  groupBy,
  datasets,
  selectedDatasetId,
  onDatasetClick,
  defaultExpandedGroupNames,
  className,
}: SidebarDatasetsItemsGroupedProps) {
  const grouped = useMemo(
    () => groupSidebarDatasets(datasets, groupBy),
    [datasets, groupBy],
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (defaultExpandedGroupNames !== undefined) {
      setExpanded(new Set(defaultExpandedGroupNames));
    } else {
      setExpanded(new Set(grouped.map(([name]) => name)));
    }
  }, [grouped, defaultExpandedGroupNames]);

  useEffect(() => {
    if (selectedDatasetId == null) return;
    const groupName = grouped.find(([, ds]) =>
      ds.some(d => d.id === selectedDatasetId),
    )?.[0];
    if (groupName) {
      setExpanded(prev => new Set(prev).add(groupName));
    }
  }, [selectedDatasetId, grouped]);

  const toggleGroup = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {grouped.map(([groupName, groupDatasets]) => {
          const isExpanded = expanded.has(groupName);
          const parentActive = groupDatasets.some(
            d => d.id === selectedDatasetId,
          );

          return (
            <SidebarMenuItem key={groupName}>
              <SidebarMenuButton
                type="button"
                isActive={parentActive}
                onClick={() => toggleGroup(groupName)}
              >
                <PackageOpen strokeWidth={1.5} size={16} />
                <SmartTextTruncate>{groupName}</SmartTextTruncate>
                <div className={S.chevronContainer}>
                  {isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </div>
              </SidebarMenuButton>
              {isExpanded && (
                <SidebarMenuSub className={S.subMenuContainer}>
                  <div className={S.subMenuBorder} />
                  {groupDatasets.map(dataset => (
                    <SidebarMenuSubItem
                      key={dataset.id}
                      className={S.subMenuItem}
                    >
                      <SidebarMenuSubButton
                        href={`#dataset-${dataset.id}`}
                        isActive={dataset.id === selectedDatasetId}
                        onClick={e => {
                          e.preventDefault();
                          onDatasetClick?.(dataset.id);
                        }}
                      >
                        <SmartTextTruncate>{dataset.name}</SmartTextTruncate>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
