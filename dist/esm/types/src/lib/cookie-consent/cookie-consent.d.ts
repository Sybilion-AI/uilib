declare const COOKIE_CONSENT_KEY = "sybilion_cookie_consent";
export type CookiePreferences = {
    functional: boolean;
    analytics: boolean;
    performance: boolean;
};
export { COOKIE_CONSENT_KEY };
export declare function getCookiePreferences(): CookiePreferences | null;
export declare function hasConsentChoice(): boolean;
export declare function setCookiePreferences(prefs: CookiePreferences): void;
/** @deprecated Use getCookiePreferences and hasConsentChoice instead */
export declare function getCookieConsent(): boolean;
/** @deprecated Use setCookiePreferences instead */
export declare function setCookieConsent(): void;
