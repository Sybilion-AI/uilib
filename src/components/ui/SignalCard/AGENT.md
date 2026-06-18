SignalCard is the product primitive for a single metric: an optional kicker and icon header, a large Manrope figure with unit and tolerance suffixes, body copy, a sparkline slot, and a footer with a delta indicator and muted meta items. Weight carries the emphasis in the numeric block, not colour.

## When to use

- To present a forecast, spot price, or index value with its direction and confidence.
- In a dashboard grid where each card answers one quantitative question.

## When not to use

- For general grouped content without a headline metric; use Card.
- For dense tabular comparisons across many series; use Table.

## Do

- Keep the footer meta short, such as horizon and confidence.
- Pass a Chip with a status variant as the delta so direction reads at a glance.
