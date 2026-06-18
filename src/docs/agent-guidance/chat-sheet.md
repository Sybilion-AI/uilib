ChatSheet places the chat panel behind a trigger in the page header and portals it into the shell chat slot, matching the app dataset page integration. Presets, slash commands, and the empty state are passed through to the underlying chat shell.

## When to use

- When chat is a secondary tool on the page and should open on demand from the header.
- To reuse one assistant entry point across pages with page-scoped presets.

## When not to use

- When the conversation is the primary content of the page; embed ChatChrome inline instead.

## Do

- Give each page its own scopeId so chat sessions do not leak between contexts.
