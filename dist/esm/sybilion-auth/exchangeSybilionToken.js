import { normalizeApiBaseUrl, SYBILION_AUTH_LOGIN_PATH } from './authPaths.js';

/** Default API segment before `/v1/...`; matches {@link createSybilionSDK} default `apiPrefix`. */
const SYBILION_AUTH_API_PREFIX = '/api';
/** POST `{ identity: auth0AccessToken, type: 'auth0' }` → Sybilion API JWT string. */
async function exchangeAuth0AccessTokenForSybilionJwt(
/** API origin only (no trailing slash), same as SDK `baseUrl`. */
apiBaseUrl, auth0AccessToken) {
    const base = normalizeApiBaseUrl(apiBaseUrl);
    const res = await fetch(`${base}${SYBILION_AUTH_API_PREFIX}${SYBILION_AUTH_LOGIN_PATH}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identity: auth0AccessToken, type: 'auth0' }),
    });
    const json = await res.json().catch(() => ({}));
    const pickToken = () => {
        if (!json || typeof json !== 'object')
            return undefined;
        const o = json;
        const nested = o.data;
        if (nested && typeof nested === 'object' && 'token' in nested) {
            const t = nested.token;
            return typeof t === 'string' ? t : undefined;
        }
        const t = o.token;
        return typeof t === 'string' ? t : undefined;
    };
    const token = pickToken();
    if (!res.ok || token === undefined) {
        const msg = json &&
            typeof json === 'object' &&
            'message' in json &&
            typeof json.message === 'string'
            ? json.message
            : `Sybilion auth failed (${res.status})`;
        throw new Error(msg);
    }
    return token;
}

export { exchangeAuth0AccessTokenForSybilionJwt };
