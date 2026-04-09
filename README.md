# Sybilion Design System

React UI components (Stylus modules, Radix primitives, Recharts).

> This package does **not** embed app-specific contexts or API clients; the host app passes data and callbacks via props.

## Install from GitHub

Point your package manager at the repository (branch or tag as needed). **Sources are committed** (`src/`); you do **not** need to run `yarn build` in this repo before the dependency resolves.

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

The package `exports` field resolves to [`src/index.ts`](./src/index.ts). Import in the app as:

```ts
import { Button } from 'uilib';
```

## Bundling the dependency (consumer Webpack)

The host app must **compile** `uilib` like application code:

1. **Include `uilib` in the TypeScript/JSX pipeline** — e.g. extend `babel-loader` / `ts-loader` `include` so it matches `node_modules/uilib` (and not only your app `src`):

   ```js
   include: [paths.src, /node_modules\/uilib/],
   ```

2. **Apply the same Stylus/CSS-module rules** to files under `node_modules/uilib` as you use for your own `.styl` imports.

3. **Do not remap `#uilib`** — internal imports use the subpath pattern `#uilib/...`, resolved via this package’s `package.json` [`imports`](./package.json) field. Keep your app’s own alias (for example `@` → app `src`) as usual; it does not conflict with `#uilib`.

## Peer dependencies

Install these in the consuming app:

- `react` and `react-dom` (>= 18)
- `react-router-dom` (>= 6) — required for components that use `Link` or routing-aware layout (for example `PageFooter`, `Breadcrumbs`)
- `@homecode/ui` (>= 4.17) — still required for Scroll/LS-related pieces until those are replaced

Runtime dependencies of this package (Recharts, Radix, `motion`, `vaul`, `@vimeo/player`, etc.) are declared in `package.json` and should be satisfied by the consumer’s install tree.

## Optional: prebuilt ESM (`dist/esm`)

For workflows that prefer compiled output (CI artifacts, comparison, or non-Webpack consumers), run **`yarn build`** in this repository. Rollup emits ESM with preserved modules under `dist/esm`. The **default** consumption path from GitHub is **source** via `exports` → `src/index.ts`.

## Integration notes (injected props)

These areas expect the **app** to supply behavior or data (not vendored from product code):

- **Chat** — `ChatContext` exports types and hooks only. Implement `ChatContext.Provider` with `ChatContextType` in the app. Use `renderMessageChart` (or equivalent props) where charts appear inside messages.
- **ChartAreaInteractive** — pass legend/overlay controls such as `toggleLegendSeries`, `ensureAnalysisSeriesVisible`, `hiddenSeries`, and `overlayForecastData` (use an empty object only if quantiles are entirely prop-driven).
- **PageFooter** — `versionLink` (empty string hides the version badge), `versionLabel`, and optional `**children`\*\* between the logo block and copyright (debug UI, forms, etc. stay in the app).
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
