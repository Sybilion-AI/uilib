ChartContainer wraps Recharts charts with the library’s theming, mapping a ChartConfig of labels and colours onto CSS variables. Compose any Recharts chart inside it and reference series colours via var(--color-<key>).

## When to use

- To build bespoke line, bar, or area charts that follow the design system palette.
- When you need full control over Recharts composition but consistent theming.

## When not to use

- For the standard time series experience with range controls and overlays; use ChartAreaInteractive.

## Do

- Define every series in the ChartConfig so labels and colours stay consistent across tooltips and legends.
- With BaseChartWrapper or ChartAreaInteractive, pass `formatTooltipValue` so tooltip numbers match the axis format, and `connectHistoryNulls` / `connectForecastNulls` (or a band's `connectNulls: false`) to choose whether a line or range bridges a month with no value.
- `showAxes={false}` hides the axes but keeps them: the tooltip still names the row's date and `yMin`/`yMax` still hold.
- Use ChartTooltip (not Recharts' Tooltip directly) so a chart narrower than 500px (`NARROW_CHART_PX`) opens its tooltip under the chart instead of over the lines. BaseChartWrapper, ChartAreaInteractive, BarChart, DonutChart, StackedAreaChart and the driver card chart already do. A parent that hides overflow (a chat bubble, a card) can clip it there. Pass `position` to place it yourself.

## Example

- [Chart.example.tsx](src/components/ui/Chart/Chart.example.tsx) — line chart demo with ChartContainer and Recharts.
