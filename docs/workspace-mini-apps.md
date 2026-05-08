# Workspace mini-apps (Sybilion iframe)

The Sybilion client embeds mini-apps in an **iframe** and syncs theme with `postMessage`. Use **`MiniAppRoot`** so this document’s `<html>` gets **`light` / `dark`** (uilib uses `.dark { … }` for tokens).

1. Import **`@sybilion/uilib/mini-app-global.css`** (slim tokens + font imports; ships in this package).
2. Wrap the React root:

```tsx
import { MiniAppRoot } from '@sybilion/uilib';
import '@sybilion/uilib/mini-app-global.css';

createRoot(document.getElementById('root')!).render(
  <MiniAppRoot appId="my-mini-app">
    <App />
  </MiniAppRoot>,
);
```

3. Optional: **`useMiniAppShellTheme()`** for **`{ theme: { mode, isDarkMode } }`** under the provider (object leaves room for more shell fields later).

**Bridge:** `MiniAppRoot` handles `THEME_SYNC`, sends `READY` on mount/load, and checks `event.source === window.parent` plus `document.referrer` origin when present. If the referrer is missing (strict `Referrer-Policy`), `READY` may use `targetOrigin` `*` — document that for your host.
