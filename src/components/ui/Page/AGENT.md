# Page layout system

Sybilion workspace and report surfaces use a small set of **Page** primitives from `@sybilion/uilib`. Agents must compose these instead of inventing layout with inline styles, Tailwind structure classes, or ad-hoc wrappers.

## Two modes

| Mode               | When                                             | Shell                                                                                 |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **workspace-page** | Route inside `AppShell` / scrolled main column   | `PageHeader` → `PageContent` → `PageContentSection`(s). Optional `PageTabs`.          |
| **content**        | Report tiles, json-dashboard, embedded body only | No `PageHeader` / `AppShell` chrome. Map React blocks to dashboard tiles (see below). |

Do not nest workspace shell components inside **content** mode output.

## Mandatory workspace-page skeleton

```tsx
<PageHeader title="…" subheader="…" breadcrumbs={[…]} actions={…} />
<PageContent>
  <PageContentSection>{/* section A */}</PageContentSection>
  <PageContentSection grow={false}>{/* section B */}</PageContentSection>
</PageContent>
```

- **PageHeader**: one per route view in the main column; title, optional subheader, breadcrumbs, actions.
- **PageContent**: vertical stack for the body below the header; `variant="clean"` when you need a flatter body (no extra chrome).
- **PageContentSection**: primary vertical band; applies horizontal **page-x-padding** via Stylus (`pageXPadding()`). Use multiple sections to separate logical blocks.

Global tokens (host app `:root`, e.g. `standalone-global.css`): `--page-width`, `--page-x-padding`, `--page-y-padding`. `PageContent` caps width at `--page-width`.

## PageTabs — rules and patterns

**NEVER** place `PageTabs` inside `PageContentSection`. Tabs manage their own horizontal inset via `PageXScroll` / `tabsListProps.withPaddings`.

### Unified (tabs + panels inside PageContent)

```tsx
<PageHeader … />
<PageContent>
  <PageTabs
    items={[
      { value: 'a', label: 'Tab A', content: <PageContentSection>…</PageContentSection> },
      { value: 'b', label: 'Tab B', content: <PageContentSection>…</PageContentSection> },
    ]}
  />
</PageContent>
```

Tab **panels** use `PageContentSection` so section padding stays correct.

### Split (bar-only sibling)

Use when the tab bar must sit between header and a custom scroll region:

```tsx
<PageHeader … />
<PageTabs
  items={[
    { value: 'a', label: 'Tab A', content: null },
    { value: 'b', label: 'Tab B', content: null },
  ]}
/>
<PageContent>…</PageContent>
```

Set `content: null` (or omit) for bar-only items; render panel bodies in `PageContent` yourself.

## Spacing ownership

| Component              | Owns horizontal page padding?                             |
| ---------------------- | --------------------------------------------------------- |
| **PageContentSection** | Yes (`pageXPadding`)                                      |
| **PageTabs**           | Via `tabsListProps.withPaddings` + internal `PageXScroll` |
| **PageXScroll**        | Reads `--page-x-padding` for inset when used standalone   |
| **PageHeader**         | Own header inner layout (not `PageContentSection`)        |

Do not duplicate `padding-left/right` on children that already sit in `PageContentSection`.

## Styling rules

- **No** `style={{…}}` for layout or spacing (margins, padding, flex, width, gap).
- **No** Tailwind (or other) utility classes for **structural** layout on page primitives.
- Custom layout CSS only in co-located `ComponentName.styl`, using design tokens (`var(--p-*)`, `var(--page-x-padding)`, `pageXPadding()`, etc.).
- `className` on Page components is for Stylus module classes or state hooks, not one-off pixel tweaks.

## Component reference

### PageHeader

Sticky-style page title row: breadcrumbs (optional sidebar trigger in full app), `title`, `subheader`, `actions`. Lives **above** `PageContent`, never inside a section.

### PageContent / PageContentSection

`PageContent`: column flex child, `max-width: var(--page-width)`.  
`PageContentSection`: `grow` (default `true`) lets the section absorb remaining height in flex layouts.

### PageColumns

Side-by-side columns with gap. **`fill`** controls which column(s) grow:

| `fill`          | Behavior                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `all` (default) | Every column `flex-grow: 1`, `max-width` unset — use for equal split or fluid grids of columns. |
| `left`          | First column grows; others stay at fixed min/max column width.                                  |
| `right`         | Last column grows.                                                                              |

Pass `columns={[node1, node2, …]}`. On mobile, stacks vertically. Typical pattern: main + aside inside one `PageContentSection`.

### PageXScroll

Horizontal scroll strip; used inside `PageTabs` and anywhere a overflowing row needs page-aligned padding. Props: `size`, `fullWidth`, `innerClassName`, `scrollbarClassName`.

### SectionHeader

In-section title block (`title`, `description`, `actions`). Use **inside** `PageContentSection`, not as a replacement for `PageHeader`.

### PageEmptyCanvas

Centered empty state: `title`, `hint`, optional `children` (e.g. CTA button). Use when a route has no data yet.

### GridLayout

Responsive CSS grid (`repeat(auto-fit, minmax(colWidth, 1fr))`). Use for card/tile dashboards inside a section. Report mapping: dashboard **grid** rows / multi-column tile groups.

### Card / Foldable

Use inside sections for grouped content; see package `AGENT.md` on those components when present. Do not wrap the whole page in Card.

## Content mode — React → json-dashboard tiles

When generating **report** / dashboard specs (not workspace routes), map UI blocks to tiles:

| React / intent                  | Dashboard tile / markdown                                         |
| ------------------------------- | ----------------------------------------------------------------- |
| `PageHeader` title text         | First `markdown` tile `# Title` or report title field             |
| `SectionHeader` `title`         | `markdown` with `## …`                                            |
| `SectionHeader` `description`   | markdown paragraph under that heading                             |
| `PageContentSection` block      | group of tiles or one markdown section                            |
| `GridLayout` children           | grid row of widget tiles                                          |
| `ChartAreaInteractive` / charts | `dataset_card`, `performance_chart`, etc. (see widget `AGENT.md`) |
| `PageEmptyCanvas` copy          | `markdown` explanatory tile                                       |

See `AGENT.report-only-tiles.md` in the app repo for tiles without a uilib widget.

## Shell components (workspace only)

Not part of the per-route skeleton but part of **workspace-page** host wiring:

- **AppShell** / **AppShellMainContent** — sidebar + main column + header slot + footer.
- **PageScroll** — scroll root for the main column.
- **SybilionAppHeader** — workspace app switcher + user menu (lives in header slot, not inside `PageContent`).

## Anti-patterns

- `PageTabs` inside `PageContentSection`.
- Inline styles or Tailwind for page structure.
- Second `PageHeader` nested in content.
- `PageContent` without sections for multi-block pages (prefer multiple `PageContentSection`).
- Wrapping data widgets in extra layout divs with hard-coded padding.

## Future candidates (not implemented)

- **PageToolbar** — dedicated action row between header and tabs.
- **PageFullBleed** — edge-to-edge section escape hatch.

Do not add these locally; extend uilib when product needs them.
