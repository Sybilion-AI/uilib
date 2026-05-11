/** Sybilion platform auth exchange route (joined with trimmed API base URL). */
export const SYBILION_AUTH_LOGIN_PATH = '/v1/auth/login';

export function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}
