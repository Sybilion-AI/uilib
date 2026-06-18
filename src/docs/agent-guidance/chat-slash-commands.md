The chat composer supports a slash command palette built on TipTap mentions: typing / at the start of a line or after a space opens a picker, and choosing an item inserts an inline mention chip. Supply items through slashCommandItems; optional className and color style each chip.

## When to use

- To expose a small set of named commands users can invoke from the composer.
- When commands should read as part of the message, such as /generate-report.

## When not to use

- For long or hierarchical command sets; the palette works best with a handful of items.
- For primary actions that deserve a visible button outside the composer.

## Do

- Keep command ids stable, since plain-text sends fall back to the item id.
