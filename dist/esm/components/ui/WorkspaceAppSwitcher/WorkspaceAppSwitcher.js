import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import { Button } from '../Button/Button.js';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../DropdownMenu/DropdownMenu.js';
import { WORKSPACE_APP_ICONS } from './workspaceAppIcons.js';
import { findWorkspaceAppByPathname } from './workspaceAppPaths.js';
import { readWorkspaceAppsFromLocalStorage } from './workspaceAppsLocalStorage.js';
import { ChevronDown } from 'lucide-react';
import S from './WorkspaceAppSwitcher.styl.js';

function entryKey(entry) {
    return entry.id;
}
function IconTile({ iconKey, accentMuted, accent, }) {
    const IconComponent = WORKSPACE_APP_ICONS[iconKey];
    return (jsx("span", { className: S.iconTile, style: {
            '--bg-color': accentMuted,
            '--fg-color': accent,
        }, children: jsx(IconComponent, { className: S.icon, "aria-hidden": true }) }));
}
function useResolvedApps(appsStorageKey, defaultApps) {
    const [apps, setApps] = useState(() => {
        if (typeof localStorage !== 'undefined' &&
            appsStorageKey != null &&
            appsStorageKey !== '') {
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
function WorkspaceAppSwitcher({ pathname, onNavigate, authenticated = true, defaultApps, appsStorageKey, }) {
    const apps = useResolvedApps(appsStorageKey, defaultApps);
    const current = findWorkspaceAppByPathname(pathname, apps);
    if (!authenticated || apps.length === 0) {
        return null;
    }
    const displayApp = current ?? apps[0];
    if (!displayApp) {
        return null;
    }
    return (jsxs(DropdownMenu, { children: [jsx(DropdownMenuTrigger, { asChild: true, children: jsxs(Button, { variant: "ghost", className: S.trigger, "aria-label": "Select workspace app", children: [jsx(IconTile, { iconKey: displayApp.iconKey, accentMuted: displayApp.accentMuted, accent: displayApp.accent }), jsxs("span", { className: S.textCol, children: [jsx("span", { className: S.name, children: displayApp.displayName }), jsx("span", { className: S.sub, children: displayApp.subtitle })] }), jsx(ChevronDown, { size: 12 })] }) }), jsx(DropdownMenuContent, { className: S.menuContent, align: "start", sideOffset: 8, elevation: "md", children: apps.map(entry => {
                    const active = current != null ? entryKey(entry) === entryKey(current) : false;
                    return (jsxs(DropdownMenuItem, { className: cn(S.item, active && S.itemActive), onSelect: () => {
                            onNavigate(entry.href);
                        }, children: [jsx(IconTile, { iconKey: entry.iconKey, accentMuted: entry.accentMuted, accent: entry.accent }), jsxs("span", { className: S.textCol, children: [jsx("span", { className: S.name, children: entry.displayName }), jsx("span", { className: S.sub, children: entry.subtitle })] })] }, entry.id));
                }) })] }));
}

export { WorkspaceAppSwitcher };
