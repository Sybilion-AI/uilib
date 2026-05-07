# @Mir-Insight/sybilion-ui

Public npm package: **ChartAreaInteractive** from [Mir-Insight/uilib](https://github.com/Mir-Insight/uilib).

## Install

```bash
yarn add @Mir-Insight/sybilion-ui
```

Default registry: **npmjs** (`https://registry.npmjs.org/`). No `.npmrc` required for installs.

Peer dependencies: `react`, `react-dom` (18+).

## Usage

```tsx
import { ChartAreaInteractive } from '@Mir-Insight/sybilion-ui';
```

## Build / publish (maintainers)

Log in to npm (`npm login`), then from the **uilib repo root**:

```bash
yarn build:sybilion-ui
yarn publish:sybilion-ui
```

Scoped packages use `--access public` (set in root script + `publishConfig`).

The bundle entry resolves to `dist/esm/packages/sybilion-ui/src/index.js` (Rollup `preserveModules` layout).
