import { jsx } from 'react/jsx-runtime';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { normalizeApiBaseUrl } from './authPaths.js';

const DEFAULT_TOKEN_KEY = 'sybilion.standalone.jwt';
function sybilionJwtFromLoginResponse(body) {
    const t = body.data?.token ?? body.token;
    if (!t)
        throw new Error('Sybilion auth: missing token in login response');
    return t;
}
/** Origin (`scheme://host:port`) for paths like `/api/v1/...`; derived from SDK URL layout. */
function getSybilionApiOriginFromSdk(sdk) {
    const loginUrl = sdk.http.buildUrl('/v1/auth/login');
    try {
        const baseHref = typeof window !== 'undefined' && window.location?.href
            ? window.location.href
            : 'http://localhost/';
        const u = new URL(loginUrl, baseHref);
        if (!u.pathname.endsWith('/v1/auth/login'))
            return '';
        return u.origin;
    }
    catch {
        return '';
    }
}
const SybilionAuthContext = createContext(null);
function useSybilionAuth() {
    const v = useContext(SybilionAuthContext);
    if (!v) {
        throw new Error('useSybilionAuth must be used within SybilionAuthProvider');
    }
    return v;
}
/** fetch() relative to Sybilion API base with Bearer Sybilion JWT. */
async function sybilionApiFetch(apiBaseUrl, bearerToken, path, init = {}) {
    const base = normalizeApiBaseUrl(apiBaseUrl);
    const url = path.startsWith('http')
        ? path
        : `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${bearerToken}`);
    if (!headers.has('Accept'))
        headers.set('Accept', 'application/json');
    return fetch(url, { ...init, headers });
}
function createSybilionApiFetch(apiBaseUrl, getSybilionAccessToken) {
    return async function sybilionFetch(path, init) {
        const token = await getSybilionAccessToken();
        if (!token)
            throw new Error('Sybilion API: missing token — user not signed in.');
        return sybilionApiFetch(apiBaseUrl, token, path, init);
    };
}
/** Authenticated fetch using {@link useSybilionAuth} context. */
function useSybilionApiFetch() {
    const { apiBaseUrl, getSybilionAccessToken } = useSybilionAuth();
    return useMemo(() => createSybilionApiFetch(apiBaseUrl, getSybilionAccessToken), [apiBaseUrl, getSybilionAccessToken]);
}
function writeLs(key, value) {
    if (typeof localStorage === 'undefined')
        return;
    try {
        if (value === null)
            localStorage.removeItem(key);
        else
            localStorage.setItem(key, value);
    }
    catch {
        /* quota / blocked */
    }
}
function InnerSybilionSession({ children, sdk, storageKey, logoutReturnTo, }) {
    const auth0 = useAuth0();
    const auth0Ref = useRef(auth0);
    auth0Ref.current = auth0;
    const [sybilionToken, setSybilionToken] = useState(null);
    const [exchangeLoading, setExchangeLoading] = useState(false);
    const [exchangeError, setExchangeError] = useState(null);
    const persistToken = useCallback((t) => {
        setSybilionToken(t);
        writeLs(storageKey, t);
    }, [storageKey]);
    const doLogout = useCallback(() => {
        persistToken(null);
        setExchangeError(null);
        const returnTo = logoutReturnTo ??
            (typeof window !== 'undefined' ? window.location.origin : undefined);
        auth0Ref.current.logout({
            logoutParams: returnTo ? { returnTo } : undefined,
        });
    }, [persistToken, logoutReturnTo]);
    const apiBaseUrl = useMemo(() => getSybilionApiOriginFromSdk(sdk), [sdk]);
    useEffect(() => {
        if (!auth0.isAuthenticated || !auth0.user?.sub) {
            persistToken(null);
        }
    }, [auth0.isAuthenticated, auth0.user?.sub, persistToken]);
    useEffect(() => {
        if (!auth0.isAuthenticated || !auth0.user?.sub) {
            setExchangeLoading(false);
            setExchangeError(null);
            return;
        }
        let cancelled = false;
        const runExchange = async () => {
            setExchangeLoading(true);
            setExchangeError(null);
            try {
                const access = await auth0Ref.current.getAccessTokenSilently();
                const loginBody = await sdk.auth.loginWithAuth0Identity(access);
                const jwt = sybilionJwtFromLoginResponse(loginBody);
                if (cancelled)
                    return;
                persistToken(jwt);
            }
            catch (e) {
                if (cancelled)
                    return;
                persistToken(null);
                const msg = e instanceof Error ? e.message : 'Sybilion auth exchange failed';
                setExchangeError(msg);
                doLogout();
            }
            finally {
                if (!cancelled)
                    setExchangeLoading(false);
            }
        };
        runExchange();
        return () => {
            cancelled = true;
        };
    }, [
        sdk,
        auth0.isAuthenticated,
        auth0.user?.sub,
        persistToken,
        doLogout,
    ]);
    const getAuth0AccessToken = useCallback(async () => {
        if (!auth0.isAuthenticated)
            return undefined;
        try {
            return await auth0.getAccessTokenSilently();
        }
        catch {
            return undefined;
        }
    }, [auth0]);
    const getSybilionAccessToken = useCallback(async () => {
        return sybilionToken;
    }, [sybilionToken]);
    const logout = useCallback(() => {
        doLogout();
    }, [doLogout]);
    const isAuthenticated = Boolean(auth0.isAuthenticated && sybilionToken && !exchangeError);
    const isLoading = auth0.isLoading ||
        exchangeLoading ||
        (Boolean(auth0.isAuthenticated && auth0.user) &&
            sybilionToken === null &&
            exchangeError === null);
    const value = useMemo(() => ({
        apiBaseUrl,
        isLoading,
        isAuthenticated,
        sybilionAccessToken: sybilionToken,
        error: exchangeError ?? auth0.error?.message ?? null,
        loginWithRedirect: auth0.loginWithRedirect,
        logout,
        getAuth0AccessToken,
        getSybilionAccessToken,
    }), [
        apiBaseUrl,
        isLoading,
        isAuthenticated,
        sybilionToken,
        exchangeError,
        auth0.error?.message,
        auth0.loginWithRedirect,
        logout,
        getAuth0AccessToken,
        getSybilionAccessToken,
    ]);
    return (jsx(SybilionAuthContext.Provider, { value: value, children: children }));
}
function SybilionAuthProvider({ children, sdk, auth0Domain, auth0ClientId, redirectUri, authorizationParams, sybilionTokenStorageKey = DEFAULT_TOKEN_KEY, logoutReturnTo, }) {
    const mergedAuthParams = useMemo(() => ({
        redirect_uri: authorizationParams?.redirect_uri ?? redirectUri,
        audience: authorizationParams?.audience ?? `https://${auth0Domain}/api/v2/`,
        scope: authorizationParams?.scope ??
            'openid profile email offline_access update:current_user_metadata',
    }), [
        authorizationParams?.audience,
        authorizationParams?.scope,
        authorizationParams?.redirect_uri,
        redirectUri,
        auth0Domain,
    ]);
    const cookieOpts = typeof window !== 'undefined'
        ? { cookieDomain: window.location.hostname }
        : {};
    return (jsx(Auth0Provider, { domain: auth0Domain, clientId: auth0ClientId, authorizationParams: mergedAuthParams, cacheLocation: "localstorage", useRefreshTokens: true, ...cookieOpts, children: jsx(InnerSybilionSession, { sdk: sdk, storageKey: sybilionTokenStorageKey, logoutReturnTo: logoutReturnTo, children: children }) }));
}

export { SybilionAuthProvider, createSybilionApiFetch, getSybilionApiOriginFromSdk, sybilionApiFetch, useSybilionApiFetch, useSybilionAuth };
