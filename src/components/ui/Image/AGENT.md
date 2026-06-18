Image is a thin wrapper around the native img element that loads a remote URL and accepts a fallback for when the request fails. Use it as the standard way to render external images in the library.

## When to use

- To display remote images such as article thumbnails or user-provided media.
- When you want a consistent image element with built-in fallback support.

## When not to use

- When you need visible error handling with custom fallback content; use ImageWithFallback.
- For purely decorative backgrounds; prefer CSS backgrounds so they stay out of the accessibility tree.

## Do

- Always provide meaningful alt text, or an empty alt for decorative images.
- Constrain the image with max-width or explicit dimensions to avoid layout shift.
