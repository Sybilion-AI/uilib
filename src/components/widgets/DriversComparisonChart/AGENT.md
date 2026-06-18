DriversComparisonChart plots a normalized target line against the normalized series of its drivers, with a table of drivers underneath. The Lagged and Overlapped view tabs control whether driver series are shifted by their reported lag or aligned in time, and table rows toggle each series on the chart.

## When to use

- To show how individual drivers move relative to a backtested target over time.
- When users need to compare lagged and contemporaneous alignment of driver series.
- When the driver table and the chart should stay linked, so hiding a row hides its line.

## When not to use

- For a single series with no target to compare against; use ChartAreaInteractive directly.
- When drivers lack normalized series data; the chart needs a populated payload to be useful.

## Do

- Provide a statusHint when the payload is empty so users understand why the chart is blank.
- Control viewTab from the page when an external Lagged/Overlapped switcher should stay in sync.

## Report tile

- `drivers_comparison_chart` — host loads normalized backtests payload + dataset historical.

## Host provides

- `payload`: BacktestsComponentPayload from platform SDK (host fetch per analysis)
- Optional `datasetHistorical` overlay
- `seriesInitKey` when selected analysis changes
- `viewTab` / `onViewTabChange`: `lagged` (calendar-aligned, raw dates) or `overlapped` (driver series shifted backward by parsed lag months)
- View tabs: host should render uilib `Tabs variant="button"` with **Lagged** / **Overlapped** in the toolbar. Chart applies `applyDriversComparisonViewToPayload` internally.

## Requires

- `payload` — target + driver normalized_series; `loading` / `chartLoading` — spinners; `seriesInitKey` — reset visible series on analysis or view tab change; `runAnalysisHint` / `statusHint` — empty/error text.
- Lag column: **Lagged** shows API `lag` string (may be a range). **Overlapped** shows single `N month(s)` from `parseLagMonthsFromLabel` (range uses max month).
- Historical window: lead-in is anchored to the **lagged** (unshifted) view (`computeDriversComparisonHistoricalWindowFloor`); overlapped tab shifts driver lines backward only — switching tabs does not change historical extent when floor is pinned.

## Empty/loading

- loading props shimmer chart; null `payload` with `runAnalysisHint` prompts to run analysis.
