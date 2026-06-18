Skeleton is a loading placeholder that reserves space for content while it loads. Compose simple shapes — lines and blocks — to mirror the layout of the content that will eventually appear.

## When to use

- While fetching data for content whose layout is known in advance, such as cards, lists, or text blocks.
- To reduce layout shift by holding the space the real content will occupy.
- When loading takes long enough that an empty area would feel broken.

## When not to use

- For very fast operations where the skeleton would only flash briefly.
- For indeterminate background work with no incoming content; use a spinner or progress indicator instead.

## Do

- Match skeleton shapes to the dimensions of the real content so the swap feels seamless.
