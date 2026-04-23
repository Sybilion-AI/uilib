import { isLocalHost } from '#uilib/tools/env';

export const COOKIE_CONSENT_KEY_PREFIX = 'sybilion_cookie_consent';

/** Legacy global cookie name; only used for anonymous migration reads and cleanup. */
const LEGACY_COOKIE_CONSENT_KEY = 'sybilion_cookie_consent';

/** Same string as the legacy pre–per-user cookie name. */
export const COOKIE_CONSENT_KEY = LEGACY_COOKIE_CONSENT_KEY;

const COOKIE_CONSENT_VALUE = 'accepted';
const MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 1 year

export type CookiePreferences = {
  functional: boolean;
  analytics: boolean;
  performance: boolean;
};

function isCookiePreferences(x: unknown): x is CookiePreferences {
  if (x === null || typeof x !== 'object') {
    return false;
  }
  const f = Reflect.get(x, 'functional');
  const a = Reflect.get(x, 'analytics');
  const p = Reflect.get(x, 'performance');
  return (
    typeof f === 'boolean' && typeof a === 'boolean' && typeof p === 'boolean'
  );
}

/**
 * Cookie name for consent storage. Logged-out visitors use the `anon` bucket;
 * each logged-in user has their own cookie (backend user id).
 */
export function getCookieConsentCookieName(
  userId: number | string | null,
): string {
  if (userId == null || userId === '') {
    return `${COOKIE_CONSENT_KEY_PREFIX}_anon`;
  }
  return `${COOKIE_CONSENT_KEY_PREFIX}_u${userId}`;
}

function getRawCookieValue(cookieName: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cookieName}=`);
  if (parts.length !== 2) return null;
  return parts.pop()?.split(';').shift() ?? null;
}

function parseCookiePreferences(raw: string): CookiePreferences | null {
  if (raw === COOKIE_CONSENT_VALUE) {
    return { functional: true, analytics: true, performance: true };
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (isCookiePreferences(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Error parsing cookie preferences', error);
  }

  return null;
}

export function getCookiePreferences(
  userId: number | string | null = null,
): CookiePreferences | null {
  const name = getCookieConsentCookieName(userId);
  let raw = getRawCookieValue(name);
  // Anonymous only: migrate from legacy global cookie (never for logged-in users —
  // avoids inheriting another account's consent on a shared browser).
  if (raw === null && (userId == null || userId === '')) {
    raw = getRawCookieValue(LEGACY_COOKIE_CONSENT_KEY);
  }
  if (!raw) return null;
  return parseCookiePreferences(raw);
}

export function hasConsentChoice(
  userId: number | string | null = null,
): boolean {
  const name = getCookieConsentCookieName(userId);
  if (getRawCookieValue(name) !== null) return true;
  if (userId == null || userId === '') {
    return getRawCookieValue(LEGACY_COOKIE_CONSENT_KEY) !== null;
  }
  return false;
}

export function setCookiePreferences(
  prefs: CookiePreferences,
  userId: number | string | null = null,
): void {
  if (typeof document === 'undefined') return;

  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:';
  const value = JSON.stringify(prefs);
  const domainAttr = isLocalHost ? '' : ' domain=sybilion.com;';
  const cookieName = getCookieConsentCookieName(userId);

  document.cookie = `${cookieName}=${encodeURIComponent(value)};${domainAttr} path=/; max-age=${MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;

  // One-time cleanup: logged-in saves replace the old global cookie so it is not reused.
  if (userId != null && userId !== '') {
    document.cookie = `${LEGACY_COOKIE_CONSENT_KEY}=;${domainAttr} path=/; max-age=0; SameSite=Lax${secure ? '; Secure' : ''}`;
  }
}

/** @deprecated Use getCookiePreferences and hasConsentChoice instead */
export function getCookieConsent(
  userId: number | string | null = null,
): boolean {
  return hasConsentChoice(userId);
}

/** @deprecated Use setCookiePreferences instead */
export function setCookieConsent(userId: number | string | null = null): void {
  setCookiePreferences(
    {
      functional: true,
      analytics: true,
      performance: true,
    },
    userId,
  );
}
