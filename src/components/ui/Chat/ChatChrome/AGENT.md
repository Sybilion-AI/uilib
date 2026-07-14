ChatChrome is the complete chat shell: message list, prompt composer, empty state, and optional preset bubbles. It supports a file dropzone: users drag text, Office, or PDF files onto the chat panel and the parsed content attaches to the prompt until they send. Configure accepted types via `allowedAttachments` and enable PDFs with `allowPdfAttachments`.

## When to use

- To embed an assistant conversation inline on a page or in a side panel.
- When you want preset prompt chips scoped to the current dataset or context.
- When users need to give the assistant file context, such as CSV data or documents.
- When attached files should be reviewed alongside the typed prompt before sending.

## When not to use

- For a single one-off prompt without conversation history; a simple form may suffice.
- For notification or activity feeds; the shell is designed for two-way conversation.
- For persistent file uploads to storage; use a dedicated upload flow.
- When only plain text input is expected; omit the attachment props to disable the dropzone.

## Do

- Provide a meaningful emptyState title and description so the first-run view explains what the assistant can do.
- Office and PDF parsers load on demand, so the first attachment of those types incurs a one-off load.

## Slash commands

ChatChrome's composer supports a slash command palette built on TipTap mentions: typing `/` at the start of a line or after a space opens a picker, and choosing an item inserts an inline mention chip. Configure the palette by passing `slashCommandItems` to `ChatChrome` (or to `ChatSheet`, which forwards it to the underlying shell). Each item accepts optional `className` and `color` to style its chip.

### When to use

- To expose a small set of named commands users can invoke from the composer.
- When commands should read as part of the message, such as `/generate-report`.

### When not to use

- For long or hierarchical command sets; the palette works best with a handful of items.
- For primary actions that deserve a visible button outside the composer.

### Do

- Keep command ids stable, since plain-text sends fall back to the item id.

## User file attachments

User messages rendered by ChatChrome can carry downloadable text file attachments via the `userTextFileAttachments` field on a `Message`: the bubble shows the message text with a separate file row beneath it, matching the dashboard preset pattern. Users can download the attached file from that row.

### When to use

- When a preset or automated flow sends data, such as a CSV extract, on the user's behalf.
- To keep generated file context visible and retrievable in the conversation history.

### When not to use

- For user-initiated uploads; use the attachments dropzone instead.

### Do

- Give each attachment a readable displayName so the file row makes sense out of context.
