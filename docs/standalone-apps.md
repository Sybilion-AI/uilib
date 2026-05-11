# Standalone Sybilion apps (@sybilion/uilib)

Greenfield SPA on **your own origin**: `@sybilion/uilib` for layout/UI, `**SybilionAuthProvider`\*\* + Sybilion API for data—no iframe in the main client.

**Agents / humans:** Use `AppShell` + `AppShellMainContent`; stick to uilib spacing primitives (no random root horizontal gutters).

## 1. Dependencies and global CSS

```bash
yarn add react react-dom react-router-dom @auth0/auth0-react @sybilion/uilib
```

Import tokens/fonts once:

```ts
import '@sybilion/uilib/standalone-global.css';
```

## 2. Layout (AppShell)

Pattern: `[src/docs/DocsShell.tsx](https://github.com/Mir-Insight/uilib/blob/main/src/docs/DocsShell.tsx)` — `PageScroll` → `AppShell` → sidebar → `AppShellMainContent` with `AppHeaderHost`, `PageFooter`, main content (`Outlet` / routes). Add `Theme` and optional `SidebarProvider` from `@homecode/ui`.

## 3. Auth (`SybilionAuthProvider`)

Use inside `BrowserRouter` if redirects hit a callback route.

Env vars depend on bundler—for **Vite** only `import.meta.env.VITE_`\* is exposed client-side:

```tsx
import { SybilionAuthProvider } from '@sybilion/uilib';

const apiBaseUrl = import.meta.env.VITE_SYBILION_API_BASE_URL as string;
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

<SybilionAuthProvider
  apiBaseUrl={apiBaseUrl}
  auth0Domain={auth0Domain}
  auth0ClientId={auth0ClientId}
  redirectUri={window.location.origin}
>
  <App />
</SybilionAuthProvider>;
```

**Flow:** Auth0 SPA → `POST {apiBaseUrl}/v1/auth/login` with `{ identity: "<Auth0 AT>", type: "auth0" }` → Sybilion JWT in response (`data.token` or `token`) → Bearer on API calls.

**Defaults** for `authorizationParams` match sybilion-client (Management audience + `openid profile email offline_access …`); override if your Auth0 SPA needs a Resource Server audience (backend confirms).

| Layer            | Configure                                                                             |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Auth0**        | Callback, logout, and web origins → your URLs (+ previews).                           |
| **Sybilion API** | CORS → your deploy `Origin`.                                                          |
| **App**          | `apiBaseUrl`, Auth0 `domain` / `clientId`, redirect usually `window.location.origin`. |

**Hooks:** `useSybilionAuth()`, `useSybilionApiFetch()` (or `createSybilionApiFetch` / `sybilionApiFetch` helpers).

## 4. Data

Fetch Sybilion API with the JWT above—no host `postMessage` bridge.

## Related

- [auth0-configuration-guide.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/auth0-configuration-guide.md)
- [server-auth-verification.md](https://github.com/Mir-Insight/sybilion-client/blob/main/docs/server-auth-verification.md)
