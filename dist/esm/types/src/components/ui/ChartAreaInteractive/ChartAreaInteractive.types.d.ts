import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import type { ForecastData } from '#uilib/types/forecast-data';
import { LegendPayload } from 'recharts';
import { TimeRange } from './ChartAreaInteractive.helpers';
export type OverlayMode = 'pin' | 'intervals' | 'thresholds';
export interface ChartDataPoint {
    date: string;
    historical?: number;
    [key: string]: string | number | [number, number] | undefined;
}
export interface Analysis {
    id: number;
    icon?: string;
    name: string;
    color?: string;
    status?: string;
    updated_at?: string;
    analysis_cycle?: {
        id: number;
        name: string;
    };
}
export interface ChartAreaInteractiveProps extends BaseChartWrapperProps {
    chartContainerClassName?: string;
    timeRange: TimeRange;
    onTimeRangeChange: (range: string) => void;
    pinMonth: string | undefined;
    onPinMonthChange: (month: string | undefined) => void;
    onPreviewMonthChange?: (month: string | undefined) => void;
    mode?: OverlayMode;
    selectedForecast?: Analysis;
    upperQuantiles?: string[];
    lowerQuantiles?: string[];
    selectedLowerQuantile?: string | null;
    selectedUpperQuantile?: string | null;
    onLowerQuantileChange?: (quantile: string | null) => void;
    onUpperQuantileChange?: (quantile: string | null) => void;
    lowerThreshold?: number;
    upperThreshold?: number;
    onLowerThresholdChange?: (value: number) => void;
    onUpperThresholdChange?: (value: number) => void;
    discreteThresholdValues?: {
        lower: number[];
        upper: number[];
    };
    headerActions?: React.ReactNode;
    loadingAnalyses?: Set<string>;
    onLegendClick?: (data: LegendPayload) => undefined | boolean;
    disableTimeRangeSelector?: boolean;
    forecastLineStyle?: 'dashed' | 'solid';
    /** When set, ensures this analysis is visible (selected) in chart legend */
    selectedAnalysisId?: number | null;
    /** Stable id for chart instance (e.g. dataset id string). */
    chartRenderId?: string | null;
    /** Toggle series visibility by Recharts `dataKey` (e.g. `forecast_12`, `historical`). */
    toggleLegendSeries: (seriesKey: string) => void;
    /** Show a forecast series when it was hidden (e.g. after table row selection). */
    ensureAnalysisSeriesVisible: (analysisId: number | string) => void;
    /** Forecast quantile payloads keyed by analysis id (intervals/threshold overlays). */
    overlayForecastData?: Record<number, ForecastData>;
    /** Skip automatic forecast bridge points at last historical month (legacy / custom-shaped data). */
    disableForecastHistoricalBridge?: boolean;
}
