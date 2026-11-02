StackedAreaChart shows how a total is built from parts over time: cost layers stacked bottom first, an optional margin layer on top, and lines drawn over the stack (for example the prices actually paid). An overlay with `compare` shades the ranges where it sits above or below the stacked total.

## When to use

- A should-cost or cost-breakdown view: raw material, energy, labour and freight adding up to a cost, next to what was paid.
- Any time series where the parts and the total both matter.

## When not to use

- Categories without an x order; use BarChart in stacked mode.
- A single total over time; use ChartAreaInteractive.
- Parts that can be negative: the stack assumes every layer is zero or more.

## Do

- Pass rows in x order. Missing layer values stack as 0; overlay gaps are bridged.
- Give each layer a `label`; the legend and tooltip use it.
- Keep `margin.pct` in the host's state and pass it on every change; the margin layer stays mounted, so typing does not redraw the chart.
- Set `yearTicks` for multi-year monthly data so the axis reads one label per year.
- Pass `hiddenKeys` and `onToggleKey` when the host must remember which series are hidden.

## Don't

- Set `compare` on more than one overlay; only the first is used.
- Rely on areas for one or two rows; below `barsBelow` rows (default 3) the stack draws as bars.
