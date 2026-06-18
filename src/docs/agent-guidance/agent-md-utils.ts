const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export type AgentFrontmatter = {
  profiles?: string[];
  summary?: string;
};

export function parseAgentFrontmatter(raw: string): {
  frontmatter: AgentFrontmatter;
  body: string;
} {
  const trimmed = raw.trim();
  const match = trimmed.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: trimmed };
  }

  const frontmatter = parseSimpleYaml(match[1]) as AgentFrontmatter;
  const body = trimmed.slice(match[0].length).trim();
  return { frontmatter, body };
}

/** Strip optional YAML frontmatter before rendering in docs. */
export function stripAgentFrontmatter(source: string): string {
  return parseAgentFrontmatter(source).body;
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
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
