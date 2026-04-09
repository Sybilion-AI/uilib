import { ComponentProps, ReactNode } from 'react';
export declare const THEMES: {
    readonly light: "";
    readonly dark: ".dark";
};
export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode;
        icon?: React.ComponentType;
    } & ({
        color?: string;
        theme?: never;
    } | {
        color?: never;
        theme: Record<keyof typeof THEMES, string>;
    });
};
export type ChartContextProps = {
    config: ChartConfig;
};
export type ChartTooltipContentProps = ComponentProps<'div'> & {
    active?: boolean;
    payload?: unknown[];
    label?: string | number;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    labelFormatter?: (label: unknown, payload: unknown[]) => ReactNode;
    labelClassName?: string;
    formatter?: (value: unknown, name: string, props: unknown, index: number, payload: unknown) => ReactNode;
    color?: string;
};
