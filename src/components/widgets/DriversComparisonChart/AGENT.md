# DriversComparisonChart (agent notes)

**Drivers vs target** backtests: **`BacktestsComponentPayload`** from **`@sybilion/platform-sdk`**, optional **`datasetHistorical`**, chart + **driver table** (row click toggles series; first N visible by default).

## Host must supply

- **`payload`**: `BacktestsComponentPayload | null` (target `normalized_series` + drivers with `normalized_series`, `importance`, `lag`)
- **`datasetHistorical`**: optional `ChartDataPoint[]` overlay
- Analysis selector and backtests API fetch **above** the widget (e.g. **`AnalysesSelector`** + platform SDK view call)
- **`seriesInitKey`** when the selected analysis changes
- Loading/empty: **`loading`**, **`chartLoading`**, **`runAnalysisHint`**, **`statusHint`**, **`statusTone`**

## Runnable demo

`src/docs/pages/DriversComparisonChartPage.tsx` (uilib docs app, **Widgets** section).

## Discovery index for standalone apps

**[sybilion-app-template/docs/AGENT_UI_GLOSSARY.md](../../../../../sybilion-app-template/docs/AGENT_UI_GLOSSARY.md)** — import line and pointers; no prop list here. Types: `dist/esm/types/…/DriversComparisonChart` after install.
