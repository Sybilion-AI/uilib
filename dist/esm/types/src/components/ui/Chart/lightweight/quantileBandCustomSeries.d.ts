import type { CustomData, CustomSeriesOptions, CustomSeriesWhitespaceData, ICustomSeriesPaneRenderer, ICustomSeriesPaneView, PaneRendererCustomData, UTCTimestamp } from 'lightweight-charts';
export interface QuantileBandCustomData extends CustomData<UTCTimestamp> {
    lower: number;
    upper: number;
}
export type QuantileBandStyle = {
    fill: string;
    stroke?: string;
    strokeWidth: number;
    strokeDasharray?: string;
    strokeOpacity?: number;
};
export declare class QuantileBandPaneView implements ICustomSeriesPaneView<UTCTimestamp, QuantileBandCustomData, CustomSeriesOptions> {
    private _paneData;
    private _style;
    constructor(initialStyle: QuantileBandStyle);
    updateStyle(style: QuantileBandStyle): void;
    renderer(): ICustomSeriesPaneRenderer;
    update(paneData: PaneRendererCustomData<UTCTimestamp, QuantileBandCustomData>, seriesOptions: CustomSeriesOptions): void;
    priceValueBuilder(plotRow: QuantileBandCustomData): number[];
    isWhitespace(data: QuantileBandCustomData | CustomSeriesWhitespaceData<UTCTimestamp>): data is CustomSeriesWhitespaceData<UTCTimestamp>;
    defaultOptions(): CustomSeriesOptions;
    destroy(): void;
}
