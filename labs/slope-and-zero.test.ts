import { describe, it, expect } from 'vitest';
import { sectionsFor } from './slope-and-zero';
import { exampleFrom } from '../src/engine/generate';
import { rat, format, sub, div } from '../src/engine/rational';
import type { TableKind } from '../src/engine/types';

const KINDS: TableKind[] = ['includes-zero', 'excludes-zero'];

function tableSection(m: ReturnType<typeof rat>, b: ReturnType<typeof rat>, kind: TableKind) {
  const ex = exampleFrom(m, b, kind);
  const section = sectionsFor(ex).find((s) => s.id.startsWith('from-table'))!;
  return { ex, section, joined: section.steps.map((s) => s.text).join(' ') };
}

describe('slope lab: rate of change', () => {
  it('names slope as a rate of change where it is first defined', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const defs = sectionsFor(ex).find((s) => s.id === 'definitions')!;
    expect(defs.body).toContain('rate of change');
  });
});

describe('slope lab: rise/run to coordinate-formula bridge', () => {
  for (const kind of KINDS) {
    it(`shows the two-point formula in the ${kind} table section`, () => {
      const { joined } = tableSection(rat(2), rat(-8), kind);
      expect(joined).toContain('(y₂ − y₁)/(x₂ − x₁)');
    });

    it(`works the bridge from the table's own two rows in ${kind}`, () => {
      const { ex, joined } = tableSection(rat(2), rat(-8), kind);
      const a = ex.table[0]!;
      const b = ex.table[1]!;
      const rise = sub(b.y, a.y);
      const run = rat(b.x - a.x);
      // the worked rise, run and slope must all actually appear
      expect(joined).toContain(`= ${format(rise)}`);
      expect(joined).toContain(`= ${format(run)}`);
      expect(joined).toContain(format(ex.m));
      expect(joined).toContain(String(a.x));
      expect(joined).toContain(String(b.x));
    });

    it(`bridge arithmetic really gives the example slope in ${kind}`, () => {
      const { ex } = tableSection(rat(2), rat(-8), kind);
      const a = ex.table[0]!;
      const b = ex.table[1]!;
      // rise/run over the two rows the bridge quotes must equal the slope
      expect(div(sub(b.y, a.y), rat(b.x - a.x))).toEqual(ex.m);
    });
  }

  it('bridges correctly for a negative slope', () => {
    const { ex, joined } = tableSection(rat(-2), rat(8), 'excludes-zero');
    const a = ex.table[0]!;
    const b = ex.table[1]!;
    const rise = sub(b.y, a.y);
    expect(div(rise, rat(b.x - a.x))).toEqual(ex.m);
    expect(joined).toContain(`= ${format(rise)}`);
  });
});
