DropdownMenu displays a list of actions or options in a floating panel opened from a trigger, typically a button. Group related items with DropdownMenuLabel and DropdownMenuSeparator, and handle each action in onSelect.

## When to use

- To collect secondary actions behind a single trigger, such as an overflow or kebab menu.
- When a row, card, or toolbar offers several contextual actions that would crowd the layout as buttons.

## When not to use

- To choose a value for a form field; use Select or Combobox instead.
- When there are only one or two actions; show them as buttons directly.

## Do

- Order items by expected frequency of use and separate destructive actions from the rest.
- Keep item labels short and verb-led, such as “Rename” or “Delete”.
