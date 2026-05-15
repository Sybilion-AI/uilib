import { type ReactNode } from 'react';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
export interface TimeRangeBrushHostProps {
    chartData: ChartDataPoint[];
    onTimeRangeChange: (range: string) => void;
    enabled: boolean;
    /** Bumps layout sync when chart remounts (e.g. dataset / render id). */
    layoutKey?: string | number | null;
    children: ReactNode;
}
/**
 * Wraps chart; pointerdown on SVG starts horizontal brush. Plot box tracks the
 * painted grid / Recharts plot (see TimeRangeBrushLayout.helpers).
 */
export declare function TimeRangeBrushHost({ chartData, onTimeRangeChange, enabled, layoutKey, children, }: TimeRangeBrushHostProps): import("react/jsx-runtime").JSX.Element;
