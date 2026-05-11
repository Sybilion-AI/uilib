import type { SybilionDatasetSnapshot } from '#uilib/types/sybilionDatasetSnapshots';
export type SidebarDatasetsItemsGroupedDataset = SybilionDatasetSnapshot;
export type SidebarDatasetsItemsGroupBy = 'target_type' | 'regions' | 'categories';
export type GroupedSidebarDatasetsEntry = readonly [
    groupName: string,
    datasets: SidebarDatasetsItemsGroupedDataset[]
];
export declare function groupSidebarDatasets(datasets: SidebarDatasetsItemsGroupedDataset[], groupBy: SidebarDatasetsItemsGroupBy): GroupedSidebarDatasetsEntry[];
