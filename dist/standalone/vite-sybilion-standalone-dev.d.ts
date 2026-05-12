import type { UserConfig } from 'vite';
export type SybilionStandaloneViteDevOptions = {
    mode: string;
    /** Directory containing `.env*` files. @default process.cwd() */
    envDir?: string;
    /** Prefix proxied to Sybilion API (SDK `apiPrefix`). @default `/api` */
    apiPrefix?: string;
};
/**
 * Vite `server` + `preview` fragment for standalone Sybilion SPAs: same-origin `/api` in dev,
 * proxied to `VITE_SYBILION_API_BASE_URL`. Uses `PORT` from env (default `3000`).
 */
export declare function sybilionStandaloneViteDev(options: SybilionStandaloneViteDevOptions): Pick<UserConfig, 'server' | 'preview'>;
