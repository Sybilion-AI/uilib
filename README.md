# Sybilion Design System

React UI components (Stylus modules, Radix primitives, Recharts).

> This package does **not** embed app-specific contexts or API clients; the host app passes data and callbacks via props.

## Install from npm (recommended)

Published as `@sybilion/uilib` on the public registry. No scope-specific `.npmrc` required.

```bash
yarn add @sybilion/uilib
```

Equivalent in `package.json`:

```json
{
  "dependencies": {
    "@sybilion/uilib": "^1.0.20"
  }
}
```

### Bare `uilib` imports + scoped install

When the package is installed as `@sybilion/uilib` but you keep imports as `from 'uilib'`, add a bundler alias and matching TypeScript paths:

```json
{
  "compilerOptions": {
    "paths": {
      "uilib": ["../node_modules/@sybilion/uilib"],
      "uilib/*": ["../node_modules/@sybilion/uilib/*"]
    }
  }
}
```

Webpack example:

```js
resolve: {
  alias: {
    uilib: path.join(paths.modules, '@sybilion/uilib'),
  },
}
```

### Default: prebuilt (`dist/esm`)

The package `[exports](./package.json)` entry `.` resolves to Rollup output and generated declarations:

```ts
import { Button } from '@sybilion/uilib';

// or, with alias: import { Button } from 'uilib';
```

Use this when you want **compiled** ESM (CSS modules processed; no Stylus loader required for the library). Ensure your bundler still handles standard JS/CSS imports from `node_modules` as usual.

### Optional: source (`./src` subpath)

To compile from **TypeScript + Stylus** in your app, use the `./src` export:

```ts
import { Button } from '@sybilion/uilib/src';
```

Deep imports use `@sybilion/uilib/src/...` (maps to files under `[src/](./src)`). Internal `#uilib/...` imports resolve through this package’s `[imports](./package.json)` field when bundling source.

### Standalone Sybilion apps

Starter: **[sybilion-template-app](https://github.com/Mir-Insight/sybilion-template-app)** (Vite: Auth0, shell, router, SDK). Same layout as `mini/sybilion-app-template/` in the Sybilion monorepo. `@homecode/ui` is a dependency of `@sybilion/uilib` and installs with it; declare React/router in your app so deduplication keeps one React instance (see peers below).

## Bundling from source (`uilib/src`)

If you use `uilib/src` (or deep imports under `uilib/src/`), the host app must **compile** those files like application code:

1. **Include the library in the TypeScript/JSX pipeline** — e.g. extend `babel-loader` / `ts-loader` `include` so it matches the installed package (and not only your app `src`):

```js
 include: [paths.src, /node_modules\/@sybilion\/uilib/],
```

1. **Apply the same Stylus/CSS-module rules** to `.styl` under `node_modules/@sybilion/uilib` as you use for your own imports.
2. **Do not remap `#uilib`** — internal imports use `#uilib/...`, resolved via this package’s `package.json` `[imports](./package.json)`. Keep your app’s own alias (for example `@` → app `src`) as usual; it does not conflict with `#uilib`.

If you only use the **default** entry (`import from '@sybilion/uilib'` or aliased `uilib`), you typically **do not** need Stylus/TS compilation for the library in the consumer Webpack config.

## Peer dependencies

Declare these in **your** app (`package.json`):

- `react` and `react-dom` (>= 18) — required so the app and `@homecode/ui` resolve the **same** React (avoid invalid hook call / duplicate trees).
- `react-router-dom` (>= 6) — layout components that use routing-aware UI.
- `@auth0/auth0-react` (^2.3, **optional peer**) — install when you import `SybilionAuthProvider` / Sybilion auth hooks (see `peerDependenciesMeta`). Standalone docs include it in the `yarn add` line.

**Included with `@sybilion/uilib`** (normal `dependencies`): `@homecode/ui` (^4.17), Radix, Recharts, `@vimeo/player`, `motion`, etc. You import `Theme` / primitives from `@homecode/ui` without adding it separately unless you want an explicit top-level version pin.

Runtime dependencies are listed in `[package.json](./package.json)`.

## Maintainers

**npm:** log in (`npm login`), then from repo root:

```bash
yarn publish:npm    # @sybilion/uilib
```

runs `yarn build` before `npm publish`.

**GitHub `github:` consumers:** after changing library **source**, regenerate and commit the prebuilt output:

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


| Script                | Description                                 |
| --------------------- | ------------------------------------------- |
| `yarn dev`            | Webpack dev server for the docs app         |
| `yarn docs:build`     | Production build of docs to `build/`        |
| `yarn build`          | Rollup ESM build to `dist/esm`              |
| `yarn build:watch`    | Rollup in watch mode                        |
| `yarn build:compress` | Rollup build with `COMPRESS=true`           |
| `yarn publish:npm`    | `yarn build` then publish `@sybilion/uilib` |
| `yarn ts`             | Typecheck (`tsc --noEmit`)                  |
| `yarn tests`          | Jest smoke tests                            |
| `yarn release`        | `standard-version` (bump changelog + tag)   |


