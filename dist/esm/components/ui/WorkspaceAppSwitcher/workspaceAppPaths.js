import { WORKSPACE_APP_SLUG_BASE_PATH } from './workspaceApp.types.js';

function workspaceAppSlugPath(id) {
    return `${WORKSPACE_APP_SLUG_BASE_PATH}/${id}`;
}
function pathnameMatchesPrefix(pathname, prefix) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
function pathnameMatchesSlugApp(pathname, id) {
    const base = workspaceAppSlugPath(id);
    return pathname === base || pathname.startsWith(`${base}/`);
}
function findWorkspaceAppByPathname(pathname, apps) {
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

export { findWorkspaceAppByPathname, workspaceAppSlugPath };
