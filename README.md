# Sybilion uilib

React UI components (Stylus modules, Radix primitives, Recharts). 

> This package does **not** embed app-specific contexts or API clients; the host app passes data and callbacks via props.

## Install from GitHub

Point your package manager at the repository (branch or tag as needed):

```bash
yarn add uilib@github:Mir-Insight/uilib#main
```

Equivalent in `package.json`:

```json
{
  "dependencies": {
    "uilib": "github:Mir-Insight/uilib#main"
  }
}
```

After install, run `yarn build` inside the cloned repo (or consume a published tarball) so `dist/esm` exists, unless you bundle from source (see below).

## Peer dependencies

Install these in the consuming app:

- `react` and `react-dom` (>= 18)
- `react-router-dom` (>= 6) — required for components that use `Link` or routing-aware layout (for example `PageFooter`, `Breadcrumbs`)
- `@homecode/ui` (>= 4.17) — still required for Scroll/LS-related pieces until those are replaced

Runtime dependencies of this package (Recharts, Radix, `motion`, `vaul`, `@vimeo/player`, etc.) are declared in `package.json` and should be satisfied by the consumer’s install tree when using the published package normally.

## Using the built library vs source

- **Built ESM** (default): the package `exports` field resolves to `dist/esm/index.js` and `dist/esm/types/index.d.ts`. Run `yarn build` in this repo to generate `dist/esm`.
- **From source** in a monorepo: depend on the package path and configure your bundler with the same path aliases as this repo (`@/*` → `src/*`, optional `uilib` → `src`). Your bundler must handle `.styl` (CSS modules) like the docs Webpack config.

## Integration notes (injected props)

These areas expect the **app** to supply behavior or data (not vendored from product code):

- **Chat** — `ChatContext` exports types and hooks only. Implement `ChatContext.Provider` with `ChatContextType` in the app. Use `renderMessageChart` (or equivalent props) where charts appear inside messages.
- **ChartAreaInteractive** — pass legend/overlay controls such as `toggleLegendSeries`, `ensureAnalysisSeriesVisible`, `hiddenSeries`, and `overlayForecastData` (use an empty object only if quantiles are entirely prop-driven).
- **PageFooter** — `versionLink` (empty string hides the version badge), `versionLabel`, and optional `**children`** between the logo block and copyright (debug UI, forms, etc. stay in the app).
- **Breadcrumbs** / **PageHeader** — `clientLogo`, `companyName`, and breadcrumb item data.
- **RegionSelector** — geographic options via the `regions` prop (no drivers-data import inside the library).
- **AnalysesSelector** / chart legends — hidden-series `Set` and toggle callbacks owned by the app.

## Scripts (this repo)


| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `yarn dev`        | Webpack dev server for the docs app  |
| `yarn docs:build` | Production build of docs to `build/` |
| `yarn build`      | Rollup ESM build to `dist/esm`       |
| `yarn ts`         | Typecheck (`tsc --noEmit`)           |
| `yarn tests`      | Jest smoke tests                     |


