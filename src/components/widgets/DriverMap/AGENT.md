# DriverMap

Renders: world map with regional driver badges, bottom strip for world-level drivers, selection highlight.

Use when: geographic driver exploration for one analysis.
Not when: driver detail metrics card alone (pair with DriverCard) or normalized series chart (use DriversComparisonChart).

Host provides:

- `drivers` as `DriverData[]` from analysis API
- Controlled `selectedDriver` + `setSelectedDriver`
- `isLoading` while fetching drivers

Report tile: `drivers_map` — tile resolves analysis id, fetches drivers, passes list + selection (see EmbeddedAnalysisSelector pattern).

Requires: `drivers`; `isLoading`; `selectedDriver`; `setSelectedDriver`.

Empty/loading: `isLoading` shows overlay; empty `drivers` leaves map without badges.
