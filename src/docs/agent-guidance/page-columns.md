PageColumns lays out a responsive row of columns inside a page section. Omit fill for equal columns; use left or right for main-plus-aside layouts on wide viewports.

## When to use

- To place two or more content blocks side by side within a PageContentSection.
- For main-plus-aside layouts where one column should grow and the other stays at a fixed width.
- For 3- or 4-column equal dashboards (metrics rows, panel groups) without fill.

## When not to use

- For card or tile grids; use GridLayout instead.
- For arbitrary flex layouts inside a component; PageColumns is a page-structure primitive.

## Do

- For 3 or 4 equal columns, omit fill (default); do not use left/right.
- Use fill=
- or fill=
- to keep a sidebar column at the default fixed width on wide screens (2 columns only).
