import { ComponentProps, ReactNode } from 'react';
import { ChartConfig, ChartContainer } from '#uilib/components/ui/Chart/Chart';
import { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { QuantileBandConfig } from '#uilib/components/ui/ChartForecastProbabilistic/ChartForecastProbabilistic.types';
import { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
export interface BaseChartWrapperProps {
    renderId?: string;
    chartConfig?: ChartConfig;
    chartData: ChartDataPoint[];
    historicalLineColor?: string;
    forecastData?: ForecastItemData[];
    loading: boolean;
    hasCombinedData?: boolean;
    isDarkTheme: boolean;
    height?: number;
    className?: string;
    loadingComponentClassName?: string;
    footerClassName?: string;
    chartClassName?: string;
    xAxisClassName?: string;
    yAxisClassName?: string;
    legendClassName?: string;
    footerActions?: ReactNode;
    quantileBands?: QuantileBandConfig[];
    quantileBandKey?: string;
    xMin?: string | number;
    xMax?: string | number;
    yMin?: number;
    yMax?: number;
    autoScaleYAxis?: boolean;
    formatNumber?: (value: number) => string;
    formatDate?: (value: string, detailed?: boolean) => string;
    labelFormatter?: (value: unknown) => string;
    onLegendClick?: (data: LegendPayload, index: number, event: any) => void;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    children?: ReactNode;
    chartType?: 'composed' | 'line';
    disableAnimation?: boolean;
    showGrid?: boolean;
    showAxes?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
    showChartAxesLegend?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showActiveDots?: boolean;
    overlayElements?: ReactNode;
    hiddenSeries?: Set<string>;
    excludeLegendIds?: number[];
    onAnalysisSelect?: (analysisId: number | string) => void;
    onFailedAnalysisClick?: (analysisId?: number | string) => void;
    maxVisibleItems?: number;
    preventDeselection?: boolean;
    legendVariant?: 'default' | 'svg';
    legendWidth?: number;
    legendMarginLeft?: number;
    containerProps?: Omit<ComponentProps<typeof ChartContainer>, 'config' | 'className' | 'children'>;
    error?: string | null;
    loadingMessage?: ReactNode;
    noDataMessage?: string;
    onGridHeightChange?: (height: number) => void;
    forecastLineStyle?: 'dashed' | 'solid';
    disableHistoricalAnimation?: boolean;
    /** Clear all hidden series (legend “show all”). */
    onShowAll?: () => void;
    /** Isolate a single series by data key; `allDataKeys` lists every toggleable key. */
    onShowOnly?: (dataKey: string, allDataKeys: string[]) => void;
}
/**
 * Base chart wrapper component with common structure
 * Handles container, grid, axes, tooltip, and legend
 */
export declare function BaseChartWrapper(props: BaseChartWrapperProps): import("react/jsx-runtime").JSX.Element;
