import type { WorkspaceAppEntry } from '#uilib/components/ui/WorkspaceAppSwitcher/workspaceApp.types';
export type WorkspaceAppSwitcherProps = {
    pathname: string;
    onNavigate: (href: string) => void;
    /** When false, renders nothing (host maps from auth Loading + signed-in). */
    authenticated?: boolean;
    /** Fallback when localStorage missing/invalid/unset — keep referentially stable across renders where possible */
    defaultApps?: WorkspaceAppEntry[];
    /** When set, read apps from localStorage (`readWorkspaceAppsFromLocalStorage`). */
    appsStorageKey?: string;
};
export declare function WorkspaceAppSwitcher({ pathname, onNavigate, authenticated, defaultApps, appsStorageKey, }: WorkspaceAppSwitcherProps): import("react/jsx-runtime").JSX.Element;
