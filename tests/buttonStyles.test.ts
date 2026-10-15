import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylus from 'stylus';

const ROOT = join(__dirname, '..');

/** Compile a .styl the way the build does (CSS-module class names stay plain). */
function compile(file: string): string {
  const path = join(ROOT, file);
  let out = '';
  stylus(readFileSync(path, 'utf8'))
    .set('filename', path)
    .set('paths', [join(ROOT, 'src')])
    .render((err, css) => {
      if (err) throw err;
      out = css;
    });
  return out;
}

/** The declarations of every rule whose selector matches `selector`. */
function declarationsFor(css: string, selector: RegExp): string[] {
  return [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
    .filter(([, sel]) => selector.test(sel.trim()))
    .map(([, , body]) => body);
}

describe('Button styles', () => {
  const css = compile('src/components/ui/Button/Button.styl');

  it('reads its font from the body-font token', () => {
    const [root] = declarationsFor(css, /^\.root$/);
    expect(root).toMatch(/font-family:\s*var\(--font-family-body,/);
    expect(root).not.toMatch(/font-family:\s*['"]?Manrope/);
  });

  describe('disabled', () => {
    it('keeps pointer events so a title hint can show, and says so with a cursor', () => {
      const disabled = declarationsFor(css, /^\.root:disabled$/).join('');
      expect(disabled).not.toMatch(/pointer-events/);
      expect(disabled).toMatch(/cursor:\s*not-allowed/);
      expect(disabled).toMatch(/opacity:\s*0?\.5/);
    });

    it('does not paint hover or active styles on a disabled button', () => {
      const interactive = [...css.matchAll(/([^{}@]+)\{[^{}]*\}/g)]
        .map(([, sel]) => sel.trim())
        .filter(sel => /:(hover|active)\b/.test(sel));
      expect(interactive.length).toBeGreaterThan(0);
      for (const selector of interactive) {
        // :where() keeps the guard at zero specificity.
        expect(selector).toContain(':where(:not(:disabled))');
      }
    });
  });
});
