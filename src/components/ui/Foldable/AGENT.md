Foldable is a collapsible section with a clickable header that shows or hides its content. Pass the header and content as props, and use defaultUnfolded to open the section initially.

## When to use

- To tuck away secondary or advanced detail that most users do not need immediately.
- To shorten long pages by letting users expand only the sections they care about.

## When not to use

- For content users must always see, such as warnings or required form fields.
- For switching between parallel views of the same content; use Tabs instead.

## Do

- Write headers that describe the hidden content, so users can decide whether to expand.
- Set defaultUnfolded when the content is important enough to show on first view.
