import {
  Auth0Provider,
  type RedirectLoginOptions,
  useAuth0,
} from '@auth0/auth0-react';
import type { JSX, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { normalizeApiBaseUrl } from '#uilib/sybilion-auth/authPaths';
import { exchangeAuth0AccessTokenForSybilionJwt } from '#uilib/sybilion-auth/exchangeSybilionToken';

const DEFAULT_TOKEN_KEY = 'sybilion.standalone.jwt';

export type SybilionAuthProviderProps = {
  children: ReactNode;
  apiBaseUrl: string;
  auth0Domain: string;
  auth0ClientId: string;
  redirectUri: string;
  /**
   * Defaults match sybilion-client AuthProvider (Management API audience + metadata scope).
   * Override if your Auth0 SPA app uses a Resource Server audience for `/v1/auth/login`.
   */
  authorizationParams?: {
    audience?: string;
    scope?: string;
    redirect_uri?: string;
  };
  sybilionTokenStorageKey?: string;
  logoutReturnTo?: string;
};

export type SybilionAuthContextValue = {
  apiBaseUrl: string;
  isLoading: boolean;
  /** Auth0 authenticated and Sybilion JWT present. */
  isAuthenticated: boolean;
  sybilionAccessToken: string | null;
  error: string | null;
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;
  logout: () => void;
  getAuth0AccessToken: () => Promise<string | undefined>;
  getSybilionAccessToken: () => Promise<string | null>;
};

const SybilionAuthContext = createContext<SybilionAuthContextValue | null>(
  null,
);

export function useSybilionAuth(): SybilionAuthContextValue {
  const v = useContext(SybilionAuthContext);
  if (!v) {
    throw new Error('useSybilionAuth must be used within SybilionAuthProvider');
  }
  return v;
}

/** fetch() relative to Sybilion API base with Bearer Sybilion JWT. */
export async function sybilionApiFetch(
  apiBaseUrl: string,
  bearerToken: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const url = path.startsWith('http')
    ? path
    : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${bearerToken}`);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  return fetch(url, { ...init, headers });
}

export function createSybilionApiFetch(
  apiBaseUrl: string,
  getSybilionAccessToken: () => Promise<string | null>,
) {
  return async function sybilionFetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const token = await getSybilionAccessToken();
    if (!token)
      throw new Error('Sybilion API: missing token — user not signed in.');
    return sybilionApiFetch(apiBaseUrl, token, path, init);
  };
}

/** Authenticated fetch using {@link useSybilionAuth} context. */
export function useSybilionApiFetch(): (
  path: string,
  init?: RequestInit,
) => Promise<Response> {
  const { apiBaseUrl, getSybilionAccessToken } = useSybilionAuth();
  return useMemo(
    () => createSybilionApiFetch(apiBaseUrl, getSybilionAccessToken),
    [apiBaseUrl, getSybilionAccessToken],
  );
}

function writeLs(key: string, value: string | null): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* quota / blocked */
  }
}

function InnerSybilionSession({
  children,
  apiBaseUrl,
  storageKey,
  logoutReturnTo,
}: {
  children: ReactNode;
  apiBaseUrl: string;
  storageKey: string;
  logoutReturnTo?: string;
}): JSX.Element {
  const auth0 = useAuth0();
  const auth0Ref = useRef(auth0);
  auth0Ref.current = auth0;

  const [sybilionToken, setSybilionToken] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const persistToken = useCallback(
    (t: string | null) => {
      setSybilionToken(t);
      writeLs(storageKey, t);
    },
    [storageKey],
  );

  const doLogout = useCallback(() => {
    persistToken(null);
    setExchangeError(null);
    const returnTo =
      logoutReturnTo ??
      (typeof window !== 'undefined' ? window.location.origin : undefined);
    auth0Ref.current.logout({
      logoutParams: returnTo ? { returnTo } : undefined,
    });
  }, [persistToken, logoutReturnTo]);

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
        const jwt = await exchangeAuth0AccessTokenForSybilionJwt(
          apiBaseUrl,
          access,
        );
        if (cancelled) return;
        persistToken(jwt);
      } catch (e) {
        if (cancelled) return;
        persistToken(null);
        const msg =
          e instanceof Error ? e.message : 'Sybilion auth exchange failed';
        setExchangeError(msg);
        doLogout();
      } finally {
        if (!cancelled) setExchangeLoading(false);
      }
    };

    runExchange();

    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    auth0.isAuthenticated,
    auth0.user?.sub,
    persistToken,
    doLogout,
  ]);

  const getAuth0AccessToken = useCallback(async () => {
    if (!auth0.isAuthenticated) return undefined;
    try {
      return await auth0.getAccessTokenSilently();
    } catch {
      return undefined;
    }
  }, [auth0]);

  const getSybilionAccessToken = useCallback(async (): Promise<
    string | null
  > => {
    return sybilionToken;
  }, [sybilionToken]);

  const logout = useCallback(() => {
    doLogout();
  }, [doLogout]);

  const isAuthenticated = Boolean(
    auth0.isAuthenticated && sybilionToken && !exchangeError,
  );

  const isLoading =
    auth0.isLoading ||
    exchangeLoading ||
    (Boolean(auth0.isAuthenticated && auth0.user) &&
      sybilionToken === null &&
      exchangeError === null);

  const value = useMemo(
    (): SybilionAuthContextValue => ({
      apiBaseUrl,
      isLoading,
      isAuthenticated,
      sybilionAccessToken: sybilionToken,
      error: exchangeError ?? auth0.error?.message ?? null,
      loginWithRedirect: auth0.loginWithRedirect,
      logout,
      getAuth0AccessToken,
      getSybilionAccessToken,
    }),
    [
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
    ],
  );

  return (
    <SybilionAuthContext.Provider value={value}>
      {children}
    </SybilionAuthContext.Provider>
  );
}

export function SybilionAuthProvider({
  children,
  apiBaseUrl,
  auth0Domain,
  auth0ClientId,
  redirectUri,
  authorizationParams,
  sybilionTokenStorageKey = DEFAULT_TOKEN_KEY,
  logoutReturnTo,
}: SybilionAuthProviderProps): JSX.Element {
  const mergedAuthParams = useMemo(
    () => ({
      redirect_uri: authorizationParams?.redirect_uri ?? redirectUri,
      audience:
        authorizationParams?.audience ?? `https://${auth0Domain}/api/v2/`,
      scope:
        authorizationParams?.scope ??
        'openid profile email offline_access update:current_user_metadata',
    }),
    [
      authorizationParams?.audience,
      authorizationParams?.scope,
      authorizationParams?.redirect_uri,
      redirectUri,
      auth0Domain,
    ],
  );

  const cookieOpts =
    typeof window !== 'undefined'
      ? { cookieDomain: window.location.hostname }
      : {};

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={mergedAuthParams}
      cacheLocation="localstorage"
      useRefreshTokens
      {...cookieOpts}
    >
      <InnerSybilionSession
        apiBaseUrl={apiBaseUrl}
        storageKey={sybilionTokenStorageKey}
        logoutReturnTo={logoutReturnTo}
      >
        {children}
      </InnerSybilionSession>
    </Auth0Provider>
  );
}
