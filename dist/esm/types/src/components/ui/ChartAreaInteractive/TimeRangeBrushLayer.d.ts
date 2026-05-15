import { type ReactNode } from 'react';

import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

export interface TimeRangeBrushHostProps {
  chartData: ChartDataPoint[];
  onTimeRangeChange: (range: string) => void;
  enabled: boolean;
  children: ReactNode;
}
/**
 * Wraps chart; pointerdown on SVG starts horizontal brush. Selection band uses overlay geometry (pointer-events none).
 */
export declare function TimeRangeBrushHost({
  chartData,
  onTimeRangeChange,
  enabled,
  children,
}: TimeRangeBrushHostProps): import('react/jsx-runtime').JSX.Element;
