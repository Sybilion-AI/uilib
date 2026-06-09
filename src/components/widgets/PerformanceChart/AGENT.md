# PerformanceChart

Renders: forecast performance on ChartAreaInteractive — per-horizon tab (24m window, MAE/MAPE table) and spaghetti tab (all horizons overlaid).

Use when: dataset performance tab with horizon selector and error metrics.
Not when: simple forecast card or driver backtests — use ChartAreaInteractive or DriversComparisonChart.

Host provides:

- `performanceData` (PerformanceChartPayload) and `historicalData` from performance API
- Optional `forecastData`, `customPerformanceMatrix`, `userSeries` for spaghetti

Report tile: `performance_chart` — host loads performance payload + dataset series.

Requires: `performanceData` — model/drift forecasts and metrics; `historicalData` — baseline series; `loading` / `chartLoading` / `performanceDataLoading` — spinners; `runAnalysisHint` / `statusHint` — empty states.

Empty/loading: loading props show shimmer/spinner; null `performanceData` with `runAnalysisHint` prompts to run analysis.
