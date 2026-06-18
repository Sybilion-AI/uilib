WorldMap renders a bundled SVG map of the world, intended as a backdrop for geographic visualisations such as DriverMap. It scales to its container and accepts a className for positioning.

## When to use

- As the base layer for geographic overlays, such as markers or regional highlights.
- For decorative or contextual world imagery that should ship with the bundle rather than load from a network.

## When not to use

- When interactive map features such as zooming, panning, or tiles are needed; use a mapping library instead.
- For precise geographic data where projection accuracy matters.
