# PerformanceChart (agent notes)

Forecast **performance** widget on **`ChartAreaInteractive`**: **per-horizon** tab (24m window, horizon selector, model/drift/custom lines, MAE/MAPE table) and **spaghetti** tab (all horizons overlaid).

## Host must supply

- **`performanceData`**: `PerformanceChartPayload` (`model` / `drift` with `forecasts` per `horizon_*`, `metrics_history`)
- **`historicalData`**: `ChartDataPoint[]`
- Optional: **`forecastData`**, **`customPerformanceMatrix`**, **`userSeries`** / **`spaghettiUserSeries`**
- Loading/empty: **`loading`**, **`chartLoading`**, **`performanceDataLoading`**, **`runAnalysisHint`**, **`statusHint`**
- Analysis selection and API fetch live **outside** this widget

## Runnable demo

`src/docs/pages/PerformanceChartPage.tsx` (uilib docs app, **Widgets** section).

## Discovery index for standalone apps

**[sybilion-app-template/docs/AGENT_UI_GLOSSARY.md](../../../../../sybilion-app-template/docs/AGENT_UI_GLOSSARY.md)** — import line and pointers; no prop list here. Types: `dist/esm/types/…/PerformanceChart` after install.
