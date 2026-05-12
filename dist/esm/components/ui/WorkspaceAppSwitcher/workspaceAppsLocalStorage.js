import { isWorkspaceAppIconKey } from './workspaceAppIcons.js';

function parseEntry(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const o = raw;
    const idRaw = o.id ?? o.nativeId;
    const displayName = o.displayName;
    const subtitle = o.subtitle;
    const iconKey = o.iconKey;
    const accent = o.accent;
    const accentMuted = o.accentMuted;
    const href = o.href;
    const prefixesRaw = o.matchPathPrefixes;
    if (typeof idRaw !== 'string' ||
        !idRaw ||
        typeof displayName !== 'string' ||
        typeof subtitle !== 'string' ||
        typeof iconKey !== 'string' ||
        !isWorkspaceAppIconKey(iconKey) ||
        typeof accent !== 'string' ||
        typeof accentMuted !== 'string' ||
        typeof href !== 'string' ||
        !href) {
        return null;
    }
    let matchPathPrefixes;
    if (prefixesRaw != null) {
        if (!Array.isArray(prefixesRaw)) {
            return null;
        }
        const prefixes = prefixesRaw.filter((p) => typeof p === 'string');
        if (prefixes.length > 0) {
            matchPathPrefixes = prefixes;
        }
    }
    return {
        id: idRaw,
        displayName,
        subtitle,
        iconKey,
        accent,
        accentMuted,
        href,
        matchPathPrefixes,
    };
}
/**
 * Read validated workspace apps JSON from localStorage; returns null if missing or invalid.
 */
function readWorkspaceAppsFromLocalStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null || raw === '') {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return null;
        }
        const apps = [];
        for (const item of parsed) {
            const entry = parseEntry(item);
            if (entry) {
                apps.push(entry);
            }
        }
        return apps.length > 0 ? apps : null;
    }
    catch {
        return null;
    }
}
function writeWorkspaceAppsToLocalStorage(key, apps) {
    try {
        localStorage.setItem(key, JSON.stringify(apps));
    }
    catch {
        // ignore quota / private mode
    }
}

export { readWorkspaceAppsFromLocalStorage, writeWorkspaceAppsToLocalStorage };
