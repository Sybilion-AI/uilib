DriverMap renders a world map with regional driver badges, a bottom strip for world-level drivers, and selection highlight. DriverCard shows the detail of the selected driver; both share selection state via controlled selectedDriver.

## When to use

- To give a geographic overview of where drivers originate and let users explore them by region.
- Alongside DriverCard, so selecting a driver on the map reveals its importance, lag, and summary.
- When drivers carry coordinates or region metadata that benefits from a spatial presentation.
- Geographic driver exploration for one analysis.

## When not to use

- When drivers have no meaningful geography; a table or list ranks them more clearly.
- For comparing driver series over time; use DriversComparisonChart instead.
- Driver detail metrics card alone (pair with DriverCard) or normalized series chart (use DriversComparisonChart).

## Do

- Pass isLoading to both the map and the card so their loading states stay in sync.
- Provide a driverSelector in DriverCard so users can page through drivers without using the map.

## Report tile

- `drivers_map` — tile resolves analysis id, fetches drivers, passes list + selection.

## Host provides

- `drivers` as `DriverData[]` from analysis API
- Controlled `selectedDriver` + `setSelectedDriver`
- `isLoading` while fetching drivers

## Requires

- `drivers`; `isLoading`; `selectedDriver`; `setSelectedDriver`.

## Empty/loading

- `isLoading` shows overlay; empty `drivers` leaves map without badges.
