# AGENTS.md

## Cursor Cloud specific instructions

This repo is `@sybilion/uilib`, the Sybilion design system (React components in TypeScript + Stylus, built with Rollup). It is a **library**, not a runnable app — its deliverable is the `dist/esm` build consumed by `sybilion-client`. See `README.md` for the full script list.

### Verify changes (all pass on the default Node 22 env)

- `yarn build` — Rollup ESM build to `dist/esm` (also regenerates the AGENT.md glossary). This is the primary build.
- `yarn ts` — `tsc --noEmit` typecheck.
- `yarn tests` — Jest smoke tests.

### Known gotchas

- `yarn dev` (the docs playground webpack-dev-server on :8989) currently fails to load its config on the installed Node (both 20.20 and 22): webpack-cli loads the ESM `src/docs/config/webpack.config.js` via `require`, which then imports a `.ts` file that the `ts-node/esm` loader does not intercept (`ERR_UNKNOWN_FILE_EXTENSION` for `paths.ts`). This is a pre-existing tooling issue, not an environment setup problem. Use `yarn build` / `yarn ts` / `yarn tests` to validate component changes instead.
- `tests/tokenSync.test.ts` expects sibling repos `app/` and `standalone-app-template/` next to this one and fails when they are absent (only `sybilion-client` and `uilib` are checked out here). `tests/docsRegistry.test.ts` fails on a `justorm/react` ESM import that ts-jest does not transform. Both are pre-existing; the other ~196 tests pass.
- Node: environment default is Node 22 (nvm `v22.22.2`) with Yarn 1.
