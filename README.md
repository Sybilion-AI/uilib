# Sybilion Design System

React UI components (Stylus modules, Radix primitives, Recharts).

> This package does **not** embed app-specific contexts or API clients; the host app passes data and callbacks via props.

## Install from GitHub

Point your package manager at the repository (branch or tag as needed). **Prebuilt ESM** under `dist/esm` is committed to the repo, so consumers **do not** need to run `yarn build` inside `uilib` for the default install path.

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

### GitHub Packages + bare `uilib` imports

When consuming the published GitHub Packages build (`@Mir-Insight/uilib`) but
keeping existing imports as `from 'uilib'`, add a bundler alias and matching
TypeScript paths in the host app:

```json
{
  "compilerOptions": {
    "paths": {
      "uilib": ["node_modules/@Mir-Insight/uilib"],
      "uilib/*": ["node_modules/@Mir-Insight/uilib/*"]
    }
  }
}
```

Webpack example:

```js
resolve: {
  alias: {
    uilib: path.join(paths.modules, '@Mir-Insight/uilib'),
  },
}
```

CI installs from GitHub Packages also need npm auth:

```text
@Mir-Insight:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<token with read:packages>
always-auth=true
```

### Default: prebuilt (`dist/esm`)

The package [`exports`](./package.json) entry `.` resolves to Rollup output and generated declarations:

```ts
import { Button } from 'uilib';
```

Use this when you want **compiled** ESM (CSS modules processed; no Stylus loader required for `uilib`). Ensure your bundler still handles standard JS/CSS imports from `node_modules` as usual.

### Optional: source (`src`)

To compile `uilib` from **TypeScript + Stylus** in your app (same as older workflows), import from the `./src` subpath:

```ts
import { Button } from 'uilib/src';
```

Deep imports are supported via `uilib/src/...` (maps to files under [`src/`](./src)). Internal `#uilib/...` imports resolve through this package’s [`imports`](./package.json) field when bundling source.

## Bundling from source (`uilib` / `uilib/src`)

If you use **`uilib/src`** (or deep imports under `uilib/src/`), the host app must **compile** those files like application code:

1. **Include `uilib` in the TypeScript/JSX pipeline** — e.g. extend `babel-loader` / `ts-loader` `include` so it matches `node_modules/uilib` (and not only your app `src`):

   ```js
   include: [paths.src, /node_modules\/uilib/],
   ```

2. **Apply the same Stylus/CSS-module rules** to files under `node_modules/uilib` as you use for your own `.styl` imports.

3. **Do not remap `#uilib`** — internal imports use the subpath pattern `#uilib/...`, resolved via this package’s `package.json` [`imports`](./package.json) field. Keep your app’s own alias (for example `@` → app `src`) as usual; it does not conflict with `#uilib`.

If you only use the **default** entry (`import from 'uilib'`), you typically **do not** need Stylus/TS compilation for `uilib` in the consumer Webpack config.

## Peer dependencies

Install these in the consuming app:

- `react` and `react-dom` (>= 18)
- `react-router-dom` (>= 6) — required for components that use `Link` or routing-aware layout (for example `PageFooter`, `Breadcrumbs`)
- `@homecode/ui` (>= 4.17) — still required for Scroll/LS-related pieces until those are replaced

`@homecode/ui` is a **peer** dependency only (it is not listed under `dependencies`). The app must provide a single installed copy. Bundling `@homecode/ui` as a nested dependency of `uilib` previously pulled a second `react` and caused **invalid hook call** errors in components such as `DropZone`.

Runtime dependencies of this package (Recharts, Radix, `motion`, `vaul`, `@vimeo/player`, etc.) are declared in `package.json` and should be satisfied by the consumer’s install tree.

## Maintainers: keeping `dist/` in sync

After changing library **source**, regenerate and commit the prebuilt output:

```bash
yarn build
```

Then commit the updated `dist/` tree so GitHub installs stay up to date.

## Integration notes (injected props)

These areas expect the **app** to supply behavior or data (not vendored from product code):

- **Chat** — `ChatContext` exports types and hooks only. Implement `ChatContext.Provider` with `ChatContextType` in the app. Use `renderMessageChart` (or equivalent props) where charts appear inside messages.
- **ChartAreaInteractive** — pass legend/overlay controls such as `toggleLegendSeries`, `ensureAnalysisSeriesVisible`, `hiddenSeries`, and `overlayForecastData` (use an empty object only if quantiles are entirely prop-driven).
- **PageFooter** — `versionLink` (empty string hides the version badge), `versionLabel`, and optional `children` between the logo block and copyright (debug UI, forms, etc. stay in the app).
- **Breadcrumbs** / **PageHeader** — `clientLogo`, `companyName`, and breadcrumb item data.
- **RegionSelector** — geographic options via the `regions` prop (no drivers-data import inside the library).
- **AnalysesSelector** / chart legends — hidden-series `Set` and toggle callbacks owned by the app.

## Scripts (this repo)

| Script            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `yarn dev`        | Webpack dev server for the docs app                 |
| `yarn docs:build` | Production build of docs to `build/`                |
| `yarn build`      | Rollup ESM build to `dist/esm`                      |
| `yarn build:ship` | Same as `yarn build` (refresh `dist` before commit) |
| `yarn ts`         | Typecheck (`tsc --noEmit`)                          |
| `yarn tests`      | Jest smoke tests                                    |
