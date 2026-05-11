import { jsx, jsxs } from 'react/jsx-runtime';
import { useMemo, useState, useEffect } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '../../ui/Sidebar/Sidebar.js';
import { SmartTextTruncate } from '../../ui/SmartTextTruncate/SmartTextTruncate.js';
import { PackageOpen, ChevronDown, ChevronRight } from 'lucide-react';
import S from './SidebarDatasetsItemsGrouped.styl.js';
import { groupSidebarDatasets } from './groupSidebarDatasets.js';

function SidebarDatasetsItemsGrouped({ groupBy, datasets, selectedDatasetId, onDatasetClick, defaultExpandedGroupNames, className, }) {
    const grouped = useMemo(() => groupSidebarDatasets(datasets, groupBy), [datasets, groupBy]);
    const [expanded, setExpanded] = useState(new Set());
    useEffect(() => {
        if (defaultExpandedGroupNames !== undefined) {
            setExpanded(new Set(defaultExpandedGroupNames));
        }
        else {
            setExpanded(new Set(grouped.map(([name]) => name)));
        }
    }, [grouped, defaultExpandedGroupNames]);
    useEffect(() => {
        if (selectedDatasetId == null)
            return;
        const groupName = grouped.find(([, ds]) => ds.some(d => d.id === selectedDatasetId))?.[0];
        if (groupName) {
            setExpanded(prev => new Set(prev).add(groupName));
        }
    }, [selectedDatasetId, grouped]);
    const toggleGroup = (name) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(name))
                next.delete(name);
            else
                next.add(name);
            return next;
        });
    };
    return (jsx(SidebarGroup, { className: className, children: jsx(SidebarMenu, { children: grouped.map(([groupName, groupDatasets]) => {
                const isExpanded = expanded.has(groupName);
                const parentActive = groupDatasets.some(d => d.id === selectedDatasetId);
                return (jsxs(SidebarMenuItem, { children: [jsxs(SidebarMenuButton, { type: "button", isActive: parentActive, onClick: () => toggleGroup(groupName), children: [jsx(PackageOpen, { strokeWidth: 1.5, size: 16 }), jsx(SmartTextTruncate, { children: groupName }), jsx("div", { className: S.chevronContainer, children: isExpanded ? (jsx(ChevronDown, { size: 12 })) : (jsx(ChevronRight, { size: 12 })) })] }), isExpanded && (jsxs(SidebarMenuSub, { className: S.subMenuContainer, children: [jsx("div", { className: S.subMenuBorder }), groupDatasets.map(dataset => (jsx(SidebarMenuSubItem, { className: S.subMenuItem, children: jsx(SidebarMenuSubButton, { href: `#dataset-${dataset.id}`, isActive: dataset.id === selectedDatasetId, onClick: e => {
                                            e.preventDefault();
                                            onDatasetClick?.(dataset.id);
                                        }, children: jsx(SmartTextTruncate, { children: dataset.name }) }) }, dataset.id)))] }))] }, groupName));
            }) }) }));
}

export { SidebarDatasetsItemsGrouped };
