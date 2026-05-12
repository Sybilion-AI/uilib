import type { ComponentType } from 'react';
type IconLike = ComponentType<{
    className?: string;
    'aria-hidden'?: boolean;
}>;
export type WorkspaceAppIconKey = 'grid-four' | 'clock' | 'boat' | 'package' | 'tree-structure';
export declare const WORKSPACE_APP_ICONS: Record<WorkspaceAppIconKey, IconLike>;
export declare function isWorkspaceAppIconKey(v: string): v is WorkspaceAppIconKey;
export {};
