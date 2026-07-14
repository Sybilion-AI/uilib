ChatSheet portals the chat panel into the shell chat slot; the consumer supplies a trigger element wherever it fits the page layout (commonly the page header actions area, but not required). Presets, slash commands, and the empty state are passed through to the underlying chat shell.

## When to use

- When chat is a secondary tool on the page and should open on demand from a trigger you place in the layout.
- To reuse one assistant entry point across pages with page-scoped presets.

## When not to use

- When the conversation is the primary content of the page; embed ChatChrome inline instead.

## Do

- Give each page its own scopeId so chat sessions do not leak between contexts.
