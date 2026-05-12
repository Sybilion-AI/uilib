# Standalone Sybilion apps (@sybilion/uilib)

Greenfield SPA on **your own origin**: `@sybilion/uilib` for layout/UI, **SybilionAuthProvider** + Sybilion API for data—no iframe in the main client.

**Agents / humans:** Use `AppShell` + `AppShellMainContent`; stick to uilib spacing primitives (e.g. `Gap`) instead of ad hoc root horizontal gutters.

## 1. Dependencies and global CSS

```bash
yarn add react react-dom react-router-dom @auth0/auth0-react @sybilion/uilib @sybilion/sdk
```

Import tokens/fonts once:

```ts
import '@sybilion/uilib/standalone-global.css';
```

## 2. Layout (AppShell)

### Minimal example

`AppHeaderHost` is the empty header bar; put triggers and `NavUserHeader` (a.k.a. the user / account menu) inside `AppHeaderPortal` so they render in that bar.

```tsx
import type { ReactNode } from 'react';

import {
  AppHeaderHost,
  AppHeaderPortal,
  AppShell,
  AppShellMainContent,
  Gap,
  NavUserHeader,
  PageFooter,
  PageScroll,
} from '@sybilion/uilib';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PageScroll>
      <AppShell>
        {/* Optional: sidebar as a sibling before main, e.g. <Sidebar … /> */}
        <AppShellMainContent
          header={<AppHeaderHost />}
          footer={<PageFooter versionLink="/releases" versionLabel="0.0.0" />}
        >
          <AppHeaderPortal>
            <Gap />
            <NavUserHeader
              theme="light"
              onThemeToggle={() => undefined}
              onLogout={() => undefined}
              isAuthenticated={false}
            />
          </AppHeaderPortal>
          {children}
        </AppShellMainContent>
      </AppShell>
    </PageScroll>
  );
}
```

Wire `NavUserHeader` to real auth (`useSybilionAuth`, theme context, etc.). Demo page in repo: `src/docs/pages/NavUserHeaderPage.tsx` (slug `nav-user-header`).

### Full pattern

Reference: `[src/docs/DocsShell.tsx](https://github.com/Mir-Insight/uilib/blob/main/src/docs/DocsShell.tsx)` — `PageScroll` → `AppShell` → sidebar → `AppShellMainContent` with `AppHeaderHost`, `PageFooter`, and routed body (`Outlet`). Add `Theme` and optional `SidebarProvider` from `@homecode/ui`.

### Glossary (high-use pieces)

| Component / API                             | What it is for                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `**PageScroll**`                            | Page-level vertical scroll wrapper; usual outer shell for the app body.                                           |
| `**AppShell**`                              | Layout grid container; typically holds a sidebar (optional) + main column.                                        |
| `**AppShellMainContent**`                   | Main column with slots: `header`, scrollable body (`children`), `footer`.                                         |
| `**AppHeaderHost**`                         | Renders the top header anchor (DOM id `page-header`); stays empty on purpose.                                     |
| `**AppHeaderPortal**`                       | Portals children into `AppHeaderHost` — put header actions, `NavUserHeader`, theme toggle here.                   |
| `**NavUserHeader**`                         | Header user menu: avatar, account dropdown, theme row, logout; **not** a bare `DropdownMenu`.                     |
| `**Sidebar`\*\*                             | Collapsible app sidebar / nav rail (pair with `SidebarProvider` from `@homecode/ui` when needed).                 |
| `**PageFooter**`                            | Standard app footer (logo, links, version badge). Requires `versionLink` + `versionLabel`.                        |
| `**Gap**`                                   | Horizontal or vertical spacing primitive between flex children (prefer over raw margins).                         |
| `**SybilionAuthProvider**`                  | Auth0 + Sybilion JWT bootstrap for the whole app (see §3).                                                        |
| `**useSybilionAuth**`                       | Current user, tokens, login/logout inside the provider tree.                                                      |
| `**useSybilionApiFetch**`                   | Authenticated `fetch` to the Sybilion API using the stored JWT.                                                   |
| `**Breadcrumb**`, `**BreadcrumbList`, …\*\* | Accessible breadcrumb trail for the page header (compose `BreadcrumbItem` / `BreadcrumbLink` / `BreadcrumbPage`). |
| `**Button`**, `**Card\*\*`                  | Primary actions and grouped content blocks—default building blocks for screens inside the layout body.            |

## 3. Auth (`SybilionAuthProvider`)

Use inside `BrowserRouter` if redirects hit a callback route.

Env vars depend on bundler—for **Vite** only `import.meta.env.VITE_` is exposed client-side:

```tsx
import { useMemo, type ReactNode } from 'react';

import { SybilionAuthProvider } from '@sybilion/uilib';
import { createSybilionSDK } from '@sybilion/sdk';

const sybilionJwtKey = 'sybilion.standalone.jwt';

export function AppProviders({ children }: { children: ReactNode }) {
  const apiBaseUrl = import.meta.env.VITE_SYBILION_API_BASE_URL as string;
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

  const sdk = useMemo(
    () =>
      createSybilionSDK({
        baseUrl: apiBaseUrl,
        apiPrefix: '/api',
        getToken: () =>
          typeof localStorage !== 'undefined'
            ? localStorage.getItem(sybilionJwtKey) ?? undefined
            : undefined,
      }),
    [apiBaseUrl],
  );

  return (
    <SybilionAuthProvider
      sdk={sdk}
      sybilionTokenStorageKey={sybilionJwtKey}
      auth0Domain={auth0Domain}
      auth0ClientId={auth0ClientId}
      redirectUri={window.location.origin}
    >
      {children}
    </SybilionAuthProvider>
  );
}
```

**Flow:** Auth0 SPA → `sdk.auth.loginWithAuth0Identity(<Auth0 AT>)` → Sybilion JWT (`data.token` / `token`) persisted → same `sdk` + `getToken` supply Bearer on API calls; `useSybilionApiFetch()` uses `getSybilionApiOriginFromSdk(sdk)` for URLs (paths like `/api/v1/...`).

**Defaults** for `authorizationParams` match sybilion-client (Management audience + `openid profile email offline_access …`); override if your Auth0 SPA needs a Resource Server audience (backend confirms).

| Layer            | Configure                                                                             |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Auth0**        | Callback, logout, and web origins → your URLs (+ previews).                           |
| **Sybilion API** | CORS → your deploy `Origin`.                                                          |
| **App**          | `createSybilionSDK` (`baseUrl`, `apiPrefix`), pass **`sdk`** to `SybilionAuthProvider`; align `sybilionTokenStorageKey` with `getToken`; Auth0 `domain` / `clientId`; redirect usually `window.location.origin`. |

**Hooks:** `useSybilionAuth()`, `useSybilionApiFetch()` (or `createSybilionApiFetch` / `sybilionApiFetch` helpers).

## 4. Data

Fetch the Sybilion API with the JWT above (e.g. via `useSybilionApiFetch`).

### `@sybilion/sdk`

Install the typed client alongside uilib:

```bash
yarn add @sybilion/sdk
```

Configure **`createSybilionSDK`** with the same instance you pass to **`SybilionAuthProvider`** (`sdk` prop). Use **`baseUrl`**: API origin only (no trailing slash), default **`apiPrefix: '/api'`** so requests hit `{baseUrl}/api/v1/...`. **`getToken`** should read the same storage key as **`sybilionTokenStorageKey`** on the provider (default `sybilion.standalone.jwt`).

```ts
import { createSybilionSDK } from '@sybilion/sdk';

const sdk = createSybilionSDK({
  baseUrl: apiBaseUrl,
  apiPrefix: '/api',
  getToken: () => localStorage.getItem('sybilion.standalone.jwt') ?? undefined,
});
```

- **`sdk.auth`** — `loginWithAuth0Identity`, `getMe`, `updateMe` (Auth0 bootstrap + user profile).
- **`sdk.raw`** — thin `GET`/`POST`/… wrappers for `/v1/...` paths (e.g. `raw.analyses.driversMapOnce`; returns parsed JSON, no app-specific shaping).
- **`sdk.resources`** — higher-level helpers (datasets, drivers, subscriptions) that compose `raw` calls with parsing where applicable.

See the package README: [`@sybilion/sdk`](https://www.npmjs.com/package/@sybilion/sdk) — in this monorepo, [`../../sdk/README.md`](../../sdk/README.md).

## Related

- [auth0-configuration-guide.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/auth0-configuration-guide.md)
- [server-auth-verification.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/server-auth-verification.md)
