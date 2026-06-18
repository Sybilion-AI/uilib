Drawer is a panel that slides in from the edge of the screen, built on Vaul for touch-friendly drag-to-dismiss behaviour. Compose it from DrawerTrigger, DrawerContent, DrawerHeader, and DrawerFooter, and give every drawer a DrawerTitle and DrawerDescription.

## When to use

- For supplementary content or actions on mobile, where a bottom sheet feels more natural than a dialog.
- For short, focused tasks that the user completes and dismisses, such as confirming a choice or adjusting a setting.
- When the user should be able to swipe or drag the surface away to dismiss it.

## When not to use

- For critical confirmations that must block interaction; use AlertDialog instead.
- For long forms or dense content; use a dedicated page or a Dialog with more room.

## Do

- Always provide a DrawerTitle and DrawerDescription so screen readers can announce the surface.
- Place dismiss actions in DrawerFooter using DrawerClose so they close the drawer consistently.
