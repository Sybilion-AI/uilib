---
summary: Interactive Natural Earth supply-chain map with clustering, disclosure, and optional OffscreenCanvas worker paint
---

Canvas world map for confirmed sites and routes. Hosts pass entities and edges; the map clusters nearby markers, discloses routes by zoom, and flies to a site at the current zoom.

## When to use

- Geographic supply-chain or site networks with lat/lng on confirmed nodes.
- Demo or product surfaces that need pan, zoom, hover, and clickable labels without a tile map.

## When not to use

- Decorative backdrop only — use WorldMap.
- Driver overlays on the static SVG — use DriverMap.
- Street-level tiles or Mercator web maps.

## Do

- Pass only confirmed, placed nodes you want drawn; drafts stay off the map.
- Keep geo on the host (`geo.lat` / `geo.lng`); the map does not geocode.
- Treat click callbacks as host navigation; the inspector is local UI.

## Don't

- Import onboarding or graph-workspace types into the map.
- Rely on the OffscreenCanvas worker in every bundler — main-thread paint is the fallback.

## Host provides

- `entities` and `edges` (minimal map types; compatible with onboarding shapes).
- Optional `onNodeClick` / `onEdgeSelect` and cascade dimming overlay.

## Requires

- `entities` — confirmed rows with valid `geo` appear as markers.
- `edges` — confirmed links between two placed nodes become arcs.

## Empty/loading

- No confirmed locations: status empty state. Hosts that SSR should lazy-load this component (d3-geo + TopoJSON).

Worker entry (bundler-resolved): `src/components/ui/SupplyChainMap/SupplyChainMap.render.worker.ts`. If `new Worker(new URL(..., import.meta.url))` fails after publish, painting stays on the main thread.

See [SupplyChainMap.example.tsx](src/components/ui/SupplyChainMap/SupplyChainMap.example.tsx).
