import { type ReactNode } from 'react';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastData } from '#uilib/types/forecast-data';
import { type SpaghettiPerformanceMatrixPayload } from './performanceChartUserSeries';
export type PerformanceViewTab = 'perHorizon' | 'spaghetti';
export type PerformanceChartPayload = Record<string, {
    forecasts?: Record<string, Record<string, number>>;
    metrics_history?: Record<string, {
        mae?: Record<string, number>;
        mape?: Record<string, number>;
    }>;
}>;
export type PerformanceChartProps = {
    performanceData: PerformanceChartPayload | null;
    historicalData?: ChartDataPoint[];
    combinedData?: ChartDataPoint[];
    forecastData?: Record<string, ForecastData>;
    userSeries?: {
        id: number;
        name?: string;
    }[];
    spaghettiUserSeries?: {
        id: number;
        name?: string;
    }[];
    customPerformanceMatrix?: SpaghettiPerformanceMatrixPayload | null;
    customPerformanceLabel?: string | null;
    loading?: boolean;
    chartLoading?: boolean;
    performanceSectionPending?: boolean;
    isEmpty?: boolean;
    perfFetchSettled?: boolean;
    performanceDataLoading?: boolean;
    performanceAnalysisId?: number | null;
    statusHint?: string | null;
    statusTone?: 'destructive' | 'muted';
    runAnalysisHint?: boolean;
    timeRange?: string;
    onTimeRangeChange?: (range: string, meta?: {
        viewTab: PerformanceViewTab;
    }) => void;
    isDarkTheme?: boolean;
    className?: string;
    seriesInitKey?: string;
    toolbarStart?: ReactNode;
    onEditCustomPerformance?: () => void;
    showAddEditCustomDataButton?: boolean;
    addEditCustomDataDisabled?: boolean;
    hiddenSeries?: Set<string>;
    onToggleLegendSeries?: (key: string) => void;
    onEnsureSeriesVisible?: (key: string) => void;
    onHiddenSeriesChange?: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
};
export declare function PerformanceChart({ performanceData, historicalData, combinedData, forecastData, userSeries, spaghettiUserSeries, customPerformanceMatrix, customPerformanceLabel, loading, chartLoading, performanceSectionPending, isEmpty, perfFetchSettled, performanceDataLoading, performanceAnalysisId, statusHint, statusTone, runAnalysisHint, timeRange: timeRangeProp, onTimeRangeChange, isDarkTheme, className, seriesInitKey, toolbarStart, onEditCustomPerformance, showAddEditCustomDataButton, addEditCustomDataDisabled, hiddenSeries: hiddenSeriesProp, onToggleLegendSeries, onEnsureSeriesVisible, onHiddenSeriesChange, }: PerformanceChartProps): import("react/jsx-runtime").JSX.Element;
