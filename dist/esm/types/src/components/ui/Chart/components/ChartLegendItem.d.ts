import { ChartConfig } from '../Chart.types';
type LegendItem = {
    type: string;
    value: string;
    color: string;
    dataKey?: string;
};
type ChartLegendItemProps = {
    item: LegendItem;
    config: ChartConfig;
    hideIcon: boolean;
    nameKey?: string;
};
export declare function ChartLegendItem({ item, config, hideIcon, nameKey, }: ChartLegendItemProps): import("react/jsx-runtime").JSX.Element;
export {};
