ChatChrome is the complete chat shell: message list, prompt composer, empty state, and optional preset bubbles. Drive it with useChatPanelChromeModel for a self-contained session, or wire the props manually for full control.

## When to use

- To embed an assistant conversation inline on a page or in a side panel.
- When you want preset prompt chips scoped to the current dataset or context.

## When not to use

- For a single one-off prompt without conversation history; a simple form may suffice.
- For notification or activity feeds; the shell is designed for two-way conversation.

## Do

- Provide a meaningful emptyState title and description so the first-run view explains what the assistant can do.
