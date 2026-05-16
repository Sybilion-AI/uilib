import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
/**
 * Matches ChartAreaInteractive `mode="intervals"`: cone / fan chart hand-off — collapse the
 * interval to a point at the historical→forecast boundary, then expand along forecast anchors.
 * (Same rules as `useQuantileBands`, without requiring `ForecastData` — reads tuples from each row.)
 */
export declare function applyQuantileBandConeToChartData(chartData: ChartDataPoint[], bandKey: string): ChartDataPoint[];
