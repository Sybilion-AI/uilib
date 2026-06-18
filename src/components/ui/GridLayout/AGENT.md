GridLayout is a responsive CSS grid that fits as many columns as the container allows, with each cell keeping at least colWidth before wrapping to a new row. Adjust spacing with the gap prop and change the root element with the polymorphic as prop.

## When to use

- To lay out cards, tiles, or widgets in a dashboard-style grid inside a page section.
- When the number of items varies and the grid should adapt to the viewport without media queries.

## When not to use

- For two fixed page columns such as main content plus an aside; use PageColumns.
- For a fixed 3–4 column content row with equal peers; use PageColumns without fill.
- For items of very different sizes that need manual placement; use custom CSS grid instead.

## Do

- Tune colWidth to the smallest width at which a tile still reads comfortably.
- Use spacing tokens such as var(--p-4) for the gap to stay consistent with the rest of the page.
