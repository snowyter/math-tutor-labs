import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const widgetCss = readFileSync(new URL('./FractionBars.css', import.meta.url), 'utf8');
const responsiveCss = readFileSync(new URL('../styles/responsive.css', import.meta.url), 'utf8');

function hasDeclaration(css: string, selector: string, declaration: string) {
  const selectorBlock = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  return selectorBlock?.[1].includes(declaration) ?? false;
}

describe('fraction bar layout', () => {
  it('keeps comparison rows in stable label-and-bar columns', () => {
    expect(hasDeclaration(widgetCss, '\\.fbars-row', 'display: grid')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.fbars-row', 'grid-template-columns:')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.fbars-row \\.fbar', 'width: auto')).toBe(true);
  });

  it('stacks each comparison label above its bar on narrow screens', () => {
    expect(hasDeclaration(responsiveCss, '\\.fbars-row', 'grid-template-columns: minmax(0, 1fr)')).toBe(true);
    expect(hasDeclaration(responsiveCss, '\\.fbars-row', 'align-items: start')).toBe(true);
    expect(hasDeclaration(responsiveCss, '\\.fbars-row \\.fbar', 'width: 100%')).toBe(true);
  });

  it('gives editable controls predictable rows on narrow screens', () => {
    expect(hasDeclaration(widgetCss, '\\.fbars-controls', 'display: grid')).toBe(true);
    expect(hasDeclaration(responsiveCss, '\\.fbars-controls', 'grid-template-columns: 1fr')).toBe(true);
  });
});
