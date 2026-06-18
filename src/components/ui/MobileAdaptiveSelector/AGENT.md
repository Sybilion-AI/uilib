MobileAdaptiveSelector presents a single-choice control that renders as a toggle group on desktop and switches to a select dropdown on mobile, or whenever the item list is too long for a row of toggles. It keeps one value and onChange contract across both presentations.

## When to use

- To switch between a small set of mutually exclusive options that must stay usable on narrow viewports.
- For view or mode switchers, such as grouping or time-range pickers, that appear in responsive layouts.

## When not to use

- For multi-select choices; use a checkbox group or multi-select instead.
- When the presentation must stay fixed across breakpoints; use ToggleGroup or Select directly.

## Do

- Keep labels short so the desktop toggle row does not overflow.
