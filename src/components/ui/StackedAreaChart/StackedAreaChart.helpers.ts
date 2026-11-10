import type { StackedAreaChartDatum } from './StackedAreaChart.types';

/** Data key of the margin layer. Prefixed so it cannot clash with a layer key. */
export const MARGIN_KEY = '__margin';
/** 1 when a row from {@link stackRows} has a value for any stacked layer, else 0. */
export const COST_KNOWN_KEY = '__costKnown';

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
 * the margin key is 0, so the layer can stay mounted. `COST_KNOWN_KEY` says
 * whether any of `totalKeys` had a value, so a row with no cost at all is
 * not compared as a cost of 0.
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
    next[COST_KNOWN_KEY] = totalKeys.some(key => num(row[key]) != null) ? 1 : 0;
    next[MARGIN_KEY] =
      pct != null && pct > 0 ? layersTotal(next, totalKeys) * (pct / 100) : 0;
    return next;
  });
}

/**
 * Each layer's share of the total, in whole percent, at the last row where
 * every layer has a value and the total is above zero; when no row is
 * complete, at the last row with a total. A negative value counts as 0.
 * Rounded by largest remainder, so the shares add up to 100. All zeros when
 * no row has a total.
 */
export function stackWeights(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
): Record<string, number> {
  const positive = (row: StackedAreaChartDatum, key: string) =>
    Math.max(num(row[key]) ?? 0, 0);
  const totalOf = (row: StackedAreaChartDatum) =>
    layerKeys.reduce((sum, key) => sum + positive(row, key), 0);
  const isComplete = (row: StackedAreaChartDatum) =>
    layerKeys.every(key => num(row[key]) != null);

  let row: StackedAreaChartDatum | undefined;
  for (let i = rows.length - 1; i >= 0 && !row; i--) {
    if (isComplete(rows[i]) && totalOf(rows[i]) > 0) row = rows[i];
  }
  for (let i = rows.length - 1; i >= 0 && !row; i--) {
    if (totalOf(rows[i]) > 0) row = rows[i];
  }
  if (!row) return Object.fromEntries(layerKeys.map(key => [key, 0]));

  const total = totalOf(row);
  const shares = layerKeys.map(key => {
    const exact = (positive(row, key) / total) * 100;
    return { key, whole: Math.floor(exact), rest: exact - Math.floor(exact) };
  });
  let left = 100 - shares.reduce((sum, share) => sum + share.whole, 0);
  for (const share of [...shares].sort((x, y) => y.rest - x.rest)) {
    if (left <= 0) break;
    share.whole += 1;
    left -= 1;
  }
  return Object.fromEntries(shares.map(share => [share.key, share.whole]));
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
 * the compare line are bridged as the line is drawn; a row with no cost is
 * on neither side. Each run of rows on one side becomes a range from its first
 * row to the row after it (where the side changes), so adjacent ranges meet
 * on a row; a row where the line touches the stack starts the next range.
 * Ranges are whole rows: a crossing between two rows shows at the next, and a
 * run of one row with no compared row after it has no width and is left out.
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
  let i = 0;
  while (i < sides.length) {
    const kind = sides[i];
    if (kind !== 'above' && kind !== 'below') {
      i++;
      continue;
    }
    let end = i;
    while (end + 1 < sides.length && sides[end + 1] === kind) end++;
    const first = sides[i - 1] === 'equal' ? i - 1 : i;
    const last =
      end + 1 < sides.length && sides[end + 1] != null ? end + 1 : end;
    if (first !== last) zones.push({ x1: xOf(first), x2: xOf(last), kind });
    i = end + 1;
  }
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
    if (value == null || row[COST_KNOWN_KEY] === 0) return null;
    const stack = layersTotal(row, layerKeys) + (num(row[MARGIN_KEY]) ?? 0);
    // Sums of decimals are not exact: 1.8 + 0.6 + 0.45 + 0.45 is not 3.3.
    const tolerance = 1e-9 * Math.max(1, Math.abs(stack), Math.abs(value));
    if (value > stack + tolerance) return 'above';
    if (value < stack - tolerance) return 'below';
    return 'equal';
  });
}

/**
 * A value axis from 0 for a top value: at most `maxIntervals` steps of
 * 1, 2, 2.5 or 5 × 10ⁿ, with a little headroom above the top. Small changes
 * in the top (a margin being typed) move the axis by one step at most,
 * instead of doubling it the way automatic rounding can. A `bottom` below 0
 * (a negative layer or line) starts the axis at a step below it, as `min`.
 */
export function valueAxis(
  top: number,
  maxIntervals = 5,
  headroom = 0.05,
  bottom = 0,
): { min?: number; max: number; ticks: number[] } {
  const low = Number.isFinite(bottom) && bottom < 0 ? bottom * (1 + headroom) : 0;
  const high =
    Number.isFinite(top) && top > 0 ? top * (1 + headroom) : low < 0 ? 0 : 1;
  let exponent = Math.floor(Math.log10((high - low) / maxIntervals));
  for (;;) {
    for (const mantissa of [1, 2, 2.5, 5]) {
      const step = mantissa * 10 ** exponent;
      const first = low < 0 ? Math.floor(low / step + 1e-9) * step : 0;
      const count = Math.ceil((high - first) / step - 1e-9);
      // Both ends round out to a step, so a range across 0 gets one more.
      if (count <= maxIntervals + (low < 0 ? 1 : 0)) {
        const ticks = Array.from({ length: count + 1 }, (_, i) =>
          Number((first + i * step).toPrecision(12)),
        );
        const max = ticks[ticks.length - 1];
        return low < 0 ? { min: ticks[0], max, ticks } : { max, ticks };
      }
    }
    exponent += 1;
  }
}

/**
 * The lowest point the stack (a negative layer or margin pulls it below 0)
 * or a line reaches; 0 when nothing is negative.
 */
export function chartBottom(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
  lineKeys: readonly string[],
): number {
  let bottom = 0;
  for (const row of rows) {
    bottom = Math.min(bottom, stackExtent(row, layerKeys)[0]);
    for (const key of lineKeys) bottom = Math.min(bottom, num(row[key]) ?? 0);
  }
  return bottom;
}

/**
 * The lowest and highest running totals up a row's stack (layers, then the
 * margin): recharts draws each layer from the total below it, so a negative
 * layer above a positive one leaves the peak below the final total.
 */
function stackExtent(
  row: StackedAreaChartDatum,
  layerKeys: readonly string[],
): [number, number] {
  let running = 0;
  let low = 0;
  let high = 0;
  for (const key of [...layerKeys, MARGIN_KEY]) {
    running += num(row[key]) ?? 0;
    low = Math.min(low, running);
    high = Math.max(high, running);
  }
  return [low, high];
}

/** The highest point the stack (layers plus margin) or a line reaches. */
export function chartTop(
  rows: readonly StackedAreaChartDatum[],
  layerKeys: readonly string[],
  lineKeys: readonly string[],
): number {
  let top = 0;
  for (const row of rows) {
    top = Math.max(top, stackExtent(row, layerKeys)[1]);
    for (const key of lineKeys) top = Math.max(top, num(row[key]) ?? 0);
  }
  return top;
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
