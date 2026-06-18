/** @typedef {'workspace' | 'content'} ProfileKey */

/** @typedef {{ relPath: string, pkgPath: string, name: string, summary: string, profiles: ProfileKey[], category: string, body: string }} AgentDocEntry */

export const INDEX_CATEGORIES = ['Layout', 'UI', 'Widgets', 'Foundations'];

/**
 * @param {string} relPath — path relative to uilib `src/`
 * @returns {ProfileKey[]}
 */
export function defaultProfilesForPath(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('docs/agent-guidance/')) {
    return ['workspace'];
  }
  if (normalized.startsWith('components/widgets/')) {
    return ['workspace', 'content'];
  }
  if (normalized.startsWith('components/ui/Page/AGENT.md')) {
    return ['workspace', 'content'];
  }
  if (normalized.startsWith('components/ui/')) {
    return ['workspace'];
  }
  return ['workspace'];
}

/**
 * @param {string} relPath
 * @returns {string}
 */
export function categoryForPath(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('docs/agent-guidance/')) return 'Foundations';
  if (normalized.startsWith('components/widgets/')) return 'Widgets';
  if (normalized.includes('/Page/AGENT.md')) return 'Layout';
  if (normalized.startsWith('components/ui/')) return 'UI';
  return 'UI';
}

/**
 * @param {string} relPath — e.g. components/ui/Card/AGENT.md
 * @returns {string}
 */
export function displayNameFromPath(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('docs/agent-guidance/')) {
    const slug = pathBasename(normalized, '.md');
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  const parts = normalized.split('/');
  const folder = parts[parts.length - 2] ?? 'Unknown';
  return folder;
}

function pathBasename(p, ext) {
  const base = p.split('/').pop() ?? p;
  return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
}

/**
 * @param {string} relPath — relative to src/
 * @returns {string} — relative to uilib package root (src/…)
 */
export function pkgPathFromSrcRel(relPath) {
  return `src/${relPath.replace(/\\/g, '/')}`;
}
