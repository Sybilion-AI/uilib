import {
  SYBILION_AUTH_LOGIN_PATH,
  normalizeApiBaseUrl,
} from '#uilib/sybilion-auth/authPaths';

/** POST `{ identity: auth0AccessToken, type: 'auth0' }` → Sybilion API JWT string. */
export async function exchangeAuth0AccessTokenForSybilionJwt(
  apiBaseUrl: string,
  auth0AccessToken: string,
): Promise<string> {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const res = await fetch(`${base}${SYBILION_AUTH_LOGIN_PATH}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity: auth0AccessToken, type: 'auth0' }),
  });

  const json: unknown = await res.json().catch(() => ({}));
  const pickToken = (): string | undefined => {
    if (!json || typeof json !== 'object') return undefined;
    const o = json as Record<string, unknown>;
    const nested = o.data;
    if (nested && typeof nested === 'object' && 'token' in nested) {
      const t = (nested as { token?: unknown }).token;
      return typeof t === 'string' ? t : undefined;
    }
    const t = o.token;
    return typeof t === 'string' ? t : undefined;
  };

  const token = pickToken();
  if (!res.ok || token === undefined) {
    const msg =
      json &&
      typeof json === 'object' &&
      'message' in json &&
      typeof (json as { message?: unknown }).message === 'string'
        ? (json as { message: string }).message
        : `Sybilion auth failed (${res.status})`;
    throw new Error(msg);
  }

  return token;
}
