InteractiveContent renders assistant-style plain text with inline formatting: bold and italic emphasis, inline code via <code> tags or backticks, markdown and HTML links, and bare URLs converted into clickable links. The inline variant omits block-level features such as headings and markdown bullets.

## When to use

- To display assistant or model-generated text that may contain markdown emphasis and raw URLs.
- For release note bullets and other compact labels that need lightweight inline formatting.
- When plain text needs lightweight formatting without a full markdown renderer.

## When not to use

- For trusted, authored content with rich structure such as headings, lists, or code blocks; use a full markdown component.
- For static UI copy that needs no formatting; render the text directly.

## Do

- Use the inline variant when the text sits inside a sentence, list item, or compact label.
- In release notes markdown, write list bullets as
- in the source file; the parser strips the leading
- and renders each item inside a list — do not repeat
- inside the item string.
- Wrap inline code with <code>…</code> or backticks (`…`); both render as monospace code.
