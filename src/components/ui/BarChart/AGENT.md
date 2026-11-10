BarChart compares values across categories. Provide rows of data, a category key, and a list of series; choose vertical or horizontal orientation and grouped or stacked mode. Grid, axes, tooltip, and legend follow the shared chart styling.

## When to use

- To compare discrete categories such as regions, models, or scenarios.
- Stacked mode when the per-category total matters as much as the breakdown.
- Horizontal orientation when category labels are long or there are many categories.

## When not to use

- For continuous time series; use ChartAreaInteractive or a line chart instead.
- For part-to-whole of a single total; use DonutChart.

## Do

- Start the value axis at zero so bar lengths stay proportional.
- Pass `valueFormatter` for the axis and `tooltipValueFormatter` for the tooltip (for example with a unit; without it the tooltip prints the raw value); `categoryTickFormatter` and `tooltipLabelFormatter` format the categories (dates, for instance).
- Name the axes with `categoryAxisLabel` and `valueAxisLabel`.
- A legend click hides or shows a series. Pass `hiddenKeys` and `onToggleKey` when the host must remember which are hidden; `hiddenKeys` alone makes the legend plain text.
