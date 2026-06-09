# ChartAreaInteractive

Renders: time-series chart with historical line, forecast lines, optional pin / quantile-band / threshold overlays.

Use when: custom forecast UI with overlays or full chart control.
Not when: packaged performance or drivers-comparison views (use PerformanceChart or DriversComparisonChart).

Host provides:

- `chartData`, `forecastData` built from API
- `timeRange` / `onTimeRangeChange` or brush-only range
- Optional `mode`: pin | intervals | thresholds + overlay state

Report tile: `dataset_card` — host loads dataset + analysis; chart inside dashboard card.

Requires: `chartData`; `forecastData`; `loading`; `toggleLegendSeries` / `ensureAnalysisSeriesVisible` when legend is external.

Empty/loading: `loading`, `error`; empty data shows chart empty state via host message props.
