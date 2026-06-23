Renamer wraps a displayed name with an inline rename affordance: a pencil control switches the text into an editable field and commits the new value through onChange. The children render the current display state.

## When to use

- To let users rename an entity, such as a dataset or report, in place without a dialog.
- In headers or list rows where the name is the primary editable property.

## When not to use

- For multi-field editing; open a form or dialog instead.
- When renaming requires validation feedback or confirmation before saving.

## Do

- Persist the new name in onChange and reflect it back in value so the display stays in sync.
