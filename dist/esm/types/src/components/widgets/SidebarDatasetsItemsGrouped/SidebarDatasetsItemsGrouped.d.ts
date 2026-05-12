import { type SidebarDatasetsItemsGroupBy, type SidebarDatasetsItemsGroupedDataset } from './groupSidebarDatasets';
export type SidebarDatasetsItemsGroupedProps = {
    groupBy: SidebarDatasetsItemsGroupBy;
    datasets: SidebarDatasetsItemsGroupedDataset[];
    preItems?: React.ReactNode;
    postItems?: React.ReactNode;
    selectedDatasetId?: number;
    onDatasetClick?: (datasetId: number) => void;
    /** When omitted, all groups start expanded. */
    defaultExpandedGroupNames?: string[];
    className?: string;
};
export declare function SidebarDatasetsItemsGrouped({ groupBy, datasets, preItems, postItems, selectedDatasetId, onDatasetClick, defaultExpandedGroupNames, className, }: SidebarDatasetsItemsGroupedProps): import("react/jsx-runtime").JSX.Element;
