import '../../tools/env.js';

const COOKIE_CONSENT_KEY = 'sybilion_cookie_consent';
const COOKIE_CONSENT_VALUE = 'accepted';
function getRawCookieValue() {
    if (typeof document === 'undefined')
        return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_CONSENT_KEY}=`);
    if (parts.length !== 2)
        return null;
    return parts.pop()?.split(';').shift() ?? null;
}
function getCookiePreferences() {
    const raw = getRawCookieValue();
    if (!raw)
        return null;
    // Migrate old "accepted" value
    if (raw === COOKIE_CONSENT_VALUE) {
        return { functional: true, analytics: true, performance: true };
    }
    try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (typeof parsed.functional === 'boolean' &&
            typeof parsed.analytics === 'boolean' &&
            typeof parsed.performance === 'boolean') {
            return parsed;
        }
    }
    catch (error) {
        console.error('Error parsing cookie preferences', error);
    }
    return null;
}

export { COOKIE_CONSENT_KEY, getCookiePreferences };
