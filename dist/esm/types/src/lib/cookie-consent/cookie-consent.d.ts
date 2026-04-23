export declare const COOKIE_CONSENT_KEY_PREFIX = "sybilion_cookie_consent";
/** Same string as the legacy pre–per-user cookie name. */
export declare const COOKIE_CONSENT_KEY = "sybilion_cookie_consent";
export type CookiePreferences = {
    functional: boolean;
    analytics: boolean;
    performance: boolean;
};
/**
 * Cookie name for consent storage. Logged-out visitors use the `anon` bucket;
 * each logged-in user has their own cookie (backend user id).
 */
export declare function getCookieConsentCookieName(userId: number | string | null): string;
export declare function getCookiePreferences(userId?: number | string | null): CookiePreferences | null;
export declare function hasConsentChoice(userId?: number | string | null): boolean;
export declare function setCookiePreferences(prefs: CookiePreferences, userId?: number | string | null): void;
/** @deprecated Use getCookiePreferences and hasConsentChoice instead */
export declare function getCookieConsent(userId?: number | string | null): boolean;
/** @deprecated Use setCookiePreferences instead */
export declare function setCookieConsent(userId?: number | string | null): void;
