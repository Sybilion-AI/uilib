/** POST `{ identity: auth0AccessToken, type: 'auth0' }` → Sybilion API JWT string. */
export declare function exchangeAuth0AccessTokenForSybilionJwt(apiBaseUrl: string, auth0AccessToken: string): Promise<string>;
