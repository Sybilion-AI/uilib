PageTabs renders a page-scoped tab bar with optional panels. The tab strip scrolls horizontally when triggers overflow the container, and an outline variant is available for muted surfaces.

## When to use

- To divide a page into a few parallel views that share the same context.
- When the tab row may overflow on narrow viewports and needs built-in horizontal scrolling.

## When not to use

- Inside a PageContentSection; PageTabs is a page-structure primitive and must sit alongside sections.
- For sequential steps in a flow; use a wizard or stepper pattern instead.

## Do

- Wrap each tab’s content in its own PageContentSection so padding stays consistent.

## Don't

- Don’t nest PageTabs inside another PageTabs or a PageContentSection.
