LightweightForecastChart renders historical and forecast time series using TradingView Lightweight Charts, with optional quantile fill bands, a tooltip, and a legend. It applies the shared ensureChartForecastBridge preprocessing so forecast lines connect smoothly to the last historical point.

## When to use

- To plot a historical series alongside one or more forecast lines on a canvas-rendered chart.
- To show forecast uncertainty as stacked quantile bands, such as P10–P90 and P25–P75.
- When rendering performance matters more than the richer interactions of ChartAreaInteractive.

## When not to use

- When you need the full overlay, selection, and interaction features of ChartAreaInteractive.
- For categorical or non-time-series data; use a different chart type instead.

## Do

- Pass raw forecast anchor rows; the chart applies the bridge preprocessing internally.
- Set isDarkTheme from the active theme so colours match the surrounding page.
