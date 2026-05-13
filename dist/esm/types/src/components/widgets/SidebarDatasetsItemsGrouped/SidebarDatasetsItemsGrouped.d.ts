import { type SidebarDatasetsItemsGroupBy, type SidebarDatasetsItemsGroupedDataset } from './groupSidebarDatasets';
export type SidebarDatasetsItemsGroupedProps = {
    groupBy: SidebarDatasetsItemsGroupBy;
    datasets: SidebarDatasetsItemsGroupedDataset[];
    preItems?: React.ReactNode;
    postItems?: React.ReactNode;
    selectedDatasetId?: number;
    onDatasetClick?: (datasetId: number) => void;
    /**
     * When set, expanded state resets to this list whenever `grouped` changes.
     * Omit: start collapsed; any group containing `selectedDatasetId` opens (toggle still adds more).
     */
    defaultExpandedGroupNames?: string[];
    className?: string;
};
export declare function SidebarDatasetsItemsGrouped({ groupBy, datasets, preItems, postItems, selectedDatasetId, onDatasetClick, defaultExpandedGroupNames, className, }: SidebarDatasetsItemsGroupedProps): import("react/jsx-runtime").JSX.Element;
