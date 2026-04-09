import { ChartConfig } from './Chart.types';
export declare function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string): {
    label?: React.ReactNode;
    icon?: React.ComponentType;
} & ({
    color?: string;
    theme?: never;
} | {
    color?: never;
    theme: Record<keyof typeof import("./Chart.types").THEMES, string>;
});
