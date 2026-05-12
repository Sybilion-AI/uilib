import type { WorkspaceAppIconKey } from './workspaceAppIcons';

/** Path segment for slug apps: pathname matches `/apps/{id}` */
export const WORKSPACE_APP_SLUG_BASE_PATH = '/apps';

/** One surface in the workspace app switcher (serializable for localStorage). */
export type WorkspaceAppEntry = {
  /** Slug (e.g. `my-custom-app` → `https://sybilion.io/apps/my-custom-app` via `href`). */
  id: string;
  displayName: string;
  subtitle: string;
  iconKey: WorkspaceAppIconKey;
  accent: string;
  accentMuted: string;
  href: string;
  /**
   * Optional. Native / multi-route shells: match current app by pathname prefix.
   * Omit for custom apps deployed under a single slug (`/apps/{id}` only).
   */
  matchPathPrefixes?: readonly string[];
};
