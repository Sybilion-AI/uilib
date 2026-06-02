# DriversComparisonChart

Renders: target vs drivers backtests chart with ChartAreaInteractive plus table; row click toggles series visibility.

Use when: drivers comparison tab with normalized target and driver series from backtests payload.
Not when: geographic map or performance horizons — use DriverMap or PerformanceChart.

Host provides:

- `payload`: BacktestsComponentPayload from platform SDK (host fetch per analysis)
- Optional `datasetHistorical` overlay
- `seriesInitKey` when selected analysis changes
- `viewTab` / `onViewTabChange`: `lagged` (calendar-aligned, raw dates) or `overlapped` (driver series shifted backward by parsed lag months)

View tabs: host should render uilib `Tabs variant="button"` with **Lagged** / **Overlapped** in the toolbar (analysis selector left, tabs right). Chart applies `applyDriversComparisonViewToPayload` internally.

Report tile: `drivers_comparison_chart` — host loads normalized backtests payload + dataset historical; built-in analysis selector.

Requires: `payload` — target + driver normalized_series; `loading` / `chartLoading` — spinners; `seriesInitKey` — reset visible series on analysis or view tab change; `runAnalysisHint` / `statusHint` — empty/error text.

Lag column: **Lagged** shows API `lag` string (may be a range). **Overlapped** shows single `N month(s)` from `parseLagMonthsFromLabel` (range uses max month).

Historical window: lead-in is anchored to the **lagged** (unshifted) view (`computeDriversComparisonHistoricalWindowFloor`); overlapped tab shifts driver lines backward only — switching tabs does not change historical extent when floor is pinned.

Empty/loading: loading props shimmer chart; null `payload` with `runAnalysisHint` prompts to run analysis.
