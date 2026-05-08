import type { ReactNode } from 'react';
import React from 'react';
import { type ThemeSyncPayload } from './miniAppProtocol';
export type MiniAppShellContextValue = {
    theme: ThemeSyncPayload;
};
export declare function useMiniAppShellTheme(): MiniAppShellContextValue;
export type MiniAppRootProps = {
    children: ReactNode;
    /** Included in READY payload when set. */
    appId?: string;
    onThemeChange?: (theme: ThemeSyncPayload) => void;
};
export declare function MiniAppRoot({ children, appId, onThemeChange, }: MiniAppRootProps): React.ReactElement;
