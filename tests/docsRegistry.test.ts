import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  DOC_DEFAULT_SLUG,
  DOC_REGISTRY,
  DOC_SECTION_ORDER,
} from '../src/docs/registry';

const DOCS_DIR = join(__dirname, '..', 'src', 'docs');
const PAGES_DIR = join(DOCS_DIR, 'pages');

/** All page modules under src/docs/pages, as './pages/…' specifiers without extension. */
function collectPageModules(): string[] {
  const modules: string[] = [];
  for (const entry of readdirSync(PAGES_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('Page.tsx')) {
      modules.push(`./pages/${entry.name.replace(/\.tsx$/, '')}`);
    }
    if (entry.isDirectory()) {
      for (const nested of readdirSync(join(PAGES_DIR, entry.name))) {
        if (nested.endsWith('Page.tsx')) {
          modules.push(`./pages/${entry.name}/${nested.replace(/\.tsx$/, '')}`);
        }
      }
    }
  }
  return modules;
}

/** Import specifiers used by load() callbacks in the registry source. */
function collectRegisteredModules(): string[] {
  const source = readFileSync(join(DOCS_DIR, 'registry.ts'), 'utf8');
  return [...source.matchAll(/import\('(\.\/pages\/[^']+)'\)/g)].map(
    match => match[1],
  );
}

describe('docs registry', () => {
  it('has unique slugs', () => {
    const slugs = DOC_REGISTRY.map(entry => entry.slug);
    const duplicates = slugs.filter(
      (slug, index) => slugs.indexOf(slug) !== index,
    );
    expect(duplicates).toEqual([]);
  });

  it('includes the default slug', () => {
    expect(DOC_REGISTRY.some(entry => entry.slug === DOC_DEFAULT_SLUG)).toBe(
      true,
    );
  });

  it('only uses sections listed in DOC_SECTION_ORDER', () => {
    const known = new Set<string>(DOC_SECTION_ORDER);
    const unknown = DOC_REGISTRY.filter(entry => !known.has(entry.section));
    expect(unknown.map(entry => `${entry.slug}: ${entry.section}`)).toEqual([]);
  });

  it('registers every *Page.tsx module under src/docs/pages', () => {
    const registered = new Set(collectRegisteredModules());
    const missing = collectPageModules().filter(
      module =>
        !registered.has(module) &&
        // Nested pages may be registered via their folder's main file.
        !registered.has(module.replace(/\/[^/]+$/, '')),
    );
    expect(missing).toEqual([]);
  });

  it('references only existing page modules', () => {
    const files = new Set(collectPageModules());
    const broken = collectRegisteredModules().filter(
      module => !files.has(module),
    );
    expect(broken).toEqual([]);
  });

  it('resolves every load() to a component', async () => {
    const loaded = await Promise.all(
      DOC_REGISTRY.map(async entry => ({
        slug: entry.slug,
        module: await entry.load(),
      })),
    );
    const withoutComponent = loaded.filter(
      ({ module }) => typeof module.default !== 'function',
    );
    expect(withoutComponent.map(({ slug }) => slug)).toEqual([]);
  }, 60000);
});
