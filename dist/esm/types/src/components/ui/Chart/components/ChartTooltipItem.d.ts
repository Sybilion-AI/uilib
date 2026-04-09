import { ReactNode } from 'react';
import { ChartConfig } from '../Chart.types';
type TooltipItem = {
    type: string;
    name: string;
    value: number | [number, number];
    payload: unknown;
    color: string;
    dataKey?: string;
};
type ChartTooltipItemProps = {
    item: TooltipItem;
    index: number;
    config: ChartConfig;
    indicator: 'line' | 'dot' | 'dashed';
    hideIndicator: boolean;
    nestLabel: boolean;
    tooltipLabel: ReactNode;
    color?: string;
    nameKey?: string;
    formatter?: (value: unknown, name: string, props: unknown, index: number, payload: unknown) => ReactNode;
};
export declare function ChartTooltipItem({ item, index, config, indicator, hideIndicator, nestLabel, tooltipLabel, color, nameKey, formatter, }: ChartTooltipItemProps): import("react/jsx-runtime").JSX.Element;
export {};
