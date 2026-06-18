NavUserHeader shows the signed-in user with their name, email, and avatar, and opens a dropdown menu containing custom rows, a theme toggle, and a logout action. Use the compact variant where horizontal space is limited.

## When to use

- In application chrome, such as a sidebar footer or top bar, to expose account-level actions.
- When the user needs quick access to profile, settings, theme, and logout from one place.

## When not to use

- For general-purpose menus not tied to the signed-in user; use DropdownMenu directly.
- On unauthenticated screens where there is no user to display.

## Do

- Pass bespoke rows through menuItems rather than recreating the trigger and menu yourself.
