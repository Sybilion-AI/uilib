import '../../tools/env.js';

const COOKIE_CONSENT_KEY_PREFIX = 'sybilion_cookie_consent';
/** Legacy global cookie name; only used for anonymous migration reads and cleanup. */
const LEGACY_COOKIE_CONSENT_KEY = 'sybilion_cookie_consent';
const COOKIE_CONSENT_VALUE = 'accepted';
function isCookiePreferences(x) {
    if (x === null || typeof x !== 'object') {
        return false;
    }
    const f = Reflect.get(x, 'functional');
    const a = Reflect.get(x, 'analytics');
    const p = Reflect.get(x, 'performance');
    return (typeof f === 'boolean' && typeof a === 'boolean' && typeof p === 'boolean');
}
/**
 * Cookie name for consent storage. Logged-out visitors use the `anon` bucket;
 * each logged-in user has their own cookie (backend user id).
 */
function getCookieConsentCookieName(userId) {
    if (userId == null || userId === '') {
        return `${COOKIE_CONSENT_KEY_PREFIX}_anon`;
    }
    return `${COOKIE_CONSENT_KEY_PREFIX}_u${userId}`;
}
function getRawCookieValue(cookieName) {
    if (typeof document === 'undefined')
        return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length !== 2)
        return null;
    return parts.pop()?.split(';').shift() ?? null;
}
function parseCookiePreferences(raw) {
    if (raw === COOKIE_CONSENT_VALUE) {
        return { functional: true, analytics: true, performance: true };
    }
    try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (isCookiePreferences(parsed)) {
            return parsed;
        }
    }
    catch (error) {
        console.error('Error parsing cookie preferences', error);
    }
    return null;
}
function getCookiePreferences(userId = null) {
    const name = getCookieConsentCookieName(userId);
    let raw = getRawCookieValue(name);
    // Anonymous only: migrate from legacy global cookie (never for logged-in users —
    // avoids inheriting another account's consent on a shared browser).
    if (raw === null && (userId == null || userId === '')) {
        raw = getRawCookieValue(LEGACY_COOKIE_CONSENT_KEY);
    }
    if (!raw)
        return null;
    return parseCookiePreferences(raw);
}

export { COOKIE_CONSENT_KEY_PREFIX, getCookieConsentCookieName, getCookiePreferences };
