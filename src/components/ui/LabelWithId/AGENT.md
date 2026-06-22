LabelWithId always renders the user-facing label. The label span carries `data-analysis-id` so PostHog session replay `maskTextFn` substitutes the id at capture time (users still see the label). Hold Alt (debug mode via AltKeyProvider) to show an id badge alongside the label — additive debug, not a swap. Passing an id of -1 omits the badge entirely.

## When to use

- To display entity labels (analyses, drivers, etc.) while recording stable ids in PostHog replay.
- In lists, selectors, or breadcrumbs where the label is user-facing and the id is for analytics/debug only.

## When not to use

- For plain text that has no meaningful numeric identifier; use ordinary text or Label.
