# Private npm registry (local + CI)

This document describes a typical setup using **Verdaccio** as a lightweight private registry. Alternatives include **npm Enterprise**, **GitHub Packages**, **GitLab Package Registry**, **Azure Artifacts**, and **JFrog Artifactory**; the **auth and CI patterns** below apply to any registry that supports npm’s token-based login.

## 1. Run a local private registry (Verdaccio)

Install and start (no project required):

```bash
yarn global add verdaccio
verdaccio
```

Default URL: `http://localhost:4873`. Open that URL in a browser to confirm the UI.

- **Persistence**: config and storage live under `~/.config/verdaccio` by default (see [Verdaccio docs](https://verdaccio.org/docs/configuration) for `storage`, `auth`, and uplinks).
- **Use the public registry for non-private packages**: Verdaccio usually **proxies** `https://registry.npmjs.org` for packages you did not publish locally, so `yarn install` can stay one command.

## 2. Publish a package to the private registry

One-off login (creates/updates auth in `~/.npmrc`):

```bash
npm adduser --registry http://localhost:4873
```

In the package you want to publish (`uilib` or another repo), set the registry for that scope or package. Examples.

**Scoped package** (`@sybilion/uilib`):

```ini
# .npmrc next to package.json (or in user ~/.npmrc)
@sybilion:registry=http://localhost:4873/
```

**Unscoped package**: either publish only to Verdaccio for that session:

```bash
npm publish --registry http://localhost:4873
```

or set `publishConfig.registry` in `package.json` for that package.

Then:

```bash
yarn npm publish
# or: npm publish
```

## 3. Install from the private registry on a developer machine

In the **consumer** repo, point installs at the registry. Scoped example:

```ini
@sybilion:registry=http://localhost:4873/
```

If the registry requires auth to **read** (you enabled it in Verdaccio), add a token line as in section 4.

For **local-only** workflows, some teams use **Verdaccio in Docker** or a **fixed hostname** (e.g. `registry.dev.sybilion.internal`) so URLs match between laptops and CI.

## 4. Authentication tokens (needed for CI and locked-down reads)

Registries use **bearer tokens**. After `npm login`, your user `.npmrc` often contains something like:

```ini
//localhost:4873/:_authToken="…"
```

For CI you should **not** commit tokens. Instead:

1. Create a **read-only** user/token for install jobs and a **separate** publish token if needed.
2. Store the token in the CI secret store (see below).
3. At job start, write `.npmrc` or set env vars the tooling understands.

**npm / Yarn (classic)** often respect:

```bash
export NODE_AUTH_TOKEN="…"
```

with an `.npmrc` in the repo or generated in CI:

```ini
@sybilion:registry=https://your-registry.example/
//your-registry.example/:_authToken=${NODE_AUTH_TOKEN}
always-auth=true
```

Exact host and path must match your registry URL. Verdaccio and cloud registries each document their token format.

## 5. How organization CI works with a private registry

High-level flow:

1. **Registry URL** is fixed for the org (self-hosted Verdaccio behind HTTPS, or GitHub/GitLab/etc.).
2. **Secrets**: store `NODE_AUTH_TOKEN` (or registry-specific secret) in:
   - **GitHub Actions**: repository or organization secrets
   - **GitLab CI**: CI/CD variables (masked/protected as appropriate)
   - **Buildkite / CircleCI / Jenkins**: equivalent secret stores
3. **Install step** runs after the token is available: `yarn install` / `npm ci` resolves scoped packages from the private registry; the rest still comes from the public npm proxy or npmjs.org.
4. **Publishing** (if the pipeline publishes packages) uses a job with a **publish** token, often only on protected branches or tags.

### GitHub Actions (illustrative)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          # or your Verdaccio HTTPS URL — match .npmrc scope
      - run: yarn install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: yarn test
```

Adjust `registry-url` and `.npmrc` to match **your** registry (GitHub Packages uses a specific host; self-hosted Verdaccio uses yours).

### Caching

CI can cache `node_modules` or Yarn’s cache **after** auth works; failed auth usually shows `401`/`403` during `yarn install`.

### Lockfiles

Commit **yarn.lock** / **package-lock.json** so CI installs deterministic versions. Private packages are referenced by version (or tarball URL) like public ones.

## 6. Choosing local Verdaccio vs a hosted org registry

| Approach                             | Good for                                               |
| ------------------------------------ | ------------------------------------------------------ |
| **Verdaccio on localhost**           | Quick feedback, testing publish/install before pushing |
| **Verdaccio on a server / K8s**      | Single org registry, full control, air-gapped options  |
| **GitHub Packages / GitLab / Azure** | Tight integration with repos, SSO, less ops            |

CI for consuming repos is the same idea everywhere: **registry URL + secret token + lockfile**.

## 7. GitHub Packages

For GitHub-hosted npm packages (`npm.pkg.github.com`), scopes, tokens, Actions, and Docker secrets, see **[github-packages.md](./github-packages.md)**.

## 8. References

- [Verdaccio](https://verdaccio.org/)
- [npm scope and `.npmrc`](https://docs.npmjs.com/cli/v10/using-npm/scope)
- [GitHub Packages npm](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
