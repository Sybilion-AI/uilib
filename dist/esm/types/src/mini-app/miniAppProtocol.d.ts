/**
 * postMessage protocol for Sybilion workspace mini-apps (iframe child).
 * Keep in sync with sybilion-client `src/workspace/miniAppBridge.ts` (channel, version, payloads).
 */
export declare const MINIAPP_CHANNEL: "sybilion.miniapp";
export declare const MINIAPP_VERSION: 1;
export type ThemeSyncPayload = {
    mode: 'light' | 'dark';
    isDarkMode: boolean;
};
export type MiniAppMessageReady = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'READY';
    payload: Record<string, unknown> | {
        appId?: string;
    };
};
export type MiniAppMessageThemeSync = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'THEME_SYNC';
    payload: ThemeSyncPayload;
};
/** Parse parent → child THEME_SYNC (shell uses `buildThemeSyncMessage`). */
export declare function parseThemeSyncMessage(data: unknown): ThemeSyncPayload | null;
/** Child → parent READY (optional `appId` for telemetry). */
export declare function buildReadyMessage(payload?: Record<string, unknown>): MiniAppMessageReady;
export declare function resolveParentOriginFromReferrer(): string | null;
export declare function applyThemeToDocument(mode: 'light' | 'dark'): void;
