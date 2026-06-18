ChartAreaInteractive is the full chart shell for time series data, combining an area chart with a time range selector, a legend with series toggles, and optional forecast overlays. Overlay modes add month pinning, quantile interval bands, or threshold controls on top of the base chart.

## When to use

- To present historical and forecast series together with built-in time range filtering.
- When users need to toggle series visibility, pin a month, or inspect quantile intervals and thresholds.
- As the main visualisation on an analysis or dataset page.

## When not to use

- For a simple static chart without controls; compose ChartContainer with Recharts directly.
- For non-temporal data such as categorical comparisons.

## Do

- Pass loading while data is being fetched so the chart shows its skeleton state.

## Report tile

- `dataset_card` — host loads dataset + analysis; chart inside dashboard card.

## Host provides

- `chartData`, `forecastData` built from API
- `timeRange` / `onTimeRangeChange` or brush-only range
- Optional `mode`: pin | intervals | thresholds + overlay state

## Requires

- `chartData`; `forecastData`; `loading`; `toggleLegendSeries` / `ensureAnalysisSeriesVisible` when legend is external.

## Empty/loading

- `loading`, `error`; empty data shows chart empty state via host message props.
