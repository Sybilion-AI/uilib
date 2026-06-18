The chat composer can be prefilled without auto-sending: pass promptPrefill to ChatChrome, call ChatSheetActions.openNewChatWithPrefill for the portal sheet, or use a ?prompt= deep link. Focus lands at the end of the text so users can edit before submitting.

## When to use

- To seed the composer from a call to action, such as a suggested question on a dataset page.
- To deep link into the product with a prepared prompt via ?prompt=.
- When opening a new chat session that should start from a template prompt.

## When not to use

- To send a message automatically on behalf of the user; prefill never submits.

## Do

- Keep prefilled text short and editable; it is a starting point, not a command.
