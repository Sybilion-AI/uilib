DropZone is a file upload target that accepts a dragged file or opens the system file picker on click. Restrict accepted types with the accept prop and receive the chosen file in the onFile callback.

## When to use

- When uploading a file is a primary step in a flow, such as importing a dataset.
- When drag and drop is a natural interaction, for example on desktop-focused screens.

## When not to use

- In compact layouts where a large drop target wastes space; use a simple file input or button instead.
- When users need to manage multiple attachments inline; pair an upload control with FileChip rows.

## Do

- Set accept to the formats you can actually process, and repeat them in the label so expectations are clear.
- Show the selected file name after a drop so users get immediate confirmation.
