import type { WorkspaceAppEntry } from './workspaceApp.types';
export declare function workspaceAppSlugPath(id: string): string;
export declare function findWorkspaceAppByPathname(pathname: string, apps: readonly WorkspaceAppEntry[]): WorkspaceAppEntry | null;
