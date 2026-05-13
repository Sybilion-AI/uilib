# Standalone Sybilion apps (@sybilion/uilib)

Greenfield SPA on **your own origin**: `@sybilion/uilib` for layout/UI, `SybilionAuthProvider` + Sybilion API for data—no iframe in the main client.

**Agents / humans:** `AppShell` + `AppShellMainContent`; spacing via uilib primitives (e.g. `Gap`), not ad hoc gutters. **Each `<Route>` page:** follow **§4 Route page body** (one canonical pattern below); **Discovering** explains how to find other `@sybilion/uilib` exports.

**Local-first:** After scaffolding, the user should run **`yarn dev`** (or `npm run dev`) on **localhost** with **no deploy** (e.g. Vercel) required. Commit **`.env.example`**; the user copies it to **`.env`**. In development, the Sybilion API is reached via a **same-origin `/api` proxy** so the browser avoids CORS; production builds still use `VITE_SYBILION_API_BASE_URL` on the client, and the real API must allow **CORS** for your deployed `Origin` unless you terminate API calls on the same host.

## 1. Dependencies and global CSS

Vite-based apps (recommended for new standalone SPAs):

```bash
yarn add react react-dom react-router-dom @auth0/auth0-react @sybilion/uilib @sybilion/sdk
yarn add -D vite @vitejs/plugin-react
```

**React ecosystem versions (avoid collisions):** declare **`react`**, **`react-dom`**, **`react-router-dom`**, and **`@auth0/auth0-react`** as **direct** dependencies and align them with **`@sybilion/uilib`**, not arbitrary latest majors.

1. After installing uilib, open **`node_modules/@sybilion/uilib/package.json`** (or this repo’s root **`package.json`** at the release you pin).
2. **`peerDependencies`** — satisfy these ranges in your app (`react` / `react-dom`, `react-router-dom`, `@auth0/auth0-react`, and **`vite`** when you use the Vite helpers).
3. **`devDependencies`** — for **`react`**, **`react-dom`**, and **`react-router-dom`**, prefer **the same versions uilib lists there** (what its docs build and tests run against). Re-read this file whenever you bump **`@sybilion/uilib`** so your app does not drift to another React major while uilib does not.

Mismatched or duplicated React (two copies in the bundle) causes **invalid hook call** / subtle runtime bugs — and specifically causes **Radix UI interactive widgets** (dropdowns, dialogs, tooltips) to **silently fail** (context broken across the module boundary). If Yarn/npm hoists a second React, fix upstream ranges or use **`resolutions`** (Yarn) / **`overrides`** (npm) so the tree resolves to **one** `react` / `react-dom` pair matching (3). Also add `dedupe` + `@radix-ui/` alias in `vite.config.ts` (see **Local dev: Vite API proxy**).

**Current required versions (as of uilib 1.2.x):** `react` / `react-dom` **`^19`**, `@types/react` / `@types/react-dom` **`^19`**. Add resolutions so nested copies stay aligned:

```json
{
  "resolutions": {
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

Import tokens/fonts once (typically `src/main.tsx`):

```ts
import '@sybilion/uilib/standalone-global.css';
```

Mount the tree with `ReactDOM.createRoot` → `App` (wrap with `StrictMode` if you want).

### `package.json` scripts (required)

Add a **`dev`** script so the app is runnable immediately after clone. Typical Vite setup:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### `.env.example`

Commit **`.env.example`** at the app root (no secrets). Minimum variables:

| Variable                     | Purpose                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                       | Vite **dev** and **preview** server port. **`PORT=3000`** matches the current **Auth0 test tenant** (`http://localhost:3000` callback / web origins). Override if your tenant uses another port. |
| `VITE_SYBILION_API_BASE_URL` | Real Sybilion API origin (no trailing slash). Used as **proxy target** in dev and as SDK `baseUrl` in production builds.                                                                         |
| `VITE_AUTH0_DOMAIN`          | Auth0 domain (§3).                                                                                                                                                                               |
| `VITE_AUTH0_CLIENT_ID`       | Auth0 SPA client id (§3).                                                                                                                                                                        |

Example **`.env.example`** content for the app root:

```env
# Copy to `.env` and fill in values. Do not commit `.env`.
# PORT: Vite dev/preview bind (sybilionStandaloneViteDev reads this). 3000 matches Auth0 test tenant localhost URLs.
PORT=3000

VITE_SYBILION_API_BASE_URL=https://api-dev.sybilion.com
VITE_AUTH0_DOMAIN=your-tenant.eu.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
```

## 2. SDK (`@sybilion/sdk`)

Typed HTTP client for the Sybilion API. Env vars depend on bundler; for Vite, only `import.meta.env.VITE_*` reaches the client.

Create **one** instance at module scope (e.g. `src/libs/sybilion-sdk.ts`) so React never reconstructs the client (`useMemo` not needed), and reuse it for auth + data:

```ts
import { createSybilionSDK } from '@sybilion/sdk';

export const sybilionJwtStorageKey = 'sybilion.standalone.jwt';

export const sybilionSdk = createSybilionSDK({
  baseUrl: import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_SYBILION_API_BASE_URL as string),
  apiPrefix: '/api',
  getToken: () =>
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(sybilionJwtStorageKey) ?? undefined)
      : undefined,
});
```

**Options:** `baseUrl` — API origin only (no trailing slash) **in production**; in **development** use `''` so requests stay **same-origin** (`/api/v1/...`) and the Vite dev server **proxies `/api`** to `VITE_SYBILION_API_BASE_URL` (see **Local dev: Vite API proxy** below). `apiPrefix` — default `'/api'` so calls go to `{baseUrl}/api/v1/...`. `getToken` — must read the same key you pass as `sybilionTokenStorageKey` on `SybilionAuthProvider` (§3).

```ts
import { sybilionSdk } from './libs/sybilion-sdk';

await sybilionSdk.raw.datasets.getById(datasetId);
```

- `sybilionSdk.auth` — `loginWithAuth0Identity`, `getMe`, `updateMe` (Auth0 bootstrap + user profile).
- `sybilionSdk.raw` — thin `GET`/`POST`/… wrappers for `/v1/...` paths (e.g. `raw.analyses.driversMapOnce`; parsed JSON, no app-specific shaping).
- `sybilionSdk.resources` — higher-level helpers (datasets, drivers, subscriptions) on top of `raw`.

Package README: [`@sybilion/sdk`](https://www.npmjs.com/package/@sybilion/sdk) — monorepo: [`../../sdk/README.md`](../../sdk/README.md).

## Local dev: Vite API proxy

Avoid browser CORS in development by serving the SPA from Vite and proxying **`/api`** to the real API.

**Reference `vite.config.ts` (minimal standalone Sybilion SPA):** merge your own `plugins` / options into this shape; keep `resolve.dedupe` and the `@radix-ui/` alias unless you know the dependency tree dedupes React and Radix correctly on its own.

- **`sybilionStandaloneViteDev`** (`@sybilion/uilib/vite-standalone-dev`) — reads **`PORT`** (defaults **3000** if unset or invalid) for **`server`** and **`preview`** bind; sets **`proxy['/api']`** → **`VITE_SYBILION_API_BASE_URL`** with `changeOrigin` and `secure: true`. Pass Vite’s **`mode`** so env (including `VITE_*`) and proxy target resolve the same way as `vite` / `vite build`.
- **`defineConfig(({ mode }) => …)`** — callback form gives `mode` per command (`development` / `production` / …); forward it into `sybilionStandaloneViteDev`.
- **`plugins: [react()]`** — add other plugins (e.g. SVGR) in the same array.
- **`resolve.dedupe`** — force one physical copy of `react`, `react-dom`, `react-router`, and `react-router-dom`. If the app and `@sybilion/uilib` resolve different copies, React context and router state break (`Invalid hook call`, blank subtree, Radix menus that never open). `react-router` is listed because it is a shared transitive dependency of the router packages and can duplicate independently.
- **`resolve.alias` for `@radix-ui/*`** — uilib’s published bundle uses bare `@radix-ui/react-*` imports. Yarn/npm can still place those packages under `node_modules/@sybilion/uilib/node_modules/@radix-ui/…`, so Vite may bundle two Radix trees and split React context across them. The regex alias rewrites every `@radix-ui/…` import to **`./node_modules/@radix-ui/`** (project root). **`path.resolve(… ) + '/'`** is required so subpaths like `@radix-ui/react-dialog` resolve under that folder.
- **`path`** — Node built-in `node:path`; only used at config evaluation time.

```ts
// vite.config.ts — reference config for a standalone app using @sybilion/uilib + proxy.
import { sybilionStandaloneViteDev } from '@sybilion/uilib/vite-standalone-dev';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// Pass `mode` into sybilionStandaloneViteDev so proxy + VITE_* match the active Vite command.
export default defineConfig(({ mode }) => ({
  ...sybilionStandaloneViteDev({ mode }),
  plugins: [react()],
  resolve: {
    // One copy of React + Router across app and uilib (avoids invalid hook call / dead Radix UI).
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    alias: [
      {
        find: /^@radix-ui\//,
        // Pin all Radix imports to the app’s root node_modules; trailing slash keeps subpaths working.
        replacement: path.resolve('./node_modules/@radix-ui/') + '/',
      },
    ],
  },
}));
```

Combine with an **empty `baseUrl` in dev** in the SDK module (§2). In **`preview`** builds, keep **`.env`** with **`VITE_SYBILION_API_BASE_URL`** so `vite preview` can still proxy API calls locally.

## Discovering `@sybilion/uilib` components (agents)

Prefer **`@sybilion/uilib`** over bespoke layout/controls.

1. **Barrel:** uilib repo `src/index.ts`, or **`node_modules/@sybilion/uilib/dist/esm/types/index.d.ts`** after install — scan `export * from './components/ui/...'`.
2. **Page cluster:** `PageScroll`, `AppShell`, `PageHeader`, `PageFooter`, tabs/columns, **`SybilionAppHeader`** (workspace switcher + **`NavUserHeader`**), etc. come from the same package; **what to compose and when** lives only in **§4 Route page body** (not repeated here).
3. **Examples:** `src/docs/pages/*Page.tsx`; **`PagePage`** (`slug page`) — minimal **`PageContent` + `PageContentSection`**.

## Local dev: apps with a Go server

Some templates include a **Go** server. This repo does **not** provide Go middleware. The contract: whatever serves the **same origin the browser uses for the SPA** must **reverse-proxy** path prefix **`/api`** (or your SDK `apiPrefix`) to the Sybilion API. Use **`baseUrl: ''`** in dev when those requests are same-origin. Name and document server-side env vars (e.g. API upstream URL) in the Go project.

## 3. Auth (`SybilionAuthProvider`)

Use inside `BrowserRouter` if redirects hit a callback route.

Wire the SDK module from §2 — no second `createSybilionSDK` here:

```tsx
import type { ReactNode } from 'react';

import { SybilionAuthProvider } from '@sybilion/uilib';

import { sybilionJwtStorageKey, sybilionSdk } from './libs/sybilion-sdk';

export function AppProviders({ children }: { children: ReactNode }) {
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

  return (
    <SybilionAuthProvider
      sdk={sybilionSdk}
      sybilionTokenStorageKey={sybilionJwtStorageKey}
      auth0Domain={auth0Domain}
      auth0ClientId={auth0ClientId}
      redirectUri={window.location.origin}
    >
      {children}
    </SybilionAuthProvider>
  );
}
```

**Flow:** Auth0 SPA → `sybilionSdk.auth.loginWithAuth0Identity(<Auth0 AT>)` → Sybilion JWT (`data.token` / `token`) persisted → same `sybilionSdk` + `getToken` attach Bearer on requests; `useSybilionApiFetch()` uses `getSybilionApiOriginFromSdk(sdk)` for URLs (paths like `/api/v1/...`).

**Defaults** for `authorizationParams` match sybilion-client (Management audience + `openid profile email offline_access …`); override if your Auth0 SPA needs a Resource Server audience (backend confirms).

| Layer            | Configure                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth0**        | Callback, logout, and web origins → your URLs (+ previews).                                                                                                                  |
| **Sybilion API** | CORS → your deploy `Origin`.                                                                                                                                                 |
| **App**          | §2 SDK module (`baseUrl`, `apiPrefix`, `getToken`); pass `sdk` + matching `sybilionTokenStorageKey`; Auth0 `domain` / `clientId`; redirect usually `window.location.origin`. |

**Hooks:** `useSybilionAuth()`, `useSybilionApiFetch()` (or `createSybilionApiFetch` / `sybilionApiFetch` helpers).

### Loading the user profile for `SybilionAppHeader`

`useSybilionAuth()` gives you `isAuthenticated` / `logout` but **not** a user object. Fetch it once with `sybilionSdk.auth.getMe()` after authentication. The response shape is:

```ts
// GET /api/v1/users/me → { data: { user: BackendUser }, message, status }
// BackendUser includes `picture` (profile image URL from the API). Do not read deprecated `avatar` on the wire.
```

**Agents:** import **`MeResponse`** (and rely on **`BackendUser`** inside it) from `@sybilion/sdk`. Profile image on the API is **`picture` only**; `NavUserHeader` / `SybilionAppHeader` still expect the prop key **`avatar`**—map with `avatar: u.picture ?? ''`. No `UserProfile` intersections, no `u.avatar` fallback, no manual `res as { data?: … }` once `getMe()` is typed.

`NavUserHeader` (used inside `SybilionAppHeader`) accepts `user: { name, email, avatar? }`.

```ts
import type { MeResponse } from '@sybilion/sdk';

useEffect(() => {
  if (!isAuthenticated) {
    setUser(null);
    return;
  }
  sybilionSdk.auth
    .getMe()
    .then((res: MeResponse) => {
      const u = res.data?.user;
      if (u)
        setUser({
          name: u.name,
          email: u.email,
          avatar: u.picture ?? '',
        });
    })
    .catch(() => undefined);
}, [isAuthenticated]);
```

Pass `user` (or `null` while loading with `isLoading` on `NavUserHeader`) and `isAuthenticated` to `SybilionAppHeader`.

## 4. Layout (AppShell)

With §2 `sybilionSdk` and §3 `AppProviders` / `SybilionAuthProvider` defined, compose routing + shell so Auth0 callbacks and JWT-backed hooks wrap the whole UI.

### Root wiring (`App.tsx`)

Order outside → in: `BrowserRouter` (callbacks) → `AppProviders` (§3) → `SidebarProvider` (sidebar width / open state for `Sidebar` primitives) → `AppLayout` → `Routes`.

`AppLayout` renders the persistent chrome (sidebar, header, footer) and the active route renders inside its main column via `children`. Add `HomePage` / `DatasetsPage` as your own page components; register an Auth0 callback route here if `SybilionAuthProvider` uses a dedicated path.

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { SidebarProvider } from '@sybilion/uilib';

import { AppLayout } from './AppLayout';
import { AppProviders } from './AppProviders';
import { DatasetsPage } from './pages/DatasetsPage';
import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <SidebarProvider
          sidebarWidthStorageKey="myapp.sidebarWidthPx"
          persistSidebarWidthWithoutConsent
        >
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/datasets" element={<DatasetsPage />} />
            </Routes>
          </AppLayout>
        </SidebarProvider>
      </AppProviders>
    </BrowserRouter>
  );
}
```

`SidebarProvider`: pass only the props you need. `sidebarWidthStorageKey` namespaces width in localStorage. For production apps with cookie-based consent, drop `persistSidebarWidthWithoutConsent` and pass `userId` so width persistence follows your consent rules.

### `AppLayout` (sidebar + main + `children`)

`AppSidebar` is a sibling of `AppShellMainContent` inside `AppShell`. The matched route (`<Routes>` from `App.tsx`) renders as `{children}` in the main column.

**Header row:** pass **`header={<AppHeaderHost />}`** to **`AppShellMainContent`**, then **`SybilionAppHeader`** as the **first** child before `{children}`. **`SybilionAppHeader`** portals workspace switcher + embedded **`NavUserHeader`** into that shell header (and **`page-header-actions`** so **`PageHeader`** toolbars line up).

Props: all **`WorkspaceAppSwitcher`** props plus all **`NavUserHeader`** props (`user`, **`menuItems`** as **`DropdownMenuItem`** rows, **`theme`**, **`onLogout`**, etc.), and optional **`pageHeaderId`**, **`actionsAnchorId`**, **`actionsAnchorClassName`**.

```tsx
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AppHeaderHost,
  AppShell,
  AppShellMainContent,
  DropdownMenuItem,
  PageFooter,
  PageScroll,
  SybilionAppHeader,
} from '@sybilion/uilib';

import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PageScroll>
      <AppShell>
        <AppSidebar />

        <AppShellMainContent
          header={<AppHeaderHost />}
          footer={<PageFooter versionLink="/releases" versionLabel="0.0.1" />}
        >
          <SybilionAppHeader
            pathname={location.pathname}
            onNavigate={href => navigate(href)}
            authenticated={false}
            appsStorageKey="myapp.workspaceApps"
            defaultApps={[]}
            user={{ name: 'Analyst', email: 'you@example.com', avatar: '' }}
            theme="light"
            onThemeToggle={() => undefined}
            onLogout={() => undefined}
            isAuthenticated={false}
            menuItems={
              <>
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </>
            }
          />
          {children}
        </AppShellMainContent>
      </AppShell>
    </PageScroll>
  );
}
```

Wire **`authenticated`**, **`user`** / **`isAuthenticated`**, **`theme`** / **`onLogout`**, **`menuItems`**, and **`defaultApps`** / **`appsStorageKey`** to real auth and workspace config (`useSybilionAuth`, §3). **`NavUserHeader`** behavior reference: `src/docs/pages/NavUserHeaderPage.tsx` (slug `nav-user-header`). Full shell preview: `src/docs/pages/StandaloneAppLayoutPage.tsx` (slug **`standalone-app-layout`**).

#### Sidebar (`AppSidebar.tsx`)

App-specific sidebar component — keeps the navigation surface out of `AppLayout` so the shell stays generic. Compose your nav from `@sybilion/uilib` primitives (`Sidebar` + `SidebarContent` + `SidebarGroup` + `SidebarMenu*`) and product widgets like `SidebarDatasetsItemsGrouped` (collapsible groups + nested rows for datasets — see demo `src/docs/pages/SidebarDatasetsItemsGroupedPage.tsx`, slug `sidebar-datasets-items-grouped`).

```tsx
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarDatasetsItemsGrouped,
  type SidebarDatasetsItemsGroupedDataset,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@sybilion/uilib';

import { sybilionSdk } from './libs/sybilion-sdk';

export function AppSidebar() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<
    SidebarDatasetsItemsGroupedDataset[]
  >([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>();

  useEffect(() => {
    sybilionSdk.raw.datasetsIndex(1, 50).then(res => {
      setDatasets(res?.data?.datasets ?? []);
    });
  }, []);

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/" end>
                  Home
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/datasets">Datasets</NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarDatasetsItemsGrouped
          groupBy="regions"
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onDatasetClick={id => {
            setSelectedDatasetId(id);
            navigate(`/datasets/${id}`);
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
}
```

Data loading uses §2 `sybilionSdk` directly — for production swap the inline `useEffect` for your data layer (React Query, SWR, context, etc.). `groupBy` accepts `'regions' | 'target_type' | 'categories'`; the widget owns its expand state and notifies on selection via `onDatasetClick`.

### Route page body (`PageHeader`, `PageContent`, `PageContentSection`)

**Canonical rule for this doc:** the shell (`AppLayout`) owns **global** chrome only. Every **route** (component under `<Routes>`) builds the main column with **`PageHeader` → `PageContent` → `PageContentSection`** (and other uilib primitives inside sections)—not a padded root `<div>`/`<main>` unless nothing fits.

Pieces:

| Piece                    | Role                                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`PageHeader`**         | Route title (`h1`), optional **breadcrumbs**, **subheader**, **actions** (toolbar). Renders the shared header chrome (collapsing title on scroll uses `PageContext` from `PageScroll`).                                                                                    |
| **`PageContent`**        | Outer wrapper for the scrollable main column body. Use **`variant="clean"`** when you need the alternate spacing preset.                                                                                                                                                   |
| **`PageContentSection`** | Vertical **section** blocks inside the page (group related UI; stack multiple sections). Accepts normal `div` props (e.g. `className`, `style`; HTML **`title`** is the native tooltip attribute, not a section heading—pass a real heading element as a child if needed). |

**Example — `HomePage.tsx` (fragment inside `AppShellMainContent` / `<Routes>`):**

```tsx
import { PageContent, PageContentSection, PageHeader } from '@sybilion/uilib';

export function HomePage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/' }]}
        title="Home"
        subheader="Short route description."
      />
      <PageContent>
        <PageContentSection>
          {/* tables, cards, charts — use uilib components where they exist */}
        </PageContentSection>
      </PageContent>
    </>
  );
}
```

Set **`breadcrumbSidebarTrigger={false}`** on `PageHeader` only when **no** `SidebarProvider` wraps the tree (rare for standalone apps; default is fine when the sidebar exists).

### Full pattern

Composition: `PageScroll` → `AppShell` → `AppSidebar` → `AppShellMainContent` with **`AppHeaderHost`** + **`SybilionAppHeader`**, `PageFooter`, and the active route as `children`. **`SidebarProvider`** wraps `AppLayout`. **Route main column:** subsection **Route page body** above. Add `Theme` from `@homecode/ui` only when your product uses those primitives alongside uilib.

### Greenfield checklist (agents)

| Step               | Deliverable                                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React / router     | **`react`**, **`react-dom`**, **`react-router-dom`**, **`@auth0/auth0-react`** (and **`vite`** if applicable) aligned with **`@sybilion/uilib`** **`package.json`** — §1 _React ecosystem versions_. |
| Env files          | **`.env.example`** (committed) + **`.env`** locally; **`PORT=3000`** recommended for Auth0 test tenant; **`VITE_*`** as in §1 table.                                                                 |
| Scripts            | **`package.json`** includes mandatory **`dev`** (e.g. `"vite"`); optional **`build`**, **`preview`**.                                                                                                |
| Vite proxy         | **`vite.config.ts`** spreads **`sybilionStandaloneViteDev({ mode })`**; SDK **`baseUrl`** empty in dev (§2).                                                                                         |
| Files              | `src/libs/sybilion-sdk.ts`, `AppProviders.tsx`, `AppLayout.tsx`, `AppSidebar.tsx`, `App.tsx`, `main.tsx`, route pages under e.g. `src/pages/`.                                                       |
| Pages + UI         | **§4 Route page body** (mandatory stack) + **Discovering** (barrel-first; bespoke markup only when no export fits).                                                                                  |
| Auth0              | SPA callback / logout URLs + allowed web origins → **`http://localhost:<PORT>`** for local dev and deploy URLs (and previews).                                                                       |
| API                | **Dev:** proxy handles API traffic (no browser CORS to API). **Prod:** Sybilion backend **CORS** → your deploy `Origin`, unless API is same-origin.                                                  |
| Go (if applicable) | Server proxies **`/api`** to Sybilion; SPA dev **`baseUrl`** stays `''` when same-origin.                                                                                                            |

### Glossary (high-use pieces)

| Component / API                                      | What it is for                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageScroll`                                         | Page-level vertical scroll wrapper; usual outer shell for the app body.                                                                                                                                                                                                           |
| `AppShell`                                           | Layout grid container; `Sidebar` + `AppShellMainContent` as siblings inside it.                                                                                                                                                                                                   |
| `AppShellMainContent`                                | Main column: `header`, scrollable body (`children`), `footer`.                                                                                                                                                                                                                    |
| `SybilionAppHeader`                                  | **Default** standalone top header: **`AppShellMainContent`** `header` = **`AppHeaderHost`**, first body child = **`SybilionAppHeader`** — workspace switcher + embedded **`NavUserHeader`** (props incl. **`menuItems`**); aligns **`PageHeader`** via **`page-header-actions`**. |
| `WorkspaceAppSwitcher`                               | Dropdown of workspace apps (`WorkspaceAppEntry[]`); composed inside **`SybilionAppHeader`**.                                                                                                                                                                                      |
| `NavUserHeader`                                      | Header user menu (avatar, account, theme, logout).                                                                                                                                                                                                                                |
| `Sidebar`, `SidebarProvider`                         | Collapsible rail + context (`@sybilion/uilib`). Wrap `SidebarProvider` above `AppLayout`; render `Sidebar` inside `AppShell` (usually via `AppSidebar`).                                                                                                                          |
| `AppSidebar`                                         | App-specific component (`src/AppSidebar.tsx`) composing `Sidebar` + nav links + product widgets. Keeps `AppLayout` generic.                                                                                                                                                       |
| `SidebarDatasetsItemsGrouped`                        | Dataset list widget for the sidebar: collapsible groups (`regions` / `target_type` / `categories`) with nested rows + selection callback.                                                                                                                                         |
| `SidebarTrigger`                                     | Toggle sidebar visibility (especially mobile / `offcanvas`).                                                                                                                                                                                                                      |
| `PageFooter`                                         | Standard footer; requires `versionLink` + `versionLabel`.                                                                                                                                                                                                                         |
| `Gap`                                                | Spacing primitive between flex children.                                                                                                                                                                                                                                          |
| `PageHeader`, `PageContent`, `PageContentSection`, … | **§4 Route page body** (roles, `breadcrumbSidebarTrigger`, example). Same barrel also has `PageTabs`, `PageColumns`, `SectionHeader`, `PageEmptyCanvas`, …                                                                                                                        |
| `SybilionAuthProvider`                               | Auth0 + Sybilion JWT (§3).                                                                                                                                                                                                                                                        |
| `useSybilionAuth`                                    | User session + login/logout under provider.                                                                                                                                                                                                                                       |
| `useSybilionApiFetch`                                | Authenticated `fetch` using stored JWT.                                                                                                                                                                                                                                           |

## 5. Data

Inside `SybilionAuthProvider`, use `useSybilionApiFetch()` for authenticated `fetch`, or import `sybilionSdk` from §2 for `raw` / `resources` — same JWT storage and API origin either way.

## Related

- [auth0-configuration-guide.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/auth0-configuration-guide.md)
- [server-auth-verification.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/server-auth-verification.md)
