ChartContainer wraps Recharts charts with the library’s theming, mapping a ChartConfig of labels and colours onto CSS variables. Compose any Recharts chart inside it and reference series colours via var(--color-<key>).

## When to use

- To build bespoke line, bar, or area charts that follow the design system palette.
- When you need full control over Recharts composition but consistent theming.

## When not to use

- For the standard time series experience with range controls and overlays; use ChartAreaInteractive.

## Do

- Define every series in the ChartConfig so labels and colours stay consistent across tooltips and legends.

## Example

- [Chart.example.tsx](src/components/ui/Chart/Chart.example.tsx) — line chart demo with ChartContainer and Recharts.
