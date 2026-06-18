/**
 * Shared AGENT.md parsing for glossary build and docs.
 * Usable from Node build scripts (import this file).
 */

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * @param {string} raw
 * @returns {{ frontmatter: Record<string, unknown>; body: string }}
 */
export function parseAgentFrontmatter(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: trimmed };
  }

  const frontmatter = parseSimpleYaml(match[1]);
  const body = trimmed.slice(match[0].length).trim();
  return { frontmatter, body };
}

/**
 * @param {string} source
 * @returns {string}
 */
export function stripAgentFrontmatter(source) {
  return parseAgentFrontmatter(source).body;
}

/**
 * Minimal YAML parser for AGENT.md frontmatter (profiles, summary).
 * @param {string} yaml
 * @returns {Record<string, unknown>}
 */
function parseSimpleYaml(yaml) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      out[key] = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      out[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

/**
 * @param {string} body
 * @returns {string}
 */
export function firstParagraphSummary(body) {
  const lines = body.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      return t.length > 120 ? `${t.slice(0, 117)}…` : t;
    }
  }
  return '';
}

/**
 * @param {string} text
 * @returns {string}
 */
export function escapeTemplateLiteral(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}
