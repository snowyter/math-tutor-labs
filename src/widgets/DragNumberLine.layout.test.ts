import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const widgetCss = readFileSync(new URL('./DragNumberLine.css', import.meta.url), 'utf8');
const component = readFileSync(new URL('./DragNumberLine.tsx', import.meta.url), 'utf8');

function hasDeclaration(css: string, selector: string, declaration: string) {
  const selectorBlock = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  return selectorBlock?.[1].includes(declaration) ?? false;
}

describe('drag number line interaction', () => {
  it('prevents native selection while dragging the number line', () => {
    expect(hasDeclaration(widgetCss, '\\.dnumberline-svg', 'user-select: none')).toBe(true);
    expect(hasDeclaration(widgetCss, '\\.dnumberline-svg', '-webkit-user-select: none')).toBe(true);
  });

  it('cancels the browser default pointer action when dragging starts', () => {
    expect(component).toContain('e.preventDefault();');
  });
});
