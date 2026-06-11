import type {
  WorkspaceAppEntry,
  WorkspaceAppSubtitleTone,
} from './workspaceApp.types';
import { isWorkspaceAppIconKey } from './workspaceAppIcons';

function isWorkspaceAppSubtitleTone(v: unknown): v is WorkspaceAppSubtitleTone {
  return v === 'default' || v === 'experimental';
}

function parseEntry(raw: unknown): WorkspaceAppEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const idRaw = o.id ?? o.nativeId;
  const displayName = o.displayName;
  const subtitle = o.subtitle;
  const iconKey = o.iconKey;
  const accent = o.accent;
  const accentMuted = o.accentMuted;
  const href = o.href;
  const subtitleToneRaw = o.subtitleTone;
  const prefixesRaw = o.matchPathPrefixes;

  if (
    typeof idRaw !== 'string' ||
    !idRaw ||
    typeof displayName !== 'string' ||
    typeof subtitle !== 'string' ||
    typeof iconKey !== 'string' ||
    !isWorkspaceAppIconKey(iconKey) ||
    typeof accent !== 'string' ||
    typeof accentMuted !== 'string' ||
    typeof href !== 'string' ||
    !href
  ) {
    return null;
  }

  let matchPathPrefixes: WorkspaceAppEntry['matchPathPrefixes'];
  if (prefixesRaw != null) {
    if (!Array.isArray(prefixesRaw)) {
      return null;
    }
    const prefixes = prefixesRaw.filter(
      (p): p is string => typeof p === 'string',
    );
    if (prefixes.length > 0) {
      matchPathPrefixes = prefixes;
    }
  }

  const entry: WorkspaceAppEntry = {
    id: idRaw,
    displayName,
    subtitle,
    iconKey,
    accent,
    accentMuted,
    href,
    matchPathPrefixes,
  };

  if (subtitleToneRaw != null && isWorkspaceAppSubtitleTone(subtitleToneRaw)) {
    entry.subtitleTone = subtitleToneRaw;
  }

  return entry;
}

/**
 * Read validated workspace apps JSON from localStorage; returns null if missing or invalid.
 */
export function readWorkspaceAppsFromLocalStorage(
  key: string,
): WorkspaceAppEntry[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === '') {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    const apps: WorkspaceAppEntry[] = [];
    for (const item of parsed) {
      const entry = parseEntry(item);
      if (entry) {
        apps.push(entry);
      }
    }
    return apps.length > 0 ? apps : null;
  } catch {
    return null;
  }
}

export function writeWorkspaceAppsToLocalStorage(
  key: string,
  apps: WorkspaceAppEntry[],
): void {
  try {
    localStorage.setItem(key, JSON.stringify(apps));
  } catch {
    // ignore quota / private mode
  }
}
