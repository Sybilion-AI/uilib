Gap is a flex-grow spacer that absorbs remaining horizontal or vertical space inside a flex container. Render it between siblings when one element should stay pinned and another should push to the far edge.

## When to use

- To push toolbar actions or labels to opposite ends of a flex row.
- When a layout needs flexible empty space without hard-coded margins.

## When not to use

- For page-level section spacing; use PageContentSection or design tokens instead.
- When fixed gaps between items are enough; use CSS gap on the flex parent.
