#!/usr/bin/env node
/**
 * Build AGENT.md glossary indexes for coding agents.
 *
 * Usage:
 *   node scripts/build-agent-glossary.mjs content
 *   node scripts/build-agent-glossary.mjs workspace
 *   node scripts/build-agent-glossary.mjs --all
 *
 * Env:
 *   SYBILION_UILIB_SRC — override uilib src root
 *   AGENT_GLOSSARY_APPEND — comma-separated extra markdown files (e.g. app report-only tiles)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  INDEX_CATEGORIES,
  categoryForPath,
  defaultProfilesForPath,
  displayNameFromPath,
  pkgPathFromSrcRel,
} from './agent-glossary-profiles.mjs';
import {
  escapeTemplateLiteral,
  firstParagraphSummary,
  parseAgentFrontmatter,
  stripAgentFrontmatter,
} from './agent-md-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uilibRoot = path.resolve(__dirname, '..');

function resolveSrcRoot() {
  if (process.env.SYBILION_UILIB_SRC) {
    return path.resolve(process.env.SYBILION_UILIB_SRC);
  }
  return path.join(uilibRoot, 'src');
}

function discoverAgentFiles(srcRoot) {
  /** @type {string[]} */
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === 'AGENT.md') {
        files.push(path.relative(srcRoot, full));
      }
    }
  }

  walk(path.join(srcRoot, 'components'));

  const guidanceDir = path.join(srcRoot, 'docs/agent-guidance');
  if (fs.existsSync(guidanceDir)) {
    for (const name of fs.readdirSync(guidanceDir)) {
      if (name.endsWith('.md') && name !== 'README.md') {
        files.push(path.join('docs/agent-guidance', name));
      }
    }
  }

  return files.sort();
}

/**
 * @param {string} srcRoot
 * @param {string} relPath
 */
function loadEntry(srcRoot, relPath) {
  const abs = path.join(srcRoot, relPath);
  if (!fs.existsSync(abs)) return null;

  const raw = fs.readFileSync(abs, 'utf8').trim();
  const { frontmatter, body } = parseAgentFrontmatter(raw);
  const strippedBody = stripAgentFrontmatter(raw);

  /** @type {import('./agent-glossary-profiles.mjs').ProfileKey[]} */
  let profiles = defaultProfilesForPath(relPath);
  if (Array.isArray(frontmatter.profiles) && frontmatter.profiles.length) {
    profiles =
      /** @type {import('./agent-glossary-profiles.mjs').ProfileKey[]} */ (
        frontmatter.profiles.filter(p => p === 'workspace' || p === 'content')
      );
  }

  const summary =
    typeof frontmatter.summary === 'string' && frontmatter.summary.trim()
      ? frontmatter.summary.trim()
      : firstParagraphSummary(strippedBody);

  return {
    relPath: relPath.replace(/\\/g, '/'),
    pkgPath: pkgPathFromSrcRel(relPath),
    name: displayNameFromPath(relPath),
    summary,
    profiles,
    category: categoryForPath(relPath),
    body: strippedBody,
  };
}

/**
 * @param {ReturnType<typeof loadEntry>[]} entries
 * @param {'workspace' | 'content'} profileKey
 */
function buildIndex(profileKey, entries) {
  const filtered = entries.filter(e => e && e.profiles.includes(profileKey));
  const title =
    profileKey === 'content'
      ? '# Sybilion UI glossary (content)'
      : '# Sybilion UI glossary (workspace)';

  const intro =
    profileKey === 'content'
      ? 'Entry point for report/dashboard agents using `@sybilion/uilib`. Open linked AGENT.md before using a component.'
      : 'Entry point for `@sybilion/uilib`. Open linked AGENT.md before using a component.';

  const lines = [title, '', intro, ''];

  for (const category of INDEX_CATEGORIES) {
    const group = filtered
      .filter(e => e.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!group.length) continue;

    lines.push(`## ${category}`, '');
    for (const entry of group) {
      const dash = entry.summary ? ` — ${entry.summary}` : '';
      lines.push(`- [${entry.name}](${entry.pkgPath})${dash}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * @param {ReturnType<typeof loadEntry>[]} entries
 */
function buildContentPrompt(entries) {
  const filtered = entries.filter(
    e => e && e.profiles.includes('content') && e.body,
  );
  const sections = [
    '# Sybilion page content glossary (embedded)',
    '',
    'Component usage for report/dashboard LLM prompts. Paths are relative to `@sybilion/uilib` package root.',
    '',
  ];

  for (const entry of filtered.sort((a, b) => a.name.localeCompare(b.name))) {
    sections.push(`## ${entry.name}`, '', entry.body, '');
  }

  const appendEnv = process.env.AGENT_GLOSSARY_APPEND ?? '';
  for (const raw of appendEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)) {
    const resolved = path.isAbsolute(raw) ? raw : path.resolve(uilibRoot, raw);
    if (fs.existsSync(resolved)) {
      sections.push('', fs.readFileSync(resolved, 'utf8').trim());
    }
  }

  return sections.join('\n').trim();
}

function writeProfileOutputs(profileKey, indexMd) {
  const outDir = path.join(uilibRoot, 'dist/agent-glossary');
  fs.mkdirSync(outDir, { recursive: true });

  const mdPath = path.join(outDir, `${profileKey}.index.md`);
  fs.writeFileSync(mdPath, `${indexMd}\n`, 'utf8');

  const constName =
    profileKey === 'content'
      ? 'CONTENT_AGENT_UI_INDEX'
      : 'WORKSPACE_AGENT_UI_INDEX';
  const tsPath = path.join(outDir, `${profileKey}.generated.ts`);
  const escaped = escapeTemplateLiteral(indexMd);
  const ts = `/** Generated by scripts/build-agent-glossary.mjs — do not edit. */\nexport const ${constName} = \`${escaped}\`;\n`;
  fs.writeFileSync(tsPath, ts, 'utf8');
  console.log(`Wrote ${mdPath} (${indexMd.length} chars)`);
  console.log(`Wrote ${tsPath}`);
}

function writeContentPrompt(promptMd) {
  const outDir = path.join(uilibRoot, 'dist/agent-glossary');
  fs.mkdirSync(outDir, { recursive: true });

  const mdPath = path.join(outDir, 'content.prompt.md');
  fs.writeFileSync(mdPath, `${promptMd}\n`, 'utf8');

  const tsPath = path.join(outDir, 'content-prompt.generated.ts');
  const escaped = escapeTemplateLiteral(promptMd);
  const ts = `/** Generated by scripts/build-agent-glossary.mjs — do not edit. */\nexport const CONTENT_AGENT_UI_PROMPT = \`${escaped}\`;\n`;
  fs.writeFileSync(tsPath, ts, 'utf8');
  console.log(`Wrote ${mdPath} (${promptMd.length} chars)`);
  console.log(`Wrote ${tsPath}`);

  // Legacy alias for app build script that reads content.md
  const legacyPath = path.join(outDir, 'content.md');
  fs.writeFileSync(legacyPath, `${promptMd}\n`, 'utf8');
  console.log(`Wrote ${legacyPath} (legacy alias)`);

  const legacyTsPath = path.join(outDir, 'content.generated.ts');
  const legacyTs = `/** Generated by scripts/build-agent-glossary.mjs — do not edit. */\nexport const CONTENT_AGENT_UI_GLOSSARY = \`${escaped}\`;\nexport { CONTENT_AGENT_UI_PROMPT } from './content-prompt.generated.js';\n`;
  fs.writeFileSync(legacyTsPath, legacyTs, 'utf8');
  console.log(`Wrote ${legacyTsPath}`);
}

function buildAll() {
  const srcRoot = resolveSrcRoot();
  const relPaths = discoverAgentFiles(srcRoot);
  const entries = relPaths.map(rel => loadEntry(srcRoot, rel)).filter(Boolean);

  console.log(`Discovered ${entries.length} AGENT.md files`);

  writeProfileOutputs('workspace', buildIndex('workspace', entries));
  writeProfileOutputs('content', buildIndex('content', entries));
  writeContentPrompt(buildContentPrompt(entries));

  const workspaceLegacy = path.join(
    uilibRoot,
    'dist/agent-glossary/workspace.md',
  );
  fs.writeFileSync(
    workspaceLegacy,
    `${buildIndex('workspace', entries)}\n`,
    'utf8',
  );
  console.log(`Wrote ${workspaceLegacy} (legacy alias)`);
}

const arg = process.argv[2] ?? 'content';
if (arg === '--all') {
  buildAll();
} else if (arg === 'workspace' || arg === 'content') {
  const srcRoot = resolveSrcRoot();
  const entries = discoverAgentFiles(srcRoot)
    .map(rel => loadEntry(srcRoot, rel))
    .filter(Boolean);
  writeProfileOutputs(arg, buildIndex(arg, entries));
  if (arg === 'content') {
    writeContentPrompt(buildContentPrompt(entries));
  }
} else {
  console.error(`Unknown profile "${arg}". Use workspace, content, or --all`);
  process.exit(1);
}
