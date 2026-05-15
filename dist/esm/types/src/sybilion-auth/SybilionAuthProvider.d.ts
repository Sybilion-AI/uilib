import { type RedirectLoginOptions } from '@auth0/auth0-react';
import type { JSX, ReactNode } from 'react';
import type { SybilionSDK } from '@sybilion/platform-sdk';
/** Origin (`scheme://host:port`) for paths like `/api/v1/...`; derived from SDK URL layout. */
export declare function getSybilionApiOriginFromSdk(sdk: SybilionSDK): string;
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
export declare function useSybilionAuth(): SybilionAuthContextValue;
/** fetch() relative to Sybilion API base with Bearer Sybilion JWT. */
export declare function sybilionApiFetch(apiBaseUrl: string, bearerToken: string, path: string, init?: RequestInit): Promise<Response>;
export declare function createSybilionApiFetch(apiBaseUrl: string, getSybilionAccessToken: () => Promise<string | null>): (path: string, init?: RequestInit) => Promise<Response>;
/** Authenticated fetch using {@link useSybilionAuth} context. */
export declare function useSybilionApiFetch(): (path: string, init?: RequestInit) => Promise<Response>;
export declare function SybilionAuthProvider({ children, sdk, auth0Domain, auth0ClientId, redirectUri, authorizationParams, sybilionTokenStorageKey, logoutReturnTo, useFederatedLogout, }: SybilionAuthProviderProps): JSX.Element;
