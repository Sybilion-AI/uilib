SidebarDatasetsItemsGrouped renders expandable sidebar groups of datasets, bucketed by target type, region, or category. Each group toggles open to show dataset links with selection highlight; the group containing the selected dataset opens automatically.

## When to use

- When the app shell sidebar needs grouped dataset navigation instead of a flat list.
- To let users browse datasets by target type, region, or category with collapsible sections.
- When selection should highlight both the active dataset and its parent group.
- Alongside `preItems` / `postItems` to sandwich custom nav entries around the grouped list.

## When not to use

- In-page or report content where no sidebar slot exists.
- For a flat dataset list without grouping; render individual `SidebarMenuItem` entries instead.
- When datasets lack the metadata needed for the chosen `groupBy` key (regions, categories, or target type).

## Do

- Pass `selectedDatasetId` and `onDatasetClick` so clicks navigate and the active dataset stays highlighted.
- Set `defaultExpandedGroupNames` when specific groups should start open; omit it to start collapsed and rely on auto-expand for the selected dataset's group.
- Handle loading before passing `datasets`; the widget has no built-in loading state.

## Host provides

- `datasets` as `SidebarDatasetsItemsGroupedDataset[]` from the datasets API
- `groupBy` — `'target_type'`, `'regions'`, or `'categories'`
- `selectedDatasetId` and `onDatasetClick` for controlled navigation
- Optional `preItems` / `postItems`, `defaultExpandedGroupNames`, `className`

## Requires

- `datasets`; `groupBy`; `onDatasetClick` for navigation.

## Empty/loading

- Empty `datasets` renders no groups; loading is handled by the host before pass-in.
