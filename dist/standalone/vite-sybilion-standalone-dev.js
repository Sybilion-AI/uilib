import { loadEnv } from 'vite';

const DEFAULT_PORT = 3000;
const SYBILION_API_ENV = 'VITE_SYBILION_API_BASE_URL';
let warnedMissingApiUrl = false;
function parsePort(raw) {
    if (raw == null || raw === '')
        return DEFAULT_PORT;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 65_535)
        return DEFAULT_PORT;
    return n;
}
function normalizeApiPrefix(apiPrefix) {
    return apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
}
/**
 * Vite `server` + `preview` fragment for standalone Sybilion SPAs: same-origin `/api` in dev,
 * proxied to `VITE_SYBILION_API_BASE_URL`. Uses `PORT` from env (default `3000`).
 */
function sybilionStandaloneViteDev(options) {
    const envDir = options.envDir ?? process.cwd();
    const apiPrefix = normalizeApiPrefix(options.apiPrefix ?? '/api');
    const env = loadEnv(options.mode, envDir, '');
    const port = parsePort(env.PORT);
    const target = (env[SYBILION_API_ENV] ?? '').replace(/\/$/, '');
    const proxy = {};
    if (target) {
        proxy[apiPrefix] = {
            target,
            changeOrigin: true,
            secure: true,
        };
    }
    else if (options.mode === 'development' && !warnedMissingApiUrl) {
        warnedMissingApiUrl = true;
        console.warn(`[@sybilion/uilib] ${SYBILION_API_ENV} is not set; API dev proxy disabled.`);
    }
    const serverPreview = {
        port,
        proxy,
    };
    return {
        server: serverPreview,
        preview: serverPreview,
    };
}

export { sybilionStandaloneViteDev };
