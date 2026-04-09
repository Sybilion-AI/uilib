import { SparklineChartData } from './Sparkline.types';
export declare const transformDataForChart: (data: number[]) => SparklineChartData[];
export declare const getStrokeColor: (strokeColor?: string) => string;
export declare const getActiveDotConfig: (showEndDot: boolean, strokeColor: string) => false | {
    r: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
};
