import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const UILIB_GLOBALS = join(__dirname, '..', 'assets', 'globals.css');
const APP_GLOBALS = join(__dirname, '..', '..', 'app', 'assets', 'globals.css');
const STANDALONE_GLOBALS = join(
  __dirname,
  '..',
  '..',
  'standalone-app-template',
  'src',
  'standalone-global.css',
);

/** Design tokens added by the design-system update; must exist in both files. */
const SHARED_TOKENS = [
  '--radius-0',
  '--radius-1',
  '--radius-2',
  '--radius-3',
  '--radius-4',
  '--radius-pill',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-button',
  '--radius-card',
  '--radius-input',
  '--shadow-0',
  '--shadow-1',
  '--shadow-2',
  '--shadow-3',
  '--ease-standard',
  '--ease-exit',
  '--dur-fast',
  '--dur-base',
  '--dur-slow',
  '--icon-stroke',
  '--icon-size-sm',
  '--icon-size-md',
  '--icon-size-lg',
  '--icon-size-xl',
  '--text-display-xl',
  '--text-display-l',
  '--text-display-m',
  '--text-display-s',
  '--text-2xs',
  '--lh-tight',
  '--lh-snug',
  '--lh-normal',
  '--lh-loose',
  '--tracking-display',
  '--tracking-heading',
  '--tracking-body',
  '--tracking-label',
  '--status-positive',
  '--status-positive-bg',
  '--status-negative',
  '--status-negative-bg',
];

/** Custom property names declared inside the top-level :root block. */
function parseRootTokens(cssPath: string): Set<string> {
  const css = readFileSync(cssPath, 'utf8');
  const tokens = new Set<string>();
  const rootBlocks = css.matchAll(/:root\s*\{([^}]*)\}/g);
  for (const block of rootBlocks) {
    for (const declaration of block[1].matchAll(/(--[\w-]+)\s*:/g)) {
      tokens.add(declaration[1]);
    }
  }
  return tokens;
}

describe('design token sync between uilib, app, and standalone template', () => {
  it('finds all globals.css files', () => {
    expect(existsSync(UILIB_GLOBALS)).toBe(true);
    expect(existsSync(APP_GLOBALS)).toBe(true);
    expect(existsSync(STANDALONE_GLOBALS)).toBe(true);
  });

  it.each([
    ['uilib', UILIB_GLOBALS],
    ['app', APP_GLOBALS],
    ['standalone-app-template', STANDALONE_GLOBALS],
  ])('declares every shared design token in %s globals.css', (_name, file) => {
    const declared = parseRootTokens(file);
    const missing = SHARED_TOKENS.filter(token => !declared.has(token));
    expect(missing).toEqual([]);
  });

  it('keeps dark-mode status token overrides in all files', () => {
    for (const file of [UILIB_GLOBALS, APP_GLOBALS, STANDALONE_GLOBALS]) {
      const css = readFileSync(file, 'utf8');
      const darkBlock = css.match(/\.dark\s*\{[^}]*\}/g)?.join('\n') ?? '';
      expect(darkBlock).toContain('--status-positive');
      expect(darkBlock).toContain('--status-negative');
    }
  });
});
