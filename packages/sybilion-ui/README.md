# @Mir-Insight/sybilion-ui

GitHub Packages build of **ChartAreaInteractive** from [Mir-Insight/uilib](https://github.com/Mir-Insight/uilib).

## Install

Registry: **GitHub Packages** (`https://npm.pkg.github.com`). Scope matches org **`Mir-Insight`**.

```bash
yarn add @Mir-Insight/sybilion-ui
```

If install fails with 401/404, add an `.npmrc` in the project (or user profile) with a token that has `read:packages`:

```
@Mir-Insight:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Peer dependencies: `react`, `react-dom` (18+).

## Usage

```tsx
import { ChartAreaInteractive } from '@Mir-Insight/sybilion-ui';
```

## Build / publish (maintainers)

Authenticate once for publish (`write:packages`, `repo` if private):

```
npm login --registry=https://npm.pkg.github.com
```

(user = GitHub username, password = PAT)

From the **uilib repo root**:

```bash
yarn build:sybilion-ui
yarn publish:sybilion-ui
```

`publishConfig.registry` in this package targets GitHub Packages — no `--registry` flag needed.

The bundle entry resolves to `dist/esm/packages/sybilion-ui/src/index.js` (Rollup `preserveModules` layout); consumers import only `@Mir-Insight/sybilion-ui`.
