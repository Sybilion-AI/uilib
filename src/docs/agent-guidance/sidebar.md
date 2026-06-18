Sidebar provides the primitives for building application navigation rails: SidebarGroup, SidebarMenu, SidebarMenuItem, and SidebarMenuButton. Compose them to create grouped menus with active-state styling.

## When to use

- To build the primary navigation of an application shell.
- When menu items need consistent hover, focus, and active styling on a sidebar surface.

## When not to use

- For in-page navigation such as tabs or table of contents; use PageTabs or links.
- For contextual action menus; use DropdownMenu.

## Do

- Mark the current route’s item with isActive so users can orient themselves.
