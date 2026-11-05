TimeRangeControls renders a row of preset time range toggles, such as one month or one year, for switching the window of a chart. Control it with timeRange and onTimeRangeChange, and pass loading to disable the controls while data refreshes. Below 768px the same presets show as a select instead of the toggle row, so the control stays on a phone; a range that is not a preset (one dragged on the chart) selects no toggle and shows "Custom" in the select. Pass variant="segmented" for the compact look (small buttons on a grey track, the picked one raised); ChartAreaInteractive passes it through as timeRangeVariant, and its headerTitle puts a one-line summary at the start of the same row, with the control at the end.

## When to use

- Above or beside a time series chart to let users change the visible window.
- When a small set of preset ranges covers the common cases.

## When not to use

- When users need arbitrary start and end dates; use a date range picker instead.
- For switching between categories or views unrelated to time; use Tabs or ToggleGroup.

## Do

- Set loading while data for a new range fetches, so users cannot trigger overlapping requests.
