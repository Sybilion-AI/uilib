Avatar displays a user or entity image with an automatic fallback to initials when the image is missing or fails to load. Compose it from AvatarImage and AvatarFallback.

## When to use

- To represent a person or account in headers, lists, comments, or menus.
- When an image may be unavailable and a textual fallback is acceptable.

## When not to use

- For arbitrary illustrative imagery; use a plain image instead.
- To convey status on its own; pair it with a Badge or status indicator.

## Do

- Always provide an AvatarFallback with one or two initials so the component degrades gracefully.
