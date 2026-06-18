SidebarDatasetsItemsGrouped renders a dataset list for the application sidebar, organised into collapsible groups with nested rows. The groupBy prop switches grouping between target type, regions, and categories, and selection is controlled through selectedDatasetId and onDatasetClick.

## When to use

- In a sidebar that lists many datasets which benefit from grouping by a shared attribute.
- When the user needs to switch between grouping dimensions without losing their selection.

## When not to use

- For short, flat lists; plain Sidebar menu items are simpler.
- Outside a sidebar surface; the widget assumes sidebar colours and spacing.
