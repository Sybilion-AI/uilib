import { isLocalHost } from '#uilib/tools/env';

const COOKIE_CONSENT_KEY = 'sybilion_cookie_consent';
const COOKIE_CONSENT_VALUE = 'accepted';
const MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 1 year

export type CookiePreferences = {
  functional: boolean;
  analytics: boolean;
  performance: boolean;
};

export { COOKIE_CONSENT_KEY };

function getRawCookieValue(): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${COOKIE_CONSENT_KEY}=`);
  if (parts.length !== 2) return null;
  return parts.pop()?.split(';').shift() ?? null;
}

export function getCookiePreferences(): CookiePreferences | null {
  const raw = getRawCookieValue();
  if (!raw) return null;

  // Migrate old "accepted" value
  if (raw === COOKIE_CONSENT_VALUE) {
    return { functional: true, analytics: true, performance: true };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CookiePreferences;
    if (
      typeof parsed.functional === 'boolean' &&
      typeof parsed.analytics === 'boolean' &&
      typeof parsed.performance === 'boolean'
    ) {
      return parsed;
    }
  } catch (error) {
    console.error('Error parsing cookie preferences', error);
  }

  return null;
}

export function hasConsentChoice(): boolean {
  return getRawCookieValue() !== null;
}

export function setCookiePreferences(prefs: CookiePreferences): void {
  if (typeof document === 'undefined') return;

  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:';
  const value = JSON.stringify(prefs);
  const domainAttr = isLocalHost ? '' : ' domain=sybilion.com;';

  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(value)};${domainAttr} path=/; max-age=${MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** @deprecated Use getCookiePreferences and hasConsentChoice instead */
export function getCookieConsent(): boolean {
  return hasConsentChoice();
}

/** @deprecated Use setCookiePreferences instead */
export function setCookieConsent(): void {
  setCookiePreferences({
    functional: true,
    analytics: true,
    performance: true,
  });
}
