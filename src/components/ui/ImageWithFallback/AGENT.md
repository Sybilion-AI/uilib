ImageWithFallback renders an image from a URL and swaps in the provided fallback content when the image fails to load. The fallback can be any node, such as a placeholder icon or a short message.

## When to use

- When image URLs come from external or user-supplied sources and may be broken.
- When the layout must stay intact even if an image never loads, such as in cards or lists.

## When not to use

- When the image is bundled with the app and guaranteed to exist; plain Image is enough.

## Do

- Give the fallback the same footprint as the image so the layout does not jump on error.
- Keep fallback content simple, such as an icon or short label, rather than a detailed error message.
