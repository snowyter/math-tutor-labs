import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const widgetCss = readFileSync(new URL('./BalanceScale.css', import.meta.url), 'utf8');
const responsiveCss = readFileSync(new URL('../styles/responsive.css', import.meta.url), 'utf8');

function hasDeclaration(css: string, selector: string, declaration: string) {
  const selectorBlock = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  return selectorBlock?.[1].includes(declaration) ?? false;
}

describe('balance scale layout', () => {
  it('reserves the pan height instead of letting pans overflow the beam', () => {
    expect(hasDeclaration(widgetCss, '\\.balance-beam', 'height: auto')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-beam', 'min-height: 84px')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-beam', 'background: transparent')).toBe(true);
  });

  it('draws the beam line inside the reserved scale area', () => {
    expect(hasDeclaration(widgetCss, '\\.balance-beam::after', 'bottom: 0')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-beam::after', 'height: 4px')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-beam::after', 'background: var(--axis)')).toBe(true);
  });

  it('keeps the equation above any scale artwork', () => {
    expect(hasDeclaration(widgetCss, '\\.balance-equation', 'position: relative')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-equation', 'z-index: 1')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.balance-equation', 'background: var(--panel)')).toBe(true);
  });

  it('centers the equation box within the balance layout', () => {
    expect(hasDeclaration(widgetCss, '\\.balance-equation', 'align-self: center')).toBe(true);
  });

  it('keeps enough scale space on narrow screens', () => {
    expect(hasDeclaration(responsiveCss, '\\.balance-beam', 'min-height: 72px')).toBe(true);
  });
});
