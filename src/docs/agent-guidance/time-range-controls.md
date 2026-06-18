TimeRangeControls renders a row of preset time range toggles, such as one month or one year, for switching the window of a chart. Control it with timeRange and onTimeRangeChange, and pass loading to disable the controls while data refreshes.

## When to use

- Above or beside a time series chart to let users change the visible window.
- When a small set of preset ranges covers the common cases.

## When not to use

- When users need arbitrary start and end dates; use a date range picker instead.
- For switching between categories or views unrelated to time; use Tabs or ToggleGroup.

## Do

- Set loading while data for a new range fetches, so users cannot trigger overlapping requests.
