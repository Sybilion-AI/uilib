#!/usr/bin/env node
/**
 * Migrate DocsGuidance inline props → AGENT.md + import.
 *
 * Usage: node scripts/migrate-docs-guidance-to-agent-md.mjs [--dry-run]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uilibRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(uilibRoot, 'src');
const pagesDir = path.join(srcRoot, 'docs/pages');

const FOUNDATION_SLUGS = new Set([
  'icons',
  'colors',
  'typography',
  'radii-shadows',
  'motion',
  'spacing',
]);

const PROTECTED_AGENT = new Set(['components/ui/Page/AGENT.md']);

/** @type {Record<string, { slug: string, section: string }>} */
const slugByPageFile = {};

function loadRegistry() {
  const registryPath = path.join(srcRoot, 'docs/registry.ts');
  const text = fs.readFileSync(registryPath, 'utf8');
  const entryRe =
    /slug:\s*'([^']+)'[\s\S]*?section:\s*'([^']+)'[\s\S]*?import\('\.\/pages\/([^']+)'\)/g;
  let m;
  while ((m = entryRe.exec(text))) {
    slugByPageFile[m[3]] = { slug: m[1], section: m[2] };
  }
}

function findPageFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findPageFiles(full));
    } else if (entry.name.endsWith('Page.tsx')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * @param {string} text
 * @returns {string | null}
 */
function extractStringProp(text, prop) {
  const re = new RegExp(`${prop}=\\{?["'\`]([\\s\\S]*?)["'\`]\\}?`, 'm');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

/**
 * @param {string} text
 * @param {string} prop
 * @returns {string[]}
 */
function extractArrayProp(text, prop) {
  const re = new RegExp(`${prop}=\\{\\s*\\[([\\s\\S]*?)\\]\\s*\\}`, 'm');
  const m = text.match(re);
  if (!m) return [];
  const inner = m[1];
  const items = [];
  const itemRe = /['"`]((?:\\.|[^'"\\])*)['"`]/g;
  let im;
  while ((im = itemRe.exec(inner))) {
    items.push(im[1].replace(/\\'/g, "'").replace(/\\"/g, '"'));
  }
  return items;
}

/**
 * @param {string} pageContent
 */
function extractDocsGuidanceBlock(pageContent) {
  const re = /<DocsGuidance[\s\S]*?\/>/m;
  const m = pageContent.match(re);
  if (!m) return null;
  const block = m[0];
  return {
    block,
    overview: extractStringProp(block, 'overview') ?? '',
    whenToUse: extractArrayProp(block, 'whenToUse'),
    whenNotToUse: extractArrayProp(block, 'whenNotToUse'),
    doNotes: extractArrayProp(block, 'doNotes'),
    dontNotes: extractArrayProp(block, 'dontNotes'),
  };
}

/**
 * @param {ReturnType<typeof extractDocsGuidanceBlock>} guidance
 */
function guidanceToMarkdown(guidance) {
  if (!guidance) return '';
  const lines = [guidance.overview, ''];
  if (guidance.whenToUse.length) {
    lines.push('## When to use', ...guidance.whenToUse.map(i => `- ${i}`), '');
  }
  if (guidance.whenNotToUse.length) {
    lines.push(
      '## When not to use',
      ...guidance.whenNotToUse.map(i => `- ${i}`),
      '',
    );
  }
  if (guidance.doNotes.length) {
    lines.push('## Do', ...guidance.doNotes.map(i => `- ${i}`), '');
  }
  if (guidance.dontNotes.length) {
    lines.push("## Don't", ...guidance.dontNotes.map(i => `- ${i}`), '');
  }
  return lines.join('\n').trim() + '\n';
}

/**
 * Convert legacy widget AGENT.md body to unified sections where possible.
 * @param {string} existing
 */
function convertLegacyWidgetBody(existing) {
  const lines = existing.split('\n');
  /** @type {Record<string, string[]>} */
  const sections = {};
  let current = '_intro';
  sections[current] = [];

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      current = h2[1].toLowerCase();
      sections[current] = sections[current] ?? [];
      continue;
    }
    if (line.startsWith('# ') && !sections._intro.length) {
      continue;
    }
    const legacy = line.match(
      /^(Renders|Use when|Not when|Host provides|Requires|Empty\/loading):\s*(.*)$/i,
    );
    if (legacy) {
      const key = legacy[1].toLowerCase().replace(/\s+/g, ' ');
      const map = {
        'use when': 'when to use',
        'not when': 'when not to use',
        'host provides': 'host provides',
        requires: 'requires',
        'empty/loading': 'empty/loading',
      };
      current = map[key] ?? key;
      sections[current] = sections[current] ?? [];
      if (legacy[2].trim()) {
        sections[current].push(`- ${legacy[2].trim()}`);
      }
      continue;
    }
    if (line.trim().startsWith('- ')) {
      sections[current] = sections[current] ?? [];
      sections[current].push(line.trim());
      continue;
    }
    if (line.trim() && current === '_intro' && !line.startsWith('#')) {
      sections._intro.push(line.trim());
    }
  }

  const out = [];
  if (sections._intro?.length) {
    out.push(sections._intro.join(' '), '');
  }
  const order = [
    'when to use',
    'when not to use',
    'do',
    "don't",
    'host provides',
    'requires',
    'empty/loading',
  ];
  for (const key of order) {
    const items = sections[key];
    if (!items?.length) continue;
    const title =
      key === "don't"
        ? "Don't"
        : key
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    out.push(`## ${title}`);
    for (const item of items) {
      out.push(item.startsWith('- ') ? item : `- ${item}`);
    }
    out.push('');
  }
  return out.join('\n').trim() + '\n';
}

/**
 * @param {string} pageContent
 * @param {string} pageRel — e.g. ButtonPage.tsx or StandaloneAppLayoutPage/StandaloneAppLayoutPage.tsx
 */
function resolveAgentPath(pageContent, pageRel) {
  const registryKey = pageRel.replace(/\.tsx$/, '');
  const entry = slugByPageFile[registryKey];
  const slug =
    entry?.slug ??
    registryKey
      .replace(/Page$/, '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

  if (FOUNDATION_SLUGS.has(slug) || entry?.section === 'Foundations') {
    return `docs/agent-guidance/${slug}.md`;
  }

  const importRe = /from\s+['"]#uilib\/components\/(ui|widgets)\/([^/'"]+)/g;
  /** @type {{ kind: string, name: string, score: number }[]} */
  const imports = [];
  let m;
  while ((m = importRe.exec(pageContent))) {
    const kind = m[1];
    const name = m[2];
    let score = kind === 'widgets' ? 10 : 1;
    if (name === 'Page') score = 0;
    if (name === 'Switch' || name === 'Button' || name === 'Label') score = 0;
    imports.push({ kind, name, score });
  }

  imports.sort((a, b) => b.score - a.score);

  if (imports.length) {
    const primary = imports[0];
    const candidate = `components/${primary.kind}/${primary.name}/AGENT.md`;
    if (
      PROTECTED_AGENT.has(candidate) &&
      fs.existsSync(path.join(srcRoot, candidate))
    ) {
      return `docs/agent-guidance/${slug}.md`;
    }
    return candidate;
  }

  return `docs/agent-guidance/${slug}.md`;
}

/**
 * @param {string} agentRel
 */
function importPathForAgent(agentRel) {
  return `#uilib/${agentRel.replace(/\\/g, '/')}`;
}

/**
 * @param {string} agentRel
 */
function varNameFromAgent(agentRel) {
  const base = path.basename(agentRel, '.md');
  const folder = path.basename(path.dirname(agentRel));
  const name = folder === 'agent-guidance' ? base : folder;
  return `${name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Guidance`;
}

function mergeWithExisting(agentAbs, newMd) {
  if (!fs.existsSync(agentAbs)) return newMd;
  const existing = fs.readFileSync(agentAbs, 'utf8');
  if (existing.includes('## When to use')) {
    return newMd;
  }
  const converted = convertLegacyWidgetBody(existing);
  const newSections = newMd.trim();
  if (converted.includes('## When to use')) {
    return converted;
  }
  return `${newSections}\n\n${converted}`.trim() + '\n';
}

function migratePage(pagePath, dryRun) {
  const content = fs.readFileSync(pagePath, 'utf8');
  const guidance = extractDocsGuidanceBlock(content);
  if (!guidance) return { skipped: true };

  const pageRel = path.relative(pagesDir, pagePath);
  const agentRel = resolveAgentPath(content, pageRel);
  const agentAbs = path.join(srcRoot, agentRel);
  const md = guidanceToMarkdown(guidance);
  const finalMd = mergeWithExisting(agentAbs, md);

  const importPath = importPathForAgent(agentRel);
  const varName = varNameFromAgent(agentRel);
  const replacement = `<DocsGuidance source={${varName}} />`;

  let updated = content.replace(guidance.block, replacement);

  const importLine = `import ${varName} from '${importPath}';`;
  if (!updated.includes(importLine)) {
    const lastImportIdx = updated.lastIndexOf('\nimport ');
    if (lastImportIdx !== -1) {
      const endOfLine = updated.indexOf('\n', lastImportIdx + 1);
      updated =
        updated.slice(0, endOfLine + 1) +
        importLine +
        '\n' +
        updated.slice(endOfLine + 1);
    } else {
      updated = importLine + '\n' + updated;
    }
  }

  if (dryRun) {
    console.log(`[dry-run] ${pageRel} → ${agentRel}`);
    return { migrated: true, agentRel };
  }

  fs.mkdirSync(path.dirname(agentAbs), { recursive: true });
  fs.writeFileSync(agentAbs, finalMd, 'utf8');
  fs.writeFileSync(pagePath, updated, 'utf8');
  console.log(`Migrated ${pageRel} → ${agentRel}`);
  return { migrated: true, agentRel };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadRegistry();

  const pages = findPageFiles(pagesDir);
  let migrated = 0;
  let skipped = 0;

  for (const page of pages) {
    const result = migratePage(page, dryRun);
    if (result.skipped) skipped++;
    else if (result.migrated) migrated++;
  }

  console.log(
    `Done: ${migrated} migrated, ${skipped} skipped (no DocsGuidance)`,
  );
}

main();
