import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type {
  CustomData,
  CustomSeriesOptions,
  CustomSeriesWhitespaceData,
  ICustomSeriesPaneRenderer,
  ICustomSeriesPaneView,
  PaneRendererCustomData,
  PriceToCoordinateConverter,
  UTCTimestamp,
} from 'lightweight-charts';
import { customSeriesDefaultOptions } from 'lightweight-charts';

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

type MediaXY = { x: number; y: number };

/** Catmull–Rom segment chain → cubic Béziers (matches curved line feel). */
function appendCatmullRomBezierChain(
  ctx: CanvasRenderingContext2D,
  pts: MediaXY[],
  startWithMoveTo: boolean,
): void {
  if (pts.length < 2) return;

  if (pts.length === 2) {
    if (startWithMoveTo) ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    return;
  }

  if (startWithMoveTo) {
    ctx.moveTo(pts[0].x, pts[0].y);
  }

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

class QuantileBandPaneRenderer implements ICustomSeriesPaneRenderer {
  public constructor(
    private readonly getData: () =>
      | PaneRendererCustomData<UTCTimestamp, QuantileBandCustomData>
      | undefined,
    private readonly getStyle: () => QuantileBandStyle,
    private readonly isWhitespaceFn: (
      data: QuantileBandCustomData | CustomSeriesWhitespaceData<UTCTimestamp>,
    ) => data is CustomSeriesWhitespaceData<UTCTimestamp>,
  ) {}

  public draw(
    target: CanvasRenderingTarget2D,
    priceConverter: PriceToCoordinateConverter,
  ): void {
    const pane = this.getData() as
      | PaneRendererCustomData<UTCTimestamp, QuantileBandCustomData>
      | undefined;
    if (!pane?.bars?.length) {
      return;
    }

    const style = this.getStyle();
    const segments: Array<{ x: number; yU: number; yL: number }> = [];

    for (const bar of pane.bars) {
      const d = bar.originalData;
      if (this.isWhitespaceFn(d)) {
        continue;
      }
      const p = d as QuantileBandCustomData;
      const yU = priceConverter(p.upper);
      const yL = priceConverter(p.lower);
      if (yU === null || yL === null) {
        continue;
      }
      segments.push({ x: bar.x, yU, yL });
    }

    if (segments.length < 2) {
      return;
    }

    target.useMediaCoordinateSpace(({ context }) => {
      const opacity =
        typeof style.strokeOpacity === 'number'
          ? style.strokeOpacity
          : undefined;
      const prevAlpha = context.globalAlpha;
      const upper: MediaXY[] = segments.map(s => ({ x: s.x, y: s.yU }));
      const lowerRev: MediaXY[] = segments
        .map(s => ({ x: s.x, y: s.yL }))
        .reverse();

      context.beginPath();
      appendCatmullRomBezierChain(context, upper, true);
      const last = segments[segments.length - 1]!;
      context.lineTo(last.x, last.yL);
      appendCatmullRomBezierChain(context, lowerRev, false);
      context.closePath();
      context.fillStyle = style.fill;
      context.fill();

      const sw = style.strokeWidth;
      if (sw > 0) {
        if (opacity !== undefined) context.globalAlpha = opacity;
        context.lineWidth = sw;
        context.strokeStyle = style.stroke ?? style.fill;
        if (style.strokeDasharray) {
          const parts = style.strokeDasharray
            .split(/[\s,]+/)
            .map(Number)
            .filter(n => Number.isFinite(n));
          if (parts.length) context.setLineDash(parts);
          else context.setLineDash([]);
        } else {
          context.setLineDash([]);
        }
        context.stroke();
        context.setLineDash([]);
      }
      context.globalAlpha = prevAlpha;
    });
  }
}

export class QuantileBandPaneView implements ICustomSeriesPaneView<
  UTCTimestamp,
  QuantileBandCustomData,
  CustomSeriesOptions
> {
  private _paneData:
    | PaneRendererCustomData<UTCTimestamp, QuantileBandCustomData>
    | undefined;

  private _style!: QuantileBandStyle;

  public constructor(initialStyle: QuantileBandStyle) {
    this._style = initialStyle;
  }

  public updateStyle(style: QuantileBandStyle): void {
    this._style = style;
  }

  public renderer(): ICustomSeriesPaneRenderer {
    return new QuantileBandPaneRenderer(
      () => this._paneData,
      () => this._style,
      (d): d is CustomSeriesWhitespaceData<UTCTimestamp> =>
        this.isWhitespace(d),
    );
  }

  public update(
    paneData: PaneRendererCustomData<UTCTimestamp, QuantileBandCustomData>,
    seriesOptions: CustomSeriesOptions,
  ): void {
    this._paneData = paneData;
    const c = seriesOptions.color;
    if (typeof c === 'string') {
      this._style = { ...this._style, fill: c };
    }
  }

  public priceValueBuilder(plotRow: QuantileBandCustomData): number[] {
    if (this.isWhitespace(plotRow)) {
      return [];
    }
    const p = plotRow as QuantileBandCustomData;
    return [p.lower, p.upper, (p.lower + p.upper) / 2];
  }

  public isWhitespace(
    data: QuantileBandCustomData | CustomSeriesWhitespaceData<UTCTimestamp>,
  ): data is CustomSeriesWhitespaceData<UTCTimestamp> {
    const row = data as QuantileBandCustomData;
    if (
      typeof row.lower !== 'number' ||
      typeof row.upper !== 'number' ||
      !Number.isFinite(row.lower) ||
      !Number.isFinite(row.upper)
    ) {
      return true;
    }
    return false;
  }

  public defaultOptions(): CustomSeriesOptions {
    return customSeriesDefaultOptions;
  }

  public destroy(): void {
    this._paneData = undefined;
  }
}
