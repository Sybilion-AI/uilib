# GitHub Packages (npm)

Use [GitHub Packages](https://docs.github.com/en/packages) as the npm registry for scoped packages such as `@Mir-Insight/uilib`. Public npm (`registry.npmjs.org`) stays the default for unscoped packages.

## 1. Enable Packages on the repository

- **Publishing**: in the package repo (e.g. `uilib`), use **Actions** permissions and `GITHUB_TOKEN` or a PAT with `write:packages` as documented by GitHub.
- **Installing in another repo**: the consumer needs **`read:packages`** on the package’s scope (org or user).

## 2. `package.json` in the library (publisher)

Use a **scoped** name under the org:

```json
{
  "name": "@Mir-Insight/uilib",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Publish from CI or locally after `npm login` to `https://npm.pkg.github.com`.

## 3. Consumer `.npmrc` (app or library)

At the repo root (commit this; no token in git):

```ini
@Mir-Insight:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Yarn/npm substitute `${NODE_AUTH_TOKEN}` at install time.

**Local machine**

- Create a [Personal Access Token](https://github.com/settings/tokens) (classic: `read:packages`; fine-grained: Packages read for the org).
- `export NODE_AUTH_TOKEN=ghp_...` before `yarn install`, or add the token line to your user `~/.npmrc` (never commit that file).

**Same repository as the package**

- A workflow can use `GITHUB_TOKEN` with `packages: read` for some same-repo cases; see GitHub’s current matrix for npm.

**Different repository than the package (typical for `design-demo` → `uilib`)**

- Use a **PAT** or org-level credential with `read:packages` stored as a repository/org secret (e.g. `PACKAGES_READ_TOKEN`).
- `GITHUB_TOKEN` alone often **cannot** install private packages published from another repository; use a PAT unless GitHub documents an exception for your setup.

## 4. GitHub Actions (install job)

```yaml
permissions:
  contents: read
  packages: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: https://npm.pkg.github.com
          scope: '@Mir-Insight'
      - run: yarn install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.PACKAGES_READ_TOKEN }}
```

`setup-node` can write `.npmrc`; if you already committed `.npmrc` with `${NODE_AUTH_TOKEN}`, passing `NODE_AUTH_TOKEN` in `env` is enough.

## 5. Docker builds

Do **not** pass tokens as plain `ARG` (they can leak in image history). Use **BuildKit secrets** and export `NODE_AUTH_TOKEN` only inside the `RUN` that runs `yarn install` / `npm ci`.

`design-demo`’s `deployment/Dockerfile` mounts an optional secret `gh_token` and exports it as `NODE_AUTH_TOKEN` before install. The workflow passes:

```yaml
secrets: |
  gh_token=${{ secrets.PACKAGES_READ_TOKEN }}
```

If you are not using GitHub Packages yet, omit the secret; the mount stays optional (`required=false`) and installs that only use `github:` or public npm still work.

## 6. Migrating from `github:` dependency

Replace:

```json
"uilib": "github:Mir-Insight/uilib#<commit>"
```

with a **version** published to GitHub Packages:

```json
"uilib": "npm:@Mir-Insight/uilib@^1.2.3"
```

or, if the package name stays unscoped on GPR (unusual), follow your published name. Regenerate the lockfile after changing `package.json`.

## 7. References

- [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Publishing and installing packages with GitHub Actions](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions)
