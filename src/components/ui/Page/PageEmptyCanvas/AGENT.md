PageEmptyCanvas renders a centered empty state with a `title`, a `hint` (string or ReactNode), and an optional `children` slot for a CTA. It centers itself, grows to fill remaining height (`flex-grow: 1`, `min-height: 280px`), and caps its width so the empty state stays scannable.

## When to use

- When a route or view has no data yet and the user should see a clear next step instead of a blank panel.
- As the primary empty state for a route: place it directly in `PageContent` (typically inside a `PageContentSection`) for empty list, first-run, or no-results views.

## When not to use

- Inside a `Card`, nested widget, or other small container; PageEmptyCanvas is a page-level surface meant to sit directly in `PageContent`.
- For error states with recovery actions that need structured layout; build a dedicated section instead.

## Do

- Place directly inside `PageContent` (in a `PageContentSection`), not inside `Card` or extra centered flex wrappers — it centers itself.
- Pass a concise `title` and a `hint` that tells the user what to do next.
- Put the primary action (e.g. a `Button`) in `children` so it sits below the hint.
