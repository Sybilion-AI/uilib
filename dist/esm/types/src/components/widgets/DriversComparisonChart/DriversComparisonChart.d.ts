import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { BacktestsComponentPayload } from '@sybilion/platform-sdk';
export type DriversComparisonChartProps = {
    payload: BacktestsComponentPayload | null;
    datasetHistorical?: ChartDataPoint[];
    loading?: boolean;
    chartLoading?: boolean;
    statusHint?: string | null;
    statusTone?: 'destructive' | 'muted';
    runAnalysisHint?: boolean;
    timeRange?: string;
    onTimeRangeChange?: (range: string) => void;
    isDarkTheme?: boolean;
    className?: string;
    /** Resets visible series when this key changes (e.g. selected analysis id). */
    seriesInitKey?: string;
};
export declare function DriversComparisonChart({ payload, datasetHistorical, loading, chartLoading, statusHint, statusTone, runAnalysisHint, timeRange: timeRangeProp, onTimeRangeChange, isDarkTheme, className, seriesInitKey, }: DriversComparisonChartProps): import("react/jsx-runtime").JSX.Element;
