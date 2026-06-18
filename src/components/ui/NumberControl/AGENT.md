NumberControl is a numeric stepper with minus and plus buttons for adjusting a value within a bounded range. Configure min, max, and step to control the allowed values.

## When to use

- To adjust a numeric value in small, predictable increments, such as a quantity or threshold.
- When the valid range is narrow and stepping is faster than typing.

## When not to use

- For values with a wide range or many decimal places; use a plain number input instead.
- For picking one of a few discrete options; use Select or ToggleGroup.

## Do

- Always set min and max so the control cannot step out of the valid range.
