Colour is defined as a set of core ramps (--sb-cyan/purple/red/green/yellow/gray/slate) plus semantic tokens that map those ramps onto roles such as background, border, brand, and status. Components should reference semantic tokens first and reach for a raw ramp step only when no role fits.

## When to use

- Semantic tokens for surfaces, text, borders, links, and status colour in components. For links, set only `--link-color` per theme; `--link-color-hover` and `--link-color-active` derive from it via `color-mix`.
- Ramp steps for data visualisation or decorative accents where a specific hue is needed.

## When not to use

- Hardcoded hex or oklch values in component styles; always go through a token.
