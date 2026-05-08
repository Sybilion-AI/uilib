import type { ReactNode } from 'react';
import React from 'react';
import { type ThemeSyncPayload } from './miniAppProtocol';
import { type MiniAppThemeConfig } from './miniAppThemeConfig';
export type MiniAppShellContextValue = {
    theme: ThemeSyncPayload;
};
export declare function useMiniAppShellTheme(): MiniAppShellContextValue;
export type MiniAppRootProps = {
    children: ReactNode;
    className?: string;
    /** Included in READY payload when set. */
    appId?: string;
    onThemeChange?: (theme: ThemeSyncPayload) => void;
    /** Overrides `@homecode/ui` `<Theme config>` builder (defaults to generic mini-app palette). */
    getThemeConfig?: (isDarkMode: boolean) => MiniAppThemeConfig;
};
export declare function MiniAppRoot({ children, className, appId, onThemeChange, getThemeConfig, }: MiniAppRootProps): React.ReactElement;
