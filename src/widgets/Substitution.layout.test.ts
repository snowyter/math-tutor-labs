import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const widgetCss = readFileSync(new URL('./Substitution.css', import.meta.url), 'utf8');
const component = readFileSync(new URL('./Substitution.tsx', import.meta.url), 'utf8');

function hasDeclaration(css: string, selector: string, declaration: string) {
  const selectorBlock = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  return selectorBlock?.[1].includes(declaration) ?? false;
}

describe('substitution control', () => {
  it('labels the editable value as x equals', () => {
    expect(component).toContain('<span className="subst-label">x =</span>');
  });

  it('gives both buttons accessible decrease and increase labels', () => {
    expect(component).toContain('aria-label="Decrease x"');
    expect(component).toContain('aria-label="Increase x"');
  });

  it('makes x and its value prominent', () => {
    expect(hasDeclaration(widgetCss, '\\.subst-label', 'font-size: 20px')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.subst-label', 'font-weight: 700')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.subst-value', 'font-size: 21px')).toBe(true);
  });

  it('keeps the +/- controls compact and balanced', () => {
    expect(hasDeclaration(widgetCss, '\\.subst-control button', 'width: 36px')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.subst-control button', 'height: 36px')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.subst-control button', 'padding: 0')).toBe(true);
  });
});
