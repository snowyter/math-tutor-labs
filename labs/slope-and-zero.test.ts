import { describe, it, expect } from 'vitest';
import { sectionsFor } from './slope-and-zero';
import { exampleFrom } from '../src/engine/generate';
import { rat, format, sub, div } from '../src/engine/rational';
import type { TableKind, WidgetSpec } from '../src/engine/types';

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

function mikaSection(ex: ReturnType<typeof exampleFrom>) {
  const s = sectionsFor(ex).find((x) => x.id === 'what-is-linear')!;
  return { s, rows: (s.widget as Extract<WidgetSpec, { kind: 'table' }>).rows! };
}

describe('what-is-linear: the Mika opener', () => {
  it('opens with Mika losing 30 a day from 150', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const { rows } = mikaSection(ex);
    expect(rows.map((r) => r.y.n)).toEqual([150, 120, 90, 60, 30, 0]);
    expect(rows.map((r) => r.x)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('names the slope as -30, not 30', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const { s } = mikaSection(ex);
    const naming = s.steps.find((st) => st.text.includes('Slope'))!.text;
    expect(naming).toContain('-30');
    expect(naming.toLowerCase()).toContain('down');
    expect((s.watchFor ?? []).join(' ')).toContain('-30');
  });

  it('keeps the Mika numbers the same for every example', () => {
    const one = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const other = exampleFrom(rat(-3), rat(7), 'excludes-zero');
    expect(mikaSection(other).rows).toEqual(mikaSection(one).rows);
  });

  it('asks the handout three questions', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'what-is-linear')!;
    const answers = s.steps.filter((st) => st.answer).map((st) => st.answer!);
    // 30 lost per day, change is constant, zero on day 5
    expect(answers[0]).toEqual({ kind: 'numeric', prompt: 'lost each day =', correct: rat(30) });
    expect(answers[1]!.kind).toBe('choice');
    expect(answers[2]).toEqual({ kind: 'numeric', prompt: 'day =', correct: rat(5) });
  });

  it('names slope and zero', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'what-is-linear')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('Slope');
    expect(joined).toContain('Zero');
  });
});

describe('is-it-linear', () => {
  it('shows one linear and one non-linear table', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'is-it-linear')!;
    const w = s.widget as { kind: string; tables: { changes: string[] }[] };
    expect(w.kind).toBe('tableCompare');
    expect(w.tables).toHaveLength(2);
    // constant change is linear; changing change is not
    expect(new Set(w.tables[0]!.changes).size).toBe(1);
    expect(new Set(w.tables[1]!.changes).size).toBeGreaterThan(1);
  });

  it('prints the change labels the rows actually give', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'is-it-linear')!;
    const w = s.widget as Extract<WidgetSpec, { kind: 'tableCompare' }>;
    for (const table of w.tables) {
      // one label per gap between adjacent columns, derived from the rows
      expect(table.changes).toHaveLength(table.rows.length - 1);
      table.rows.slice(1).forEach((row, i) => {
        const d = sub(row.y, table.rows[i]!.y);
        expect(table.changes[i]).toBe(d.n < 0 ? format(d) : `+${format(d)}`);
      });
    }
  });

  it('asks which one is linear', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'is-it-linear')!;
    const choice = s.steps.map((st) => st.answer).find((a) => a?.kind === 'choice')!;
    expect(choice.kind).toBe('choice');
    if (choice.kind === 'choice') expect(choice.correct).toBe(0);
  });
});

describe('table widget can carry its own rows', () => {
  it('lets a section supply rows instead of using the example table', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    // A section may declare rows so it can show fixed teaching numbers.
    const spec: WidgetSpec = {
      kind: 'table',
      highlightRows: [],
      rows: ex.table.slice(0, 2),
    };
    const rows = spec.kind === 'table' ? spec.rows : undefined;
    expect(rows).toHaveLength(2);
    expect(rows![0]!.x).toBe(ex.table[0]!.x);
  });
});
