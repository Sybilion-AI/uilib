/**
 * Categorical series palette for charts.
 * Uses --sb-* ramp tokens so colours follow the active theme.
 */
export const CHART_SERIES_PALETTE: readonly string[] = [
  'var(--sb-cyan-500)',
  'var(--sb-purple-500)',
  'var(--sb-green-600)',
  'var(--sb-yellow-500)',
  'var(--sb-red-500)',
  'var(--sb-slate-400)',
];

export function getChartSeriesColor(index: number): string {
  return CHART_SERIES_PALETTE[index % CHART_SERIES_PALETTE.length];
}
