import cn from 'classnames';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '#uilib/components/ui/Button/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#uilib/components/ui/DropdownMenu';
import type { WorkspaceAppEntry } from '#uilib/components/ui/WorkspaceAppSwitcher/workspaceApp.types';
import { WORKSPACE_APP_ICONS } from '#uilib/components/ui/WorkspaceAppSwitcher/workspaceAppIcons';
import { findWorkspaceAppByPathname } from '#uilib/components/ui/WorkspaceAppSwitcher/workspaceAppPaths';
import { readWorkspaceAppsFromLocalStorage } from '#uilib/components/ui/WorkspaceAppSwitcher/workspaceAppsLocalStorage';
import { ChevronDown } from 'lucide-react';

import S from './WorkspaceAppSwitcher.styl';

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

function entryKey(entry: WorkspaceAppEntry): string {
  return entry.id;
}

function IconTile({
  iconKey,
  accentMuted,
  accent,
}: {
  iconKey: WorkspaceAppEntry['iconKey'];
  accentMuted: string;
  accent: string;
}) {
  const IconComponent = WORKSPACE_APP_ICONS[iconKey];
  return (
    <span
      className={S.iconTile}
      style={
        {
          '--bg-color': accentMuted,
          '--fg-color': accent,
        } as CSSProperties
      }
    >
      <IconComponent className={S.icon} aria-hidden />
    </span>
  );
}

function useResolvedApps(
  appsStorageKey: string | undefined,
  defaultApps: WorkspaceAppEntry[] | undefined,
): WorkspaceAppEntry[] {
  const [apps, setApps] = useState<WorkspaceAppEntry[]>(() => {
    if (
      typeof localStorage !== 'undefined' &&
      appsStorageKey != null &&
      appsStorageKey !== ''
    ) {
      const fromLs = readWorkspaceAppsFromLocalStorage(appsStorageKey);
      if (fromLs != null && fromLs.length > 0) {
        return fromLs;
      }
    }
    return defaultApps ?? [];
  });

  useEffect(() => {
    if (!appsStorageKey || typeof localStorage === 'undefined') {
      setApps(defaultApps ?? []);
      return;
    }
    const fromLs = readWorkspaceAppsFromLocalStorage(appsStorageKey);
    setApps(fromLs != null && fromLs.length > 0 ? fromLs : (defaultApps ?? []));
  }, [appsStorageKey, defaultApps]);

  return apps;
}

export function WorkspaceAppSwitcher({
  pathname,
  onNavigate,
  authenticated = true,
  defaultApps,
  appsStorageKey,
}: WorkspaceAppSwitcherProps) {
  const apps = useResolvedApps(appsStorageKey, defaultApps);

  const current = findWorkspaceAppByPathname(pathname, apps);

  if (!authenticated || apps.length === 0) {
    return null;
  }

  const displayApp = current ?? apps[0];
  if (!displayApp) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={S.trigger}
          aria-label="Select workspace app"
        >
          <IconTile
            iconKey={displayApp.iconKey}
            accentMuted={displayApp.accentMuted}
            accent={displayApp.accent}
          />
          <span className={S.textCol}>
            <span className={S.name}>{displayApp.displayName}</span>
            <span className={S.sub}>{displayApp.subtitle}</span>
          </span>
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={S.menuContent}
        align="start"
        sideOffset={8}
        elevation="md"
      >
        {apps.map(entry => {
          const active =
            current != null ? entryKey(entry) === entryKey(current) : false;

          return (
            <DropdownMenuItem
              key={entry.id}
              className={cn(S.item, active && S.itemActive)}
              onSelect={() => {
                onNavigate(entry.href);
              }}
            >
              <IconTile
                iconKey={entry.iconKey}
                accentMuted={entry.accentMuted}
                accent={entry.accent}
              />
              <span className={S.textCol}>
                <span className={S.name}>{entry.displayName}</span>
                <span className={S.sub}>{entry.subtitle}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
