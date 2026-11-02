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
 * layer (`MARGIN_KEY`) is `pct` percent of the total of `totalKeys` (the
 * layers that are drawn; all layers by default). Without a positive `pct`
 * the margin key is 0, so the layer can stay mounted.
 */
export function stackRows(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
  marginPct?: number | null,
  totalKeys: readonly string[] = layerKeys,
): StackedAreaChartDatum[] {
  const pct = num(marginPct);
  return rows.map(row => {
    const next: StackedAreaChartDatum = { ...row };
    for (const key of layerKeys) next[key] = num(row[key]) ?? 0;
    next[MARGIN_KEY] =
      pct != null && pct > 0 ? layersTotal(next, totalKeys) * (pct / 100) : 0;
    return next;
  });
}

/**
 * Each layer's share of the total, in whole percent, at the last row whose
 * total is above zero (a negative value counts as 0). Rounded by largest remainder, so the shares add up to
 * 100. All zeros when no row has a total.
 */
export function stackWeights(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
): Record<string, number> {
  for (let i = rows.length - 1; i >= 0; i--) {
    let total = 0;
    for (const key of layerKeys) total += Math.max(num(rows[i][key]) ?? 0, 0);
    if (total <= 0) continue;
    const shares = layerKeys.map(key => {
      const exact = (Math.max(num(rows[i][key]) ?? 0, 0) / total) * 100;
      return { key, whole: Math.floor(exact), rest: exact - Math.floor(exact) };
    });
    let left = 100 - shares.reduce((sum, share) => sum + share.whole, 0);
    for (const share of [...shares].sort((a, b) => b.rest - a.rest)) {
      if (left <= 0) break;
      share.whole += 1;
      left -= 1;
    }
    return Object.fromEntries(shares.map(share => [share.key, share.whole]));
  }
  return Object.fromEntries(layerKeys.map(key => [key, 0]));
}

/**
 * The compare values with gaps between two known values filled in a straight
 * line by row, as the chart draws them (the overlays are linear lines). Rows before the first and after the
 * last known value stay null.
 */
function bridgedValues(
  rows: readonly StackedAreaChartDatum[],
  key: string,
): Array<number | null> {
  const values = rows.map(row => num(row[key]));
  let prev = -1;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value == null) continue;
    if (prev >= 0 && i - prev > 1) {
      const from = values[prev] as number;
      for (let j = prev + 1; j < i; j++) {
        values[j] = from + ((value - from) * (j - prev)) / (i - prev);
      }
    }
    prev = i;
  }
  return values;
}

export type CompareZone = {
  x1: string | number;
  x2: string | number;
  kind: 'above' | 'below';
};

/**
 * The x ranges where the compare line is above or below the stacked total
 * (the given layers plus the margin on rows from {@link stackRows}). Gaps in
 * the compare line are bridged as the line is drawn. A range runs from the
 * first row on one side to the row where the side changes, so adjacent ranges
 * meet at that row; a row where the line equals the stack ends a range and
 * starts the next. Ranges are whole rows: a crossing between two rows shows at the next.
 * Meant for a point-scale x axis, where a range starts and ends on its rows.
 */
export function compareZones(
  rows: readonly StackedAreaChartDatum[],
  xKey: string,
  layerKeys: readonly string[],
  compareKey: string,
): CompareZone[] {
  const sides = compareSides(rows, layerKeys, compareKey);
  const xOf = (i: number) => rows[i][xKey] as string | number;

  const zones: CompareZone[] = [];
  let open: { x1: string | number; kind: CompareZone['kind'] } | null = null;
  let lastOnSide = -1;
  let lastTouch = -1;
  const push = (
    range: { x1: string | number; kind: CompareZone['kind'] },
    x2: string | number,
  ) => {
    if (x2 !== range.x1) zones.push({ ...range, x2 });
  };
  for (let i = 0; i < rows.length; i++) {
    const kind = sides[i];
    if (kind === 'equal') {
      // The line touches the stack here: a range ends and the next starts.
      if (open) push(open, xOf(i));
      open = null;
      lastTouch = i;
      continue;
    }
    if (open && kind === open.kind) {
      lastOnSide = i;
      continue;
    }
    // The side changed at row i, or the line ended after lastOnSide.
    if (open) push(open, kind ? xOf(i) : xOf(lastOnSide));
    open = null;
    if (kind) {
      const from = lastTouch >= 0 && lastTouch === i - 1 ? i - 1 : i;
      open = { x1: xOf(from), kind };
      lastOnSide = i;
    }
  }
  if (open) push(open, xOf(lastOnSide));
  return zones;
}

/**
 * One zone per row on the side the compare line is on (x1 === x2), for a
 * chart that draws each row as its own bar.
 */
export function compareRowZones(
  rows: readonly StackedAreaChartDatum[],
  xKey: string,
  layerKeys: readonly string[],
  compareKey: string,
): CompareZone[] {
  const sides = compareSides(rows, layerKeys, compareKey);
  const zones: CompareZone[] = [];
  sides.forEach((kind, i) => {
    if (kind !== 'above' && kind !== 'below') return;
    const x = rows[i][xKey] as string | number;
    zones.push({ x1: x, x2: x, kind });
  });
  return zones;
}

function compareSides(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
  compareKey: string,
): Array<CompareZone['kind'] | 'equal' | null> {
  const line = bridgedValues(rows, compareKey);
  return rows.map((row, i) => {
    const value = line[i];
    if (value == null) return null;
    const stack = layersTotal(row, layerKeys) + (num(row[MARGIN_KEY]) ?? 0);
    if (value > stack) return 'above';
    if (value < stack) return 'below';
    return 'equal';
  });
}

/** A date string: a four-digit year, alone or followed by `-`. */
const YEAR_RE = /^(\d{4})(?:-|$)/;

/**
 * The x value of the first row in each year, when x values are date strings
 * (`YYYY` or `YYYY-…`) and span at least `minYears` years; otherwise undefined.
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
    if (typeof x !== 'string') continue;
    const year = YEAR_RE.exec(x)?.[1];
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
