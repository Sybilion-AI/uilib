import type { MiniAppDataset } from '#uilib/mini-app/miniAppDataTypes';
export type SidebarDatasetsItemsGroupedDataset = MiniAppDataset;
export type SidebarDatasetsItemsGroupBy = 'target_type' | 'regions' | 'categories';
export type GroupedSidebarDatasetsEntry = readonly [
    groupName: string,
    datasets: SidebarDatasetsItemsGroupedDataset[]
];
export declare function groupSidebarDatasets(datasets: SidebarDatasetsItemsGroupedDataset[], groupBy: SidebarDatasetsItemsGroupBy): GroupedSidebarDatasetsEntry[];
