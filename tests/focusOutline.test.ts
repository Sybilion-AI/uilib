import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylus from 'stylus';

const ROOT = join(__dirname, '..');

/** Compile a snippet that uses the shared mixins from lib/theme.styl. */
function compileSnippet(source: string): string {
  let out = '';
  stylus(`@import 'lib/theme.styl'\n${source}`)
    .set('filename', join(ROOT, 'src/focusOutline.test.styl'))
    .set('paths', [join(ROOT, 'src')])
    .render((err, css) => {
      if (err) throw err;
      out = css;
    });
  return out;
}

/**
 * An element marked aria-disabled but not natively disabled is still in the tab
 * order (that is why it is not `disabled`), so it must still show where focus
 * is. Only the truly unfocusable cases are excluded.
 */
describe('shared focus ring', () => {
  it('focus-outline() keeps the ring on aria-disabled elements', () => {
    const css = compileSnippet('.root\n  focus-outline()\n');
    const selector = css.match(/\.root:focus-visible[^{]*/)?.[0] ?? '';
    expect(selector).toContain(':not(:disabled)');
    expect(selector).toContain(':not([data-disabled])');
    expect(selector).not.toContain('aria-disabled');
  });

  it('base.css keeps the ring on aria-disabled elements', () => {
    const css = readFileSync(join(ROOT, 'assets/base.css'), 'utf8');
    const ring = css.match(/:where\([\s\S]*?\):focus-visible[\s\S]*?\{/)?.[0];
    expect(ring).toBeDefined();
    expect(ring).toContain(':not(:disabled)');
    expect(ring).not.toContain('aria-disabled');
  });
});
