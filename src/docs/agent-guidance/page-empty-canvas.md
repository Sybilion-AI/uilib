PageEmptyCanvas renders a centered empty state with a `title`, a `hint` (string or ReactNode), and an optional `children` slot for a CTA. It centers itself, grows to fill remaining height, and caps its width so the empty state stays scannable.

## When to use

- When a route has no data yet and the user should see a clear next step instead of a blank panel.
- As the single child of a `PageContent` for empty list / first-run / no-results views.

## When not to use

- For loading states; use `Skeleton` or `TextShimmer` instead.
- Inside a `Card` or other small container; PageEmptyCanvas is a page-level surface with a `min-height`.
- For error states with recovery actions that need structured layout; build a dedicated section instead.

## Do

- Pass a concise `title` and a `hint` that tells the user what to do next.
- Put the primary action (e.g. a `Button`) in `children` so it sits below the hint.
- Render it directly under `PageContent`; do not wrap it in extra centered flex containers — it centers itself.
