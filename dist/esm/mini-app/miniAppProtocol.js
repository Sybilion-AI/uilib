/**
 * postMessage protocol for Sybilion workspace mini-apps (iframe child).
 * Keep in sync with sybilion-client `src/workspace/miniAppBridge.ts` (channel, version, payloads).
 */
const MINIAPP_CHANNEL = 'sybilion.miniapp';
const MINIAPP_VERSION = 1;
function isRecord(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
/** Parse parent → child THEME_SYNC (shell uses `buildThemeSyncMessage`). */
function parseThemeSyncMessage(data) {
    if (!isRecord(data))
        return null;
    if (data.channel !== MINIAPP_CHANNEL)
        return null;
    if (data.version !== MINIAPP_VERSION)
        return null;
    if (data.type !== 'THEME_SYNC')
        return null;
    const payload = data.payload;
    if (!isRecord(payload))
        return null;
    const mode = payload.mode === 'dark' ? 'dark' : 'light';
    const isDarkMode = typeof payload.isDarkMode === 'boolean'
        ? payload.isDarkMode
        : mode === 'dark';
    return { mode, isDarkMode };
}
/** Child → parent READY (optional `appId` for telemetry). */
function buildReadyMessage(payload = {}) {
    return {
        channel: MINIAPP_CHANNEL,
        version: MINIAPP_VERSION,
        type: 'READY',
        payload,
    };
}
function resolveParentOriginFromReferrer() {
    try {
        if (typeof document !== 'undefined' && document.referrer) {
            return new URL(document.referrer).origin;
        }
    }
    catch {
        /* invalid referrer */
    }
    return null;
}
function applyThemeToDocument(mode) {
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
}
/** Only accept shell messages that appear to come from the real embedding parent. */
function isTrustedMiniAppParentMessage(event) {
    if (event.source !== window.parent)
        return false;
    const fromReferrer = resolveParentOriginFromReferrer();
    if (fromReferrer && event.origin !== fromReferrer)
        return false;
    return true;
}
function buildDataRequestMessage(payload) {
    return {
        channel: MINIAPP_CHANNEL,
        version: MINIAPP_VERSION,
        type: 'DATA_REQUEST',
        payload,
    };
}
/** Parse parent → child DATA_RESPONSE. */
function parseDataResponseMessage(data) {
    if (!isRecord(data))
        return null;
    if (data.channel !== MINIAPP_CHANNEL)
        return null;
    if (data.version !== MINIAPP_VERSION)
        return null;
    if (data.type !== 'DATA_RESPONSE')
        return null;
    const payload = data.payload;
    if (!isRecord(payload))
        return null;
    const requestId = payload.requestId;
    if (typeof requestId !== 'string' || requestId.length === 0)
        return null;
    const ok = payload.ok === true;
    const errOk = payload.ok === false;
    if (!ok && !errOk)
        return null;
    const base = {
        requestId,
        ok,
    };
    if ('result' in payload) {
        base.result = payload.result;
    }
    if (typeof payload.error === 'string') {
        base.error = payload.error;
    }
    return base;
}

export { MINIAPP_CHANNEL, MINIAPP_VERSION, applyThemeToDocument, buildDataRequestMessage, buildReadyMessage, isTrustedMiniAppParentMessage, parseDataResponseMessage, parseThemeSyncMessage, resolveParentOriginFromReferrer };
