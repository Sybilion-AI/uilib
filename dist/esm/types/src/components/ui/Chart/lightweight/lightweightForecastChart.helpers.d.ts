import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ChartOptions, DeepPartial, LineData, UTCTimestamp } from 'lightweight-charts';
import type { QuantileBandCustomData } from './quantileBandCustomSeries';
export declare function buildLightweightChartOptions(args: {
    isDarkTheme: boolean;
    width: number;
    height: number;
    autoSize?: boolean;
}): DeepPartial<ChartOptions>;
export declare function buildHistoricalLineData(rows: ChartDataPoint[]): LineData<UTCTimestamp>[];
export declare function buildForecastLineData(rows: ChartDataPoint[], forecastKey: string): LineData<UTCTimestamp>[];
export declare function buildQuantileBandCustomData(rows: ChartDataPoint[], bandKey: string): QuantileBandCustomData[];
export declare function findNearestChartRow(rows: ChartDataPoint[], time: UTCTimestamp): ChartDataPoint | null;
