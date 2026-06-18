The standalone app layout composes AppShell, Sidebar, and AppShellMainContent into the full chrome for a Sybilion standalone application: collapsible sidebar, sticky app header, scrollable main column, and page footer. This page embeds a live, layout-only preview; for real wiring, copy the standalone app template and follow its README.

## When to use

- When building a new standalone Sybilion app that needs the standard workspace shell.
- As a reference for how AppShell, Sidebar, PageScroll, and SybilionAppHeader fit together.
- To verify scrolling, sidebar resizing, and header behaviour before wiring real routes.

## When not to use

- For individual pages inside an existing app; use PageHeader, PageContent, and PageContentSection instead.
- As a nested shell inside another AppShell; an app should have exactly one shell.

## Do

- Start from the app template rather than assembling the shell by hand, so auth and SDK wiring come for free.
