import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');

/** Tailwind-only syntax that browsers and non-Tailwind bundlers drop or reject. */
const TAILWIND_DIRECTIVE = /@(apply|theme|custom-variant|tailwind|utility|variant)\b/;

describe('published CSS entries', () => {
  it.each(['./tokens.css', './base.css'])(
    'exports %s to an existing file',
    entry => {
      const target = pkg.exports[entry];
      expect(typeof target).toBe('string');
      expect(existsSync(join(ROOT, target))).toBe(true);
    },
  );

  it.each(['assets/tokens.css', 'assets/base.css', 'assets/globals.css'])(
    '%s is plain CSS (no Tailwind directives)',
    file => {
      expect(read(file)).not.toMatch(TAILWIND_DIRECTIVE);
    },
  );

  it('tokens.css declares only custom properties', () => {
    const css = read('assets/tokens.css')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@import[^;]+;/g, '');
    const blocks = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)];
    expect(blocks.map(([, selector]) => selector.trim())).toEqual([
      ':root',
      '.dark',
    ]);
    for (const [, , body] of blocks) {
      const declarations = body
        .split(';')
        .map(d => d.trim())
        .filter(Boolean);
      for (const declaration of declarations) {
        expect(declaration).toMatch(/^--[\w-]+\s*:/);
      }
    }
  });

  it('does not ship Tailwind as a dependency', () => {
    expect(pkg.dependencies?.tailwindcss).toBeUndefined();
    expect(pkg.peerDependencies?.tailwindcss).toBeUndefined();
  });
});
