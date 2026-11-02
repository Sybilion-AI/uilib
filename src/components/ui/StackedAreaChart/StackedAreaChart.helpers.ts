import type { StackedAreaChartDatum } from './StackedAreaChart.types';

/** Data key of the margin layer. Prefixed so it cannot clash with a layer key. */
export const MARGIN_KEY = '__margin';

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/** Sum of the layers on a row; a missing value counts as 0. */
export function layersTotal(
  row: StackedAreaChartDatum,
  layerKeys: readonly string[],
): number {
  let sum = 0;
  for (const key of layerKeys) sum += num(row[key]) ?? 0;
  return sum;
}

/**
 * Rows ready to stack: every missing layer value becomes 0, and the margin
 * layer (`MARGIN_KEY`) is `pct` percent of the layers' total. Without a
 * positive `pct` the margin key is 0, so the layer can stay mounted.
 */
export function stackRows(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
  marginPct?: number | null,
): StackedAreaChartDatum[] {
  const pct = num(marginPct);
  return rows.map(row => {
    const next: StackedAreaChartDatum = { ...row };
    for (const key of layerKeys) next[key] = num(row[key]) ?? 0;
    next[MARGIN_KEY] =
      pct != null && pct > 0 ? layersTotal(next, layerKeys) * (pct / 100) : 0;
    return next;
  });
}

/**
 * Each layer's share of the total, in whole percent, at the last row whose
 * total is above zero. All zeros when no row has one.
 */
export function stackWeights(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
): Record<string, number> {
  for (let i = rows.length - 1; i >= 0; i--) {
    const total = layersTotal(rows[i], layerKeys);
    if (total <= 0) continue;
    const out: Record<string, number> = {};
    for (const key of layerKeys) {
      out[key] = Math.round(((num(rows[i][key]) ?? 0) / total) * 100);
    }
    return out;
  }
  return Object.fromEntries(layerKeys.map(key => [key, 0]));
}

export type CompareZone = {
  x1: string | number;
  x2: string | number;
  kind: 'above' | 'below';
};

/**
 * The x ranges where the compare line is above or below the stacked total
 * (layers plus the margin on rows from {@link stackRows}). A range runs from
 * the first row on one side to the row where the side changes, so adjacent
 * ranges meet. Rows without a compare value end the open range.
 */
export function compareZones(
  rows: readonly StackedAreaChartDatum[],
  xKey: string,
  layerKeys: readonly string[],
  compareKey: string,
): CompareZone[] {
  const side = (row: StackedAreaChartDatum): CompareZone['kind'] | null => {
    const line = num(row[compareKey]);
    if (line == null) return null;
    const stack = layersTotal(row, layerKeys) + (num(row[MARGIN_KEY]) ?? 0);
    if (line > stack) return 'above';
    if (line < stack) return 'below';
    return null;
  };
  const xOf = (row: StackedAreaChartDatum) => row[xKey] as string | number;

  const zones: CompareZone[] = [];
  let open: { x1: string | number; kind: CompareZone['kind'] } | null = null;
  for (const row of rows) {
    const kind = side(row);
    const x = xOf(row);
    if (!open) {
      if (kind) open = { x1: x, kind };
      continue;
    }
    if (kind === open.kind) continue;
    if (x !== open.x1) zones.push({ x1: open.x1, x2: x, kind: open.kind });
    open = kind ? { x1: x, kind } : null;
  }
  if (open && rows.length > 0) {
    const last = xOf(rows[rows.length - 1]);
    if (last !== open.x1)
      zones.push({ x1: open.x1, x2: last, kind: open.kind });
  }
  return zones;
}

const YEAR_RE = /^(\d{4})/;

/**
 * The x value of the first row in each year, when x values start with a
 * four-digit year and span at least `minYears` years; otherwise undefined.
 */
export function yearTicks(
  rows: readonly StackedAreaChartDatum[],
  xKey: string,
  minYears = 3,
): Array<string | number> | undefined {
  const seen = new Set<string>();
  const ticks: Array<string | number> = [];
  for (const row of rows) {
    const x = row[xKey];
    if (x == null) continue;
    const year = YEAR_RE.exec(String(x))?.[1];
    if (!year || seen.has(year)) continue;
    seen.add(year);
    ticks.push(x);
  }
  return ticks.length >= minYears ? ticks : undefined;
}

/** The year of a year tick's x value, or the value as text. */
export function yearLabel(x: string | number): string {
  return YEAR_RE.exec(String(x))?.[1] ?? String(x);
}
