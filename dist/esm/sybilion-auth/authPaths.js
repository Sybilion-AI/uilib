/** Sybilion platform auth exchange route (joined with trimmed API base URL). */
const SYBILION_AUTH_LOGIN_PATH = '/v1/auth/login';
function normalizeApiBaseUrl(url) {
    return url.replace(/\/$/, '');
}

export { SYBILION_AUTH_LOGIN_PATH, normalizeApiBaseUrl };
