# Page layout system

Sybilion workspace surfaces use a small set of **Page** primitives from `@sybilion/uilib`. Agents must compose these instead of inventing layout with inline styles, Tailwind structure classes, or ad-hoc wrappers.

## Mandatory page skeleton

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

## Column layout recipes

| Columns        | When                          | Recipe                                                                             |
| -------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| 1              | Single full-width body        | `PageHeader` → `PageContent` → `PageContentSection` — **do not** use `PageColumns` |
| 2 equal        | Two peers                     | `PageColumns columns={[a, b]}` inside one `PageContentSection`                     |
| 2 main + aside | Content + fixed sidebar       | `PageColumns fill="left"` or `fill="right"` — **2 columns only**                   |
| 3 equal        | Three peers (metrics, panels) | `PageColumns columns={[a, b, c]}`                                                  |
| 4 equal        | Four peers                    | `PageColumns columns={[a, b, c, d]}`                                               |

Use **PageColumns** for a fixed column count content row. Use **GridLayout** for auto-wrapping card/tile grids (variable tile count, `minmax` columns).

### PageColumns

Side-by-side columns with gap inside one `PageContentSection`. **`fill`** controls which column(s) grow:

| `fill`   | Behavior                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| _(omit)_ | Equal flex columns (`flex: 1 1 0`) — default for **2, 3, or 4** equal peers. |
| `left`   | **2-column only:** first column grows; second stays at fixed 360px width.    |
| `right`  | **2-column only:** last column grows; first stays at fixed 360px width.      |

Pass `columns={[node1, node2, …]}`. For 3–4 equal columns, omit `fill`; do not use `left`/`right`. On mobile, stacks vertically.

### PageXScroll

Horizontal scroll strip; used inside `PageTabs` and anywhere a overflowing row needs page-aligned padding. Props: `size`, `fullWidth`, `innerClassName`, `scrollbarClassName`.

### SectionHeader

In-section title block (`title`, `description`, `actions`). Use **inside** `PageContentSection`, not as a replacement for `PageHeader`.

### PageEmptyCanvas

Centered empty state: `title`, `hint`, optional `children` (e.g. CTA button). Use when a route has no data yet.

### GridLayout

Responsive CSS grid (`repeat(auto-fit, minmax(colWidth, 1fr))`). Use for card/tile dashboards inside a section.

### Card / Foldable

Use inside sections for grouped content; see package `AGENT.md` on those components when present. Do not wrap the whole page in Card.

## Shell components

Not part of the per-route skeleton but part of host app wiring:

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
