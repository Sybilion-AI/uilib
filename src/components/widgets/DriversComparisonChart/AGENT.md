# DriversComparisonChart

Renders: target vs drivers backtests chart with ChartAreaInteractive plus table; row click toggles series visibility.

Use when: drivers comparison tab with normalized target and driver series from backtests payload.
Not when: geographic map or performance horizons — use DriverMap or PerformanceChart.

Host provides:

- `payload`: BacktestsComponentPayload from platform SDK (host fetch per analysis)
- Optional `datasetHistorical` overlay
- `seriesInitKey` when selected analysis changes

Report tile: `drivers_comparison_chart` — host loads normalized backtests payload + dataset historical; built-in analysis selector.

Requires: `payload` — target + driver normalized_series; `loading` / `chartLoading` — spinners; `seriesInitKey` — reset visible series on analysis change; `runAnalysisHint` / `statusHint` — empty/error text.

Empty/loading: loading props shimmer chart; null `payload` with `runAnalysisHint` prompts to run analysis.
