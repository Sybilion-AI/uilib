---
profiles: [workspace, content]
summary: Layout wrapper that molds adjacent Button children into one segmented control.
---

ButtonGroup is a layout wrapper for two or more adjacent buttons. It removes gaps and inner corner radii so outline and secondary actions read as a single segmented control while each button keeps its own click handler.

## When to use

- To present a small set of related actions side by side, such as pagination or view toggles implemented with Button.
- To group outline buttons that share a border, such as filter presets or export format choices.
- When each segment needs its own label and handler but should look like one control.

## When not to use

- For mutually exclusive selection state; use ToggleGroup or Tabs instead.
- For a single action; use Button alone.
- When buttons are not direct children of the wrapper.

## Do

- Place Button elements as direct children of ButtonGroup.
- Use the outline variant when adjacent borders should read as one shared edge.
- Keep segment labels short so the group stays compact.

## Don't

- Nest ButtonGroup inside Button or wrap non-button elements expecting grouped styling.
- Use ButtonGroup for navigation between pages; use links or Tabs instead.
