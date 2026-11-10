ChartContainer wraps Recharts charts with the library’s theming, mapping a ChartConfig of labels and colours onto CSS variables. Compose any Recharts chart inside it and reference series colours via var(--color-<key>).

## When to use

- To build bespoke line, bar, or area charts that follow the design system palette.
- When you need full control over Recharts composition but consistent theming.

## When not to use

- For the standard time series experience with range controls and overlays; use ChartAreaInteractive.

## Do

- Define every series in the ChartConfig so labels and colours stay consistent across tooltips and legends.
- With BaseChartWrapper or ChartAreaInteractive, pass `formatTooltipValue` so tooltip numbers match the axis format, and `connectHistoryNulls` / `connectForecastNulls` (or a band's `connectNulls: false`) to choose whether a line or range bridges a month with no value.
- `historyOnTop` draws the history lines over the forecast lines, for many faint forecasts that would otherwise cover them.
- `showAxes={false}` draws no axes but keeps a hidden x-axis, so the tooltip still names the row's date; fixed `yMin`/`yMax` (with `autoScaleYAxis={false}`) still set the y range.
- `showEndDots={false}` drops the dot on each line's last point (for many lines drawn as one bundle).
- A history or forecast item's `connectNulls` overrides the chart's `connectHistoryNulls` / `connectForecastNulls` for that line. A line that is not drawn across gaps puts a dot on any point with no value on either side, so it still shows.
- `xAxisType="number"` places the rows by their `date` read as a number, spaced by value; `xTicks` names the x values to label (for example the first day of each month on a daily chart).
- Use ChartTooltip (not Recharts' Tooltip directly) so a chart narrower than 500px (`NARROW_CHART_PX`) opens its tooltip under the chart instead of over the lines, starting right under the x-axis labels (over any legend below). BaseChartWrapper, ChartAreaInteractive, BarChart, DonutChart, StackedAreaChart and the driver card chart already do. A parent that hides overflow (a chat bubble, a card) can clip it there. Pass `position` to place it yourself.

## Example

- [Chart.example.tsx](src/components/ui/Chart/Chart.example.tsx) — line chart demo with ChartContainer and Recharts.
