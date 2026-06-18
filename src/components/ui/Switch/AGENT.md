Switch is a binary control for turning a setting on or off. Unlike a checkbox, a switch implies the change takes effect immediately, without a separate save step.

## When to use

- For settings that apply instantly, such as enabling notifications or a feature flag.
- When the two states are clearly opposites, such as on and off.

## When not to use

- In forms where changes are committed by a submit action; use Checkbox instead.
- For selecting one of several options; use RadioGroup, Toggle, or ToggleGroup.

## Do

- Pair the switch with a Label linked via htmlFor so the state being controlled is clear.
