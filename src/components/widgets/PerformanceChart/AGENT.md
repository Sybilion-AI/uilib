PerformanceChart is a widget for evaluating forecast accuracy. It plots per-horizon and spaghetti views of model and drift forecasts against historical data, linked to a metrics table with MAE and MAPE, and handles loading, empty, and run-analysis-hint states.

## When to use

- To present backtest or performance-analysis results for a dataset’s forecasting models.
- To compare forecast horizons against actuals, including optional custom series matrices.

## When not to use

- For plain historical or forecast charts without performance metrics; use ChartAreaInteractive or LightweightForecastChart.
- When no performance analysis exists yet; show a call to action to run one instead.

## Do

- Wire the loading, empty, and hint props to your data-fetch state so the widget shows the right placeholder.

## Report tile

- `performance_chart` — host loads performance payload + dataset series.

## Host provides

- `performanceData` (PerformanceChartPayload) and `historicalData` from performance API
- Optional `forecastData`, `customPerformanceMatrix`, `userSeries` for spaghetti

## Requires

- `performanceData` — model/drift forecasts and metrics; `historicalData` — baseline series; `loading` / `chartLoading` / `performanceDataLoading` — spinners; `runAnalysisHint` / `statusHint` — empty states.

## Empty/loading

- loading props show shimmer/spinner; null `performanceData` with `runAnalysisHint` prompts to run analysis.
