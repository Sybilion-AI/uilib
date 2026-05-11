import { type SidebarDatasetsItemsGroupBy, type SidebarDatasetsItemsGroupedDataset } from './groupSidebarDatasets';
export type SidebarDatasetsItemsGroupedProps = {
    groupBy: SidebarDatasetsItemsGroupBy;
    datasets: SidebarDatasetsItemsGroupedDataset[];
    selectedDatasetId?: number;
    onDatasetClick?: (datasetId: number) => void;
    /** When omitted, all groups start expanded. */
    defaultExpandedGroupNames?: string[];
    className?: string;
};
export declare function SidebarDatasetsItemsGrouped({ groupBy, datasets, selectedDatasetId, onDatasetClick, defaultExpandedGroupNames, className, }: SidebarDatasetsItemsGroupedProps): import("react/jsx-runtime").JSX.Element;
