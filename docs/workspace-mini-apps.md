# Workspace mini-apps (Sybilion iframe)

The Sybilion client embeds mini-apps in an **iframe** and syncs theme with `postMessage`. Use `**MiniAppRoot`** so this document’s `<html>` gets `**light` / `dark**` (uilib uses `.dark { … }` for tokens), and so `**@homecode/ui`’s `<Theme />**` runs with vars matching that mode (`getDefaultMiniAppThemeConfig`; override via props if needed).

## Design system (`@sybilion/uilib`)

**Prefer exported components from `@sybilion/uilib`** for structure, typography, forms, feedback, data display, and charts **when they fit the need**. That keeps spacing, tokens, and behavior aligned with Sybilion and avoids one-off layouts. Use custom markup or CSS **only** when uilib has no suitable primitive.

**For humans and coding agents:** Default to uilib as the component library—do not invent new layout patterns or duplicate design tokens when an existing uilib component (or composition of a few) can do the job. Browse the uilib docs app / package exports before building bespoke UI.

**Page inset:** Do **not** add your own **left/right** padding or margin on the root page or a full-viewport wrapper (no random `px-*` / `mx-*` / `container` max-width hacks for “page margins”). Use uilib layout primitives and spacing tokens—or patterns documented for mini-apps—so horizontal gutters and max width stay consistent with the shell.

1. Import `**@sybilion/uilib/mini-app-global.css`** (slim tokens + font imports; ships in this package).
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

1. Optional: `**useMiniAppShellTheme()**` for `**{ theme: { mode, isDarkMode } }**` under the provider (object leaves room for more shell fields later).
2. Optional: `**getThemeConfig**` on `**MiniAppRoot**` — passed `**(isDarkMode) => config**` like the Sybilion app’s `**getThemeConfig**` from `**src/lib/theme.ts**`, so iframe UI matches host accent/danger tokens.

**Bridge:** `MiniAppRoot` handles `THEME_SYNC`, sends `READY` on mount/load, and checks `event.source === window.parent` plus `document.referrer` origin when present. If the referrer is missing (strict `Referrer-Policy`), `READY` may use `targetOrigin` `*` — document that for your host.

## Cached data from the host (no extra APIs)

The Sybilion shell can answer read-only **data getters** over the same `postMessage` channel (`DATA_REQUEST` / `DATA_RESPONSE`). Use this when a mini-app should render **the user’s existing Sybilion data** (datasets, forecasts, drivers, performance, drivers comparison) **without** building duplicate backend calls.

- **Cache-only:** The shell returns whatever is **already in memory** (dataset context) or in the **same localStorage cache** the main app uses for Performance (e.g. `performance-<analysisId>`). It does **not** trigger network fetches. If the user never opened a dataset tab or the blob was never loaded, you get **empty objects, `null`, or `[]`** — handle that in UI.
- **Performance bundle:** `getPerformanceData` returns `{ table, spaghetti }`. `table` is the cached Performance-tab payload (often `null` until the user has opened Performance for that analysis). `spaghetti` is in-memory backtest lines from the host when present.
- **Usage:** Create one client (e.g. module singleton) with `**createMiniAppDataClient()`** from `@sybilion/uilib`. It only works **inside the iframe** (throws if `window.parent === window`). Methods: `**getDatasets()`**, `**getDataset(id)**`, `**getForecasts(datasetId)**`, `**getForecast(datasetId, analysisId)**`, `**getDrivers(datasetId, analysisId)**`, `**getPerformanceData(datasetId, analysisId)**`, `**getDriversComparisonData(datasetId, analysisId)**`. Types `**MiniAppDataset**`, `**MiniAppForecastMap**`, `**MiniAppPerformanceBundle**`, `**MiniAppDriversComparisonSnapshot**` describe the returned JSON loosely.

**For coding agents:** Prefer these getters when the task is “show the user’s current Sybilion data in the mini-app” so the iframe stays aligned with the host session and avoids inventing parallel data loading.

```tsx
import { createMiniAppDataClient } from '@sybilion/uilib';

const data = createMiniAppDataClient();

// inside an effect or loader (iframe only)
const datasets = await data.getDatasets();
const forecasts = await data.getForecasts(datasetId);
```

