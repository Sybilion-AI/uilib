LabelWithId renders a text label preceded by a small numeric id badge, giving entities such as analyses a stable, scannable reference. Passing an id of -1 hides the badge and shows the label alone.

## When to use

- To display entities that users reference by number, such as analyses or saved items.
- In lists, selectors, or breadcrumbs where the id helps users match items across views.

## When not to use

- For plain text that has no meaningful numeric identifier; use ordinary text or Label.
