import cn from 'classnames';
import { CSSProperties, ReactNode, forwardRef, useMemo } from 'react';

import type { ChartConfig } from '#uilib/components/ui/Chart';
import { ChartContainer, ChartTooltip } from '#uilib/components/ui/Chart';
import ChartS from '#uilib/components/ui/Chart/Chart.styl';
import { getChartSeriesColor } from '#uilib/components/ui/Chart/chartSeriesPalette';
import { useLegendState } from '#uilib/components/ui/Chart/hooks/useLegendState';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  XAxis,
  YAxis,
} from 'recharts';

import {
  MARGIN_KEY,
  compareRowZones,
  compareZones,
  yearTicks as findYearTicks,
  stackRows,
  stackWeights,
  yearLabel,
} from './StackedAreaChart.helpers';
import S from './StackedAreaChart.styl';
import type {
  StackedAreaChartLayer,
  StackedAreaChartOverlay,
  StackedAreaChartProps,
} from './StackedAreaChart.types';

const STACK_ID = 'stack';
const DEFAULT_BARS_BELOW = 3;
const DEFAULT_MARGIN_COLOR = 'var(--sb-slate-300)';
const DEFAULT_OVERLAY_COLOR = 'var(--foreground)';
const ZONE_FILL = {
  above: 'var(--sb-green-100)',
  below: 'var(--sb-red-100)',
} as const;
const DEFAULT_ZONE_LABELS = { above: 'above', below: 'below' };
const NO_OVERLAYS: StackedAreaChartOverlay[] = [];
/** Joins keys into one memo dependency; a key cannot hold this character. */
const KEY_SEP = '\u0000';
const splitKeys = (joined: string) => (joined ? joined.split(KEY_SEP) : []);
/**
 * Recharts 3 draws by layer: grid -100, area 100, bar 300, line 400. Zones go
 * over the grid and under the stack.
 */
const ZONE_Z_INDEX = 50;

const AXIS_LINE = { stroke: 'var(--border)', strokeWidth: 1 };

/** Recharts sorts tooltip rows with a stable sort: one key keeps the series order. */
const keepOrder = () => 0;

const layerColor = (layer: StackedAreaChartLayer, index: number) =>
  layer.color ?? getChartSeriesColor(index);
const overlayColor = (overlay: StackedAreaChartOverlay) =>
  overlay.color ?? DEFAULT_OVERLAY_COLOR;

type TooltipRow = {
  dataKey?: unknown;
  name?: unknown;
  value?: unknown;
  color?: string;
};

function StackedTooltip({
  active,
  payload,
  label,
  config,
  valueFormatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipRow>;
  label?: unknown;
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (value: string | number) => string;
}) {
  const rows = (payload ?? []).filter(
    row => typeof row.value === 'number' && Number.isFinite(row.value),
  );
  if (!active || rows.length === 0) return null;
  const x = typeof label === 'number' || typeof label === 'string' ? label : '';
  return (
    <div className={ChartS.tooltipContainer}>
      <div className="font-medium">
        {labelFormatter ? labelFormatter(x) : String(x)}
      </div>
      <div className={ChartS.tooltipContentGrid}>
        {rows.map(row => {
          const key = String(row.dataKey ?? row.name);
          const value = row.value as number;
          return (
            <div key={key} className={cn(ChartS.tooltipItem, 'items-center')}>
              <div
                className={cn(ChartS.tooltipIndicator, ChartS['indicator-dot'])}
                style={
                  {
                    '--color-bg': config[key]?.color ?? row.color,
                    '--color-border': config[key]?.color ?? row.color,
                  } as CSSProperties
                }
              />
              <div className={cn(ChartS.tooltipContent, 'items-center')}>
                <span
                  className={cn(
                    'text-muted-foreground',
                    ChartS.tooltipLabelText,
                  )}
                >
                  {config[key]?.label ?? String(row.name ?? key)}
                </span>
                <span className={ChartS.tooltipValue}>
                  {valueFormatter
                    ? valueFormatter(value)
                    : value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendEntry({
  swatch,
  label,
  extra,
  dimmed,
  onClick,
}: {
  swatch: ReactNode;
  label: ReactNode;
  extra?: ReactNode;
  dimmed?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      {swatch}
      {label}
      {extra != null && <span className={S.legendExtra}>{extra}</span>}
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={cn(ChartS.legendItem, S.legendButton, dimmed && S.dimmed)}
      aria-pressed={!dimmed}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <span className={ChartS.legendItem}>{content}</span>
  );
}

const StackedAreaChart = forwardRef<HTMLDivElement, StackedAreaChartProps>(
  (
    {
      className,
      data,
      xKey,
      layers,
      overlays = NO_OVERLAYS,
      margin,
      showWeights = true,
      yearTicks = false,
      barsBelow = DEFAULT_BARS_BELOW,
      zoneLabels = DEFAULT_ZONE_LABELS,
      hiddenKeys,
      onToggleKey,
      showLegend = true,
      showTooltip = true,
      showGrid = true,
      valueFormatter,
      xTickFormatter,
      tooltipLabelFormatter,
      height,
      ...props
    },
    ref,
  ) => {
    const legend = useLegendState();
    const hidden: ReadonlySet<string> = hiddenKeys ?? legend.hiddenSeries;
    const toggle = (key: string) => {
      onToggleKey?.(key);
      if (!hiddenKeys) legend.toggleSeries(key);
    };

    // Keyed on the joined keys, so layers passed inline do not redo the maths.
    const layerKeysJoined = layers.map(l => l.key).join(KEY_SEP);
    const visibleKeysJoined = layers
      .filter(l => !hidden.has(l.key))
      .map(l => l.key)
      .join(KEY_SEP);
    const layerKeys = useMemo(
      () => splitKeys(layerKeysJoined),
      [layerKeysJoined],
    );
    // Recharts leaves hidden layers out of the stack, so the margin and the
    // zones follow the stack that is drawn.
    const visibleKeys = useMemo(
      () => splitKeys(visibleKeysJoined),
      [visibleKeysJoined],
    );
    const marginPct = margin?.pct ?? null;
    const marginOn = marginPct != null && marginPct > 0;
    const marginLabel = margin?.label ?? `margin ${marginPct ?? 0}%`;
    const marginColor = margin?.color ?? DEFAULT_MARGIN_COLOR;

    const rows = useMemo(
      () => stackRows(data, layerKeys, marginPct, visibleKeys),
      [data, layerKeys, marginPct, visibleKeys],
    );
    const weights = useMemo(
      () => (showWeights ? stackWeights(rows, layerKeys) : undefined),
      [showWeights, rows, layerKeys],
    );
    const asBars = rows.length < barsBelow;
    const compareKey = overlays.find(o => o.compare)?.key;
    const zonesOn = compareKey != null && !hidden.has(compareKey);
    const zones = useMemo(() => {
      if (!zonesOn || compareKey == null) return [];
      const find = asBars ? compareRowZones : compareZones;
      return find(rows, xKey, visibleKeys, compareKey);
    }, [zonesOn, compareKey, asBars, rows, xKey, visibleKeys]);
    const zoneKinds = (['above', 'below'] as const).filter(kind =>
      zones.some(zone => zone.kind === kind),
    );
    const ticks = useMemo(
      () => (yearTicks ? findYearTicks(rows, xKey) : undefined),
      [yearTicks, rows, xKey],
    );

    const config = useMemo(() => {
      const out: ChartConfig = {};
      layers.forEach((layer, index) => {
        out[layer.key] = {
          label: layer.label ?? layer.key,
          color: layerColor(layer, index),
        };
      });
      out[MARGIN_KEY] = { label: marginLabel, color: marginColor };
      overlays.forEach(overlay => {
        out[overlay.key] = {
          label: overlay.label ?? overlay.key,
          color: overlayColor(overlay),
        };
      });
      return out;
    }, [layers, overlays, marginLabel, marginColor]);

    const stackProps = {
      stackId: STACK_ID,
      stroke: 'var(--background)',
      strokeWidth: 1,
      isAnimationActive: false,
    };

    return (
      <div ref={ref} className={cn(S.root, className)} {...props}>
        <ChartContainer
          config={config}
          style={height ? { height: `${height}px` } : undefined}
        >
          <ComposedChart data={rows} accessibilityLayer>
            {showGrid && (
              <CartesianGrid
                stroke="var(--border)"
                strokeWidth={0.6}
                vertical={false}
              />
            )}
            <XAxis
              dataKey={xKey}
              // A point scale runs the areas edge to edge and starts and ends
              // each zone on its rows; bars keep a band each.
              scale={asBars ? 'auto' : 'point'}
              padding={asBars ? undefined : { left: 8, right: 8 }}
              ticks={ticks}
              tickFormatter={ticks ? yearLabel : xTickFormatter}
              minTickGap={ticks ? 8 : 24}
              tickLine={false}
              axisLine={AXIS_LINE}
            />
            <YAxis
              domain={[0, 'auto']}
              tickFormatter={valueFormatter}
              width={56}
              tickLine={false}
              axisLine={AXIS_LINE}
            />
            {showTooltip && (
              <ChartTooltip
                itemSorter={keepOrder}
                content={tooltip => (
                  <StackedTooltip
                    active={tooltip.active}
                    payload={tooltip.payload as ReadonlyArray<TooltipRow>}
                    label={tooltip.label}
                    config={config}
                    valueFormatter={valueFormatter}
                    labelFormatter={tooltipLabelFormatter}
                  />
                )}
              />
            )}
            {zones.map(zone => (
              <ReferenceArea
                key={`${zone.kind}-${String(zone.x1)}`}
                x1={zone.x1}
                x2={zone.x2}
                fill={ZONE_FILL[zone.kind]}
                fillOpacity={1}
                stroke="none"
                ifOverflow="hidden"
                zIndex={ZONE_Z_INDEX}
              />
            ))}
            {layers.map((layer, index) =>
              asBars ? (
                <Bar
                  key={layer.key}
                  dataKey={layer.key}
                  name={layer.key}
                  fill={layerColor(layer, index)}
                  maxBarSize={96}
                  hide={hidden.has(layer.key)}
                  {...stackProps}
                />
              ) : (
                <Area
                  key={layer.key}
                  type="monotone"
                  dataKey={layer.key}
                  name={layer.key}
                  fill={layerColor(layer, index)}
                  fillOpacity={0.92}
                  hide={hidden.has(layer.key)}
                  {...stackProps}
                />
              ),
            )}
            {margin &&
              (asBars ? (
                <Bar
                  key={MARGIN_KEY}
                  dataKey={MARGIN_KEY}
                  name={MARGIN_KEY}
                  fill={marginColor}
                  maxBarSize={96}
                  hide={!marginOn}
                  {...stackProps}
                />
              ) : (
                <Area
                  key={MARGIN_KEY}
                  type="monotone"
                  dataKey={MARGIN_KEY}
                  name={MARGIN_KEY}
                  fill={marginColor}
                  fillOpacity={0.9}
                  hide={!marginOn}
                  {...stackProps}
                />
              ))}
            {overlays.map(overlay => {
              const color = overlayColor(overlay);
              return (
                <Line
                  key={overlay.key}
                  type="monotone"
                  dataKey={overlay.key}
                  name={overlay.key}
                  stroke={color}
                  strokeWidth={1.75}
                  dot={asBars ? { r: 4, fill: color, stroke: color } : false}
                  activeDot={false}
                  connectNulls
                  isAnimationActive={false}
                  hide={hidden.has(overlay.key)}
                />
              );
            })}
          </ComposedChart>
        </ChartContainer>

        {showLegend && (
          <div className={cn(ChartS.legendContainer, S.legend)}>
            {layers.map((layer, index) => (
              <LegendEntry
                key={layer.key}
                swatch={
                  <span
                    className={ChartS.legendIndicator}
                    style={{ backgroundColor: layerColor(layer, index) }}
                  />
                }
                label={layer.label ?? layer.key}
                extra={weights ? `${weights[layer.key] ?? 0}%` : undefined}
                dimmed={hidden.has(layer.key)}
                onClick={() => toggle(layer.key)}
              />
            ))}
            {marginOn && (
              <LegendEntry
                swatch={
                  <span
                    className={ChartS.legendIndicator}
                    style={{ backgroundColor: marginColor }}
                  />
                }
                label={marginLabel}
              />
            )}
            {overlays.map(overlay => (
              <LegendEntry
                key={overlay.key}
                swatch={
                  <span
                    className={S.legendLine}
                    style={{ backgroundColor: overlayColor(overlay) }}
                  />
                }
                label={overlay.label ?? overlay.key}
                dimmed={hidden.has(overlay.key)}
                onClick={() => toggle(overlay.key)}
              />
            ))}
            {zoneKinds.map(kind => (
              <LegendEntry
                key={kind}
                swatch={
                  <span
                    className={cn(ChartS.legendIndicator, S.legendZone)}
                    style={{ backgroundColor: ZONE_FILL[kind] }}
                  />
                }
                label={zoneLabels[kind]}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

StackedAreaChart.displayName = 'StackedAreaChart';

export { StackedAreaChart };
