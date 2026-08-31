import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TableCompare.tsx', import.meta.url), 'utf8');
const widgetCss = readFileSync(new URL('./TableCompare.css', import.meta.url), 'utf8');

describe('table compare widget', () => {
  it('takes tables with change annotations', () => {
    expect(source).toContain('tables: ComparedTable[]');
  });

  it('shows the change in f(x) under each table', () => {
    expect(source).toContain('Change in f(x):');
  });

  it('renders each table through the shared Table widget', () => {
    expect(source).toContain('<Table rows={t.rows}');
  });

  it('namespaces its own css classes', () => {
    expect(widgetCss).toContain('.tcompare');
  });
});
