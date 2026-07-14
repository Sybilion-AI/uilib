ChatChrome is the complete chat shell: message list, prompt composer, empty state, and optional preset bubbles. Drive it with useChatPanelChromeModel for a self-contained session, or wire the props manually for full control.

## When to use

- To embed an assistant conversation inline on a page or in a side panel.
- When you want preset prompt chips scoped to the current dataset or context.

## When not to use

- For a single one-off prompt without conversation history; a simple form may suffice.
- For notification or activity feeds; the shell is designed for two-way conversation.

## Do

- Provide a meaningful emptyState title and description so the first-run view explains what the assistant can do.

## Composer prefill

The chat composer can be prefilled without auto-sending: pass `promptPrefill` to `ChatChrome`, call `ChatSheetActions.openNewChatWithPrefill` for the portal sheet, or use a `?prompt=` deep link. Focus lands at the end of the text so users can edit before submitting.

### When to use

- To seed the composer from a call to action, such as a suggested question on a dataset page.
- To deep link into the product with a prepared prompt via `?prompt=`.
- When opening a new chat session that should start from a template prompt.

### When not to use

- To send a message automatically on behalf of the user; prefill never submits.

### Do

- Keep prefilled text short and editable; it is a starting point, not a command.
