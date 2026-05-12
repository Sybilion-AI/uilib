import type { WorkspaceAppEntry } from './workspaceApp.types';
import { WORKSPACE_APP_SLUG_BASE_PATH } from './workspaceApp.types';

export function workspaceAppSlugPath(id: string): string {
  return `${WORKSPACE_APP_SLUG_BASE_PATH}/${id}`;
}

function pathnameMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function pathnameMatchesSlugApp(pathname: string, id: string): boolean {
  const base = workspaceAppSlugPath(id);
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function findWorkspaceAppByPathname(
  pathname: string,
  apps: readonly WorkspaceAppEntry[],
): WorkspaceAppEntry | null {
  for (const app of apps) {
    const prefixes = app.matchPathPrefixes;
    if (prefixes && prefixes.length > 0) {
      if (prefixes.some(prefix => pathnameMatchesPrefix(pathname, prefix))) {
        return app;
      }
      continue;
    }
    if (pathnameMatchesSlugApp(pathname, app.id)) {
      return app;
    }
  }
  return null;
}
