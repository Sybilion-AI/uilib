Select is a Radix-based dropdown for choosing a single option from a list. Compose it from Select, SelectTrigger, SelectValue, SelectContent, and SelectItem, and pick a trigger variant and size to match the surrounding controls.

## When to use

- To choose one option from a list of roughly five or more items.
- In forms, toolbars, and filters where space is limited and options collapse behind a trigger.
- For a filterable single choice: pass `searchable` on `Select`.

## When not to use

- For two to four options that benefit from being visible at once; use ToggleGroup or radio buttons.
- For multi-select lists; use a multi-select component.

## Do

- Use the clear variant for low-emphasis, inline selects embedded in text or toolbars.
- Pass `searchable` on `Select` when the list should be filtered by typing in the trigger.
