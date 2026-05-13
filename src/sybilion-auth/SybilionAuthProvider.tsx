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
import type { LoginTokenResponse, SybilionSDK } from '@sybilion/sdk';

const DEFAULT_TOKEN_KEY = 'sybilion.standalone.jwt';

function sybilionJwtFromLoginResponse(body: LoginTokenResponse): string {
  const t = body.data?.token ?? body.token;
  if (!t) throw new Error('Sybilion auth: missing token in login response');
  return t;
}

/** Origin (`scheme://host:port`) for paths like `/api/v1/...`; derived from SDK URL layout. */
export function getSybilionApiOriginFromSdk(sdk: SybilionSDK): string {
  const loginUrl = sdk.http.buildUrl('/v1/auth/login');
  try {
    const baseHref =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : 'http://localhost/';
    const u = new URL(loginUrl, baseHref);
    if (!u.pathname.endsWith('/v1/auth/login')) return '';
    return u.origin;
  } catch {
    return '';
  }
}

export type SybilionAuthProviderProps = {
  children: ReactNode;
  sdk: SybilionSDK;
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
  /**
   * When set, passed to Auth0 `logout({ logoutParams: { returnTo } })` if
   * {@link SybilionAuthProviderProps.useFederatedLogout} is true.
   */
  logoutReturnTo?: string;
  /**
   * If true, redirect to Auth0 `/v2/logout` (clears IdP session). Default false matches
   * sybilion-client: local session clear only, no redirect (`openUrl: false`).
   */
  useFederatedLogout?: boolean;
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

function readTokenFromLs(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
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
  sdk,
  storageKey,
  logoutReturnTo,
  useFederatedLogout = false,
}: {
  children: ReactNode;
  sdk: SybilionSDK;
  storageKey: string;
  logoutReturnTo?: string;
  useFederatedLogout?: boolean;
}): JSX.Element {
  const auth0 = useAuth0();
  const auth0Ref = useRef(auth0);
  auth0Ref.current = auth0;

  const [sybilionToken, setSybilionToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : readTokenFromLs(storageKey),
  );
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const persistToken = useCallback(
    (t: string | null) => {
      setSybilionToken(t);
      writeLs(storageKey, t);
    },
    [storageKey],
  );

  const doLogout = useCallback(() => {
    setIsLoggingOut(true);
    persistToken(null);
    setExchangeError(null);
    if (useFederatedLogout) {
      const returnTo =
        logoutReturnTo ??
        (typeof window !== 'undefined' ? window.location.origin : undefined);
      void auth0Ref.current.logout({
        logoutParams: returnTo ? { returnTo } : undefined,
      });
    } else {
      void auth0Ref.current.logout({ openUrl: false });
    }
  }, [persistToken, logoutReturnTo, useFederatedLogout]);

  useEffect(() => {
    if (!auth0.isAuthenticated) {
      setIsLoggingOut(false);
    }
  }, [auth0.isAuthenticated]);

  const apiBaseUrl = useMemo(() => getSybilionApiOriginFromSdk(sdk), [sdk]);

  useEffect(() => {
    // While Auth0 restores from localStorage, `isAuthenticated` is false — do not
    // wipe the Sybilion JWT (would break reload: sign-in flash / lost session).
    if (auth0.isLoading) {
      return;
    }
    if (!auth0.isAuthenticated || !auth0.user?.sub) {
      persistToken(null);
    }
  }, [auth0.isLoading, auth0.isAuthenticated, auth0.user?.sub, persistToken]);

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
  }, [sdk, auth0.isAuthenticated, auth0.user?.sub, persistToken, doLogout]);

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

  const hasAuth0User = Boolean(auth0.isAuthenticated && auth0.user?.sub);

  /** Auth0 session is enough for app routes; Sybilion JWT is filled by exchange. */
  const isAuthenticated = Boolean(
    !exchangeError &&
    !isLoggingOut &&
    (hasAuth0User ||
      (Boolean(sybilionToken) && (auth0.isAuthenticated || auth0.isLoading))),
  );

  const needsFirstSybilionToken = Boolean(
    auth0.isAuthenticated &&
    auth0.user &&
    sybilionToken === null &&
    exchangeError === null &&
    !isLoggingOut,
  );

  /** Omit Auth0/exchange "busy" once we already have a Sybilion JWT — avoids header skeleton flicker on refresh. */
  const isLoading =
    (auth0.isLoading && sybilionToken === null) ||
    (exchangeLoading && sybilionToken === null) ||
    needsFirstSybilionToken;

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
  sdk,
  auth0Domain,
  auth0ClientId,
  redirectUri,
  authorizationParams,
  sybilionTokenStorageKey = DEFAULT_TOKEN_KEY,
  logoutReturnTo,
  useFederatedLogout = false,
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
        sdk={sdk}
        storageKey={sybilionTokenStorageKey}
        logoutReturnTo={logoutReturnTo}
        useFederatedLogout={useFederatedLogout}
      >
        {children}
      </InnerSybilionSession>
    </Auth0Provider>
  );
}
