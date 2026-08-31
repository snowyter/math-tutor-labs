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
    const defs = sectionsFor(ex).find((s) => s.id === 'slope-recall')!;
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

describe('slope-recall', () => {
  it('states the slope formula', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('(y₂ − y₁)/(x₂ − x₁)');
  });

  it('names both signs of m when it states the rule', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('positive');
    expect(joined).toContain('negative');
  });

  it('reads the sign off the line, not off the run', () => {
    const cases = [
      { m: rat(-3), b: rat(9), goes: 'goes down', sign: 'negative' },
      { m: rat(2), b: rat(-8), goes: 'goes up', sign: 'positive' },
    ];
    for (const c of cases) {
      const ex = exampleFrom(c.m, c.b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
      // the step that quotes this example's slope is the one that must classify it
      const quoting = s.steps.map((st) => st.text).filter((t) => t.includes(format(ex.m)));
      expect(quoting.length).toBeGreaterThan(0);
      const line = quoting.join(' ');
      expect(line).toContain(c.goes);
      expect(line).toContain(c.sign);
    }
  });

  it('asks for the slope before any step prints it', () => {
    // StepReveal keeps revealed steps on screen, so anything quoting m above
    // the question turns the question into a copy-out.
    for (const c of [
      { m: rat(-3), b: rat(9) },
      { m: rat(2), b: rat(-8) },
    ]) {
      const ex = exampleFrom(c.m, c.b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
      const asked = s.steps.findIndex((st) => st.answer?.kind === 'numeric');
      expect(asked).toBeGreaterThan(-1);
      expect(s.steps.slice(0, asked).map((st) => st.text).join(' ')).not.toContain(format(ex.m));
      expect(s.steps.slice(asked + 1).map((st) => st.text).join(' ')).toContain(format(ex.m));
    }
  });

  it('shows the slope triangle and asks for the example slope', () => {
    const ex = exampleFrom(rat(-3), rat(9), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    expect(s.widget).toEqual({ kind: 'graph', showTriangle: true, showZero: false });
    const asked = s.steps.map((st) => st.answer).find((a) => a?.kind === 'numeric');
    expect(asked).toMatchObject({ kind: 'numeric', correct: ex.m });
  });
});

describe('zero-of-a-function', () => {
  it('defines the zero and where to find it', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'zero-of-a-function')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('f(x)=0');
    expect(joined).toContain('crosses the x-axis');
  });

  it('separates the zero from the x-intercept', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'zero-of-a-function')!;
    const choice = s.steps.map((st) => st.answer).find((a) => a?.kind === 'choice')!;
    expect(choice.kind).toBe('choice');
    if (choice.kind === 'choice') {
      expect(choice.options[choice.correct]).toBe('x = 4');
    }
  });

  it('narrates the crossing the graph beside it actually shows', () => {
    // zero is x = 6 here, so any hard-coded 4 would be visible
    const ex = exampleFrom(rat(-1), rat(6), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'zero-of-a-function')!;
    expect(s.widget).toEqual({ kind: 'graph', showTriangle: false, showZero: true });
    const z = format(ex.zero!);
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain(`(${z}, 0)`);
    expect(joined).not.toContain('(4, 0)');
    expect((s.watchFor ?? []).join(' ')).toContain(`x = ${z}`);
    const choice = s.steps.map((st) => st.answer).find((a) => a?.kind === 'choice')!;
    if (choice.kind === 'choice') {
      expect(choice.options[choice.correct]).toBe(`x = ${z}`);
    }
  });

  it('names no crossing when the line is flat', () => {
    // m = 0 is reachable from the slope slider, and then there is no zero
    const ex = exampleFrom(rat(0), rat(4), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'zero-of-a-function')!;
    expect(ex.zero).toBeNull();
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).not.toContain('(0, 0)');
    expect(joined).toContain('no zero');
  });
});

describe('section sequence', () => {
  it('follows the handout order', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    expect(sectionsFor(ex).map((s) => s.id)).toEqual([
      'what-is-linear',
      'is-it-linear',
      'slope-recall',
      'types-of-slope',
      'zero-of-a-function',
      'from-graph',
      'from-equation',
      'from-table',
    ]);
  });

  it('has no definitions section any more', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const ids = sectionsFor(ex).map((s) => s.id);
    expect(ids).not.toContain('definitions');
    // the table section carries one id whichever kind of table it shows
    expect(ids.filter((id) => id.startsWith('from-table'))).toEqual(['from-table']);
  });

  it('keeps the handout order when the table has no y = 0', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'excludes-zero');
    expect(sectionsFor(ex).map((s) => s.id)).toEqual([
      'what-is-linear',
      'is-it-linear',
      'slope-recall',
      'types-of-slope',
      'zero-of-a-function',
      'from-graph',
      'from-equation',
      'from-table',
    ]);
  });
});

describe('reading direction does not flip the sign', () => {
  // Reversing the reading direction negates the rise AND the run, so rise/run
  // is unchanged. A note claiming otherwise would teach a false rule.
  for (const id of ['slope-recall', 'types-of-slope']) {
    it(`${id} makes no such claim`, () => {
      const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
      const s = sectionsFor(ex).find((x) => x.id === id)!;
      const prose = (s.watchFor ?? []).join(' ');
      expect(prose).not.toContain('right to left');
    });
  }

  it('slope-recall still names the real cause of a flipped sign', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    expect((s.watchFor ?? []).join(' ')).toContain('same direction');
  });
});

describe('from-graph', () => {
  it('points at Types of slope for the vertical case', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-graph')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('undefined');
    expect(joined).toContain('Types of slope');
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
