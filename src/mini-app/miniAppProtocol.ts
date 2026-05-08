/**
 * postMessage protocol for Sybilion workspace mini-apps (iframe child).
 * Keep in sync with sybilion-client `src/workspace/miniAppBridge.ts` (channel, version, payloads).
 */

export const MINIAPP_CHANNEL = 'sybilion.miniapp' as const;
export const MINIAPP_VERSION = 1 as const;

export type ThemeSyncPayload = {
  mode: 'light' | 'dark';
  isDarkMode: boolean;
};

export type MiniAppMessageReady = {
  channel: typeof MINIAPP_CHANNEL;
  version: typeof MINIAPP_VERSION;
  type: 'READY';
  payload: Record<string, unknown> | { appId?: string };
};

export type MiniAppMessageThemeSync = {
  channel: typeof MINIAPP_CHANNEL;
  version: typeof MINIAPP_VERSION;
  type: 'THEME_SYNC';
  payload: ThemeSyncPayload;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Parse parent → child THEME_SYNC (shell uses `buildThemeSyncMessage`). */
export function parseThemeSyncMessage(data: unknown): ThemeSyncPayload | null {
  if (!isRecord(data)) return null;
  if (data.channel !== MINIAPP_CHANNEL) return null;
  if (data.version !== MINIAPP_VERSION) return null;
  if (data.type !== 'THEME_SYNC') return null;

  const payload = data.payload;
  if (!isRecord(payload)) return null;

  const mode = payload.mode === 'dark' ? 'dark' : 'light';
  const isDarkMode =
    typeof payload.isDarkMode === 'boolean'
      ? payload.isDarkMode
      : mode === 'dark';

  return { mode, isDarkMode };
}

/** Child → parent READY (optional `appId` for telemetry). */
export function buildReadyMessage(
  payload: Record<string, unknown> = {},
): MiniAppMessageReady {
  return {
    channel: MINIAPP_CHANNEL,
    version: MINIAPP_VERSION,
    type: 'READY',
    payload,
  };
}

export function resolveParentOriginFromReferrer(): string | null {
  try {
    if (typeof document !== 'undefined' && document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch {
    /* invalid referrer */
  }
  return null;
}

export function applyThemeToDocument(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}
