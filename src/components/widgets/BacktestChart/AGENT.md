BacktestChart shows how a forecast did in the past against the simplest baseline, the last known value held flat. It draws the actual values (solid), and from each past month a forecast was made in (an origin) the forecast out to one horizon (dashed, with a dot where it lands) and the origin's value held flat over the same months (dotted grey). Under the chart, one line per window says how much of the baseline's error the forecast removes, with both mean absolute percentage errors (MAPE).

## When to use

- To show that a forecast beats knowing only the last price, for one horizon at a time.

## When not to use

- For the latest forecast with its range; use ChartAreaInteractive.
- For every horizon of every vintage at once; use PerformanceChart's spaghetti view.

## Do

- Cut each origin's `forecast` to the horizon shown: its last point is the landing month the scores use.
- Set an origin's `value` to the actual value at the origin month (the last price known when the forecast was made), and leave out an origin with none.
- `windows` (default 24 and 12) are the last N months with an actual value; a window longer than the actuals, or with no landing in it, has no line.
- `backtestScore(actuals, origins, months)` is the same computation, for a score shown elsewhere.
- Only forecasts are dashed: the baseline is dotted and the actuals solid.

## Requires

- `actuals`: one point per month, ISO dates (`2024-03-01`) that sort as text.
- `origins`: `{ date, value, forecast: [{ date, value }] }`, forecast in date order.
