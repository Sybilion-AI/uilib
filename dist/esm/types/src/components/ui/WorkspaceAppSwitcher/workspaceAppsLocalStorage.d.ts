import type { WorkspaceAppEntry } from './workspaceApp.types';
/**
 * Read validated workspace apps JSON from localStorage; returns null if missing or invalid.
 */
export declare function readWorkspaceAppsFromLocalStorage(key: string): WorkspaceAppEntry[] | null;
export declare function writeWorkspaceAppsToLocalStorage(key: string, apps: WorkspaceAppEntry[]): void;
