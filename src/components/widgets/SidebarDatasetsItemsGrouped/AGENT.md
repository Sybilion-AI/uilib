# SidebarDatasetsItemsGrouped

Renders: expandable sidebar groups of datasets (by target type, regions, or categories).

Use when: app shell needs grouped dataset navigation.
Not when: in-page or report content (no sidebar slot).

Host provides:

- `datasets` list (`SidebarDatasetsItemsGroupedDataset`)
- `groupBy`, `selectedDatasetId`, `onDatasetClick`
- Optional `preItems` / `postItems`, `defaultExpandedGroupNames`

Report tile: Not used in report tiles.

Requires: `datasets`; `groupBy`; `onDatasetClick` for navigation.

Empty/loading: empty `datasets` renders no groups; loading handled by host before pass-in.
