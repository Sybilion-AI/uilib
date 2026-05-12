import type { ComponentType } from 'react';

import { Boat, Package, TreeStructure } from '@phosphor-icons/react';
import { ClockAlert, LayoutDashboard } from 'lucide-react';

type IconLike = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

export type WorkspaceAppIconKey =
  | 'grid-four'
  | 'clock'
  | 'boat'
  | 'package'
  | 'tree-structure';

export const WORKSPACE_APP_ICONS: Record<WorkspaceAppIconKey, IconLike> = {
  'grid-four': LayoutDashboard as IconLike,
  clock: ClockAlert as IconLike,
  boat: Boat as IconLike,
  package: Package as IconLike,
  'tree-structure': TreeStructure as IconLike,
};

const ICON_KEYS = Object.keys(WORKSPACE_APP_ICONS) as WorkspaceAppIconKey[];

export function isWorkspaceAppIconKey(v: string): v is WorkspaceAppIconKey {
  return (ICON_KEYS as string[]).includes(v);
}
