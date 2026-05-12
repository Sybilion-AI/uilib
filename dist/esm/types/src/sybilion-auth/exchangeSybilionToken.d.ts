/** POST `{ identity: auth0AccessToken, type: 'auth0' }` → Sybilion API JWT string. */
export declare function exchangeAuth0AccessTokenForSybilionJwt(
/** API origin only (no trailing slash), same as SDK `baseUrl`. */
apiBaseUrl: string, auth0AccessToken: string): Promise<string>;
