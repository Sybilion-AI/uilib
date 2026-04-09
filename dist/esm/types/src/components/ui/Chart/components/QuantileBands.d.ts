import type { QuantileBandConfig } from '../../ChartForecastProbabilistic/ChartForecastProbabilistic.types';
export declare const DEFAULT_QUANTILE_BAND_COLOR: string;
interface QuantileBandsProps {
    color?: string;
    hiddenBands?: Set<string>;
    quantileBandKey?: string;
    animate?: boolean;
    animationDuration: number;
    animationBegin: number;
    customBands: QuantileBandConfig[];
    showLegend?: boolean;
}
/**
 * Renders quantile bands as Area components using array values
 * Each band uses [lower, upper] array format to fill between two values
 */
export declare function QuantileBands({ color, hiddenBands, quantileBandKey, animate, animationDuration, animationBegin, customBands, showLegend, }: QuantileBandsProps): import("react/jsx-runtime").JSX.Element;
export {};
