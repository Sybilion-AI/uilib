export interface LegendSvgPayloadItem {
    value: string;
    color: string;
    dataKey: string;
}
interface LegendSvgProps {
    payload: LegendSvgPayloadItem[];
    width: number;
    marginLeft?: number;
}
export declare function LegendSvg({ payload, width, marginLeft }: LegendSvgProps): import("react/jsx-runtime").JSX.Element;
export {};
