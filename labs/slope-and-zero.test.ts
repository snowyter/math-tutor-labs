import { describe, it, expect } from 'vitest';
import { sectionsFor } from './slope-and-zero';
import { flatLineNote } from '../src/widgets/WalkToZero';
import { exampleFrom } from '../src/engine/generate';
import { rat, format, sub, div, mul, neg } from '../src/engine/rational';
import type { Rational, TableKind, WidgetSpec } from '../src/engine/types';

const KINDS: TableKind[] = ['includes-zero', 'excludes-zero'];

// A value substituted into a sum is wrapped when it is negative, the way the
// lab prints it: "b = (-4) − 2 × 2", never "b = -4 − 2 × 2".
function paren(v: Rational): string {
  return v.n < 0 ? `(${format(v)})` : format(v);
}

function parenInt(v: number): string {
  return v < 0 ? `(${v})` : String(v);
}

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

  it('distinguishes no zero from every x in tutor notes', () => {
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'zero-of-a-function')!;
      expect((s.watchFor ?? []).join(' ')).toContain(ex.zeroNote!);
    }
  });
});

const HANDOUT_ORDER = [
  'what-is-linear',
  'is-it-linear',
  'slope-recall',
  'types-of-slope',
  'zero-of-a-function',
  'from-graph',
  'from-equation',
  'from-table',
];

describe('section sequence', () => {
  it.each(KINDS)('follows the handout order for a table that %s', (kind: TableKind) => {
    const ex = exampleFrom(rat(2), rat(-8), kind);
    expect(sectionsFor(ex).map((s) => s.id)).toEqual(HANDOUT_ORDER);
  });

  it('has no definitions section any more', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const ids = sectionsFor(ex).map((s) => s.id);
    expect(ids).not.toContain('definitions');
    // the table section carries one id whichever kind of table it shows
    expect(ids.filter((id) => id.startsWith('from-table'))).toEqual(['from-table']);
  });

  it('keeps both flat cases free of unique-zero and divide-by-m claims', () => {
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'includes-zero');
      const copy = sectionsFor(ex)
        .flatMap((s) => [s.body, ...(s.watchFor ?? []), ...s.steps.flatMap((st) => [st.text, st.why ?? ''])])
        .join(' ')
        .toLowerCase();
      expect(copy).not.toContain('same zero');
      expect(copy).not.toContain('divide by m');
      expect(copy).not.toContain('x = -b/m');
      expect(copy).toContain(ex.zeroNote!.toLowerCase());
    }
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

  it('sends nobody looking for a crossing the flat line never makes', () => {
    // m = 0, b ≠ 0 never meets the x-axis; m = 0, b = 0 is the x-axis.
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'includes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-graph')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      expect(joined).not.toContain('crosses the x-axis. That x is the zero');
      expect(joined).toContain(ex.zeroNote!);
    }
  });

  it('keeps the flat case honest in tutor notes', () => {
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'includes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-graph')!;
      const watchFor = (s.watchFor ?? []).join(' ');
      expect(s.body).toContain(ex.zeroNote!);
      expect(s.body).not.toContain('Read the slope and the zero straight off');
      expect(watchFor).toContain(ex.zeroNote!);
      expect(watchFor).not.toContain('where it crosses the x-axis');
    }
  });
});

describe('types-of-slope', () => {
  it('still names the flat versus vertical distinction', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'types-of-slope')!;
    // Positive guard: the "makes no such claim" test above would also pass on
    // a watchFor that had been emptied outright.
    expect(s.watchFor).toContain(
      'Zero slope and undefined slope are different things: flat versus vertical.',
    );
  });

  it('is the only section that explains the undefined slope', () => {
    // from-graph closes by pointing here. Carrying the reason next to the
    // pointer as well made a student read the same sentence twice.
    for (const kind of KINDS) {
      const ex = exampleFrom(rat(2), rat(-8), kind);
      const explaining = sectionsFor(ex)
        .filter((s) => s.steps.some((st) => st.why?.includes('Undefined is not the same as zero')))
        .map((s) => s.id);
      expect(explaining).toEqual(['types-of-slope']);
    }
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

describe('from-equation', () => {
  it('names slope-intercept form', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-equation')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('slope-intercept form');
  });

  it('covers standard form', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-equation')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('standard form');
    expect(joined).toContain('−A/B');
  });

  it('names y, the letter the widget under it prints', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-equation')!;
    // the zeroLine widget below this body renders "y = mx + b"
    expect(s.body).toContain('y = mx + b');
    expect(s.body).not.toContain('f(x)');
  });

  it('never tells the tutor to divide by m when m is 0', () => {
    // div() throws on a zero denominator and the slider reaches m = 0, so the
    // -b/m rule has to give way to the flat line's own case.
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'includes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-equation')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      const whys = s.steps.map((st) => st.why ?? '').join(' ');
      expect(joined).not.toContain('-b/m');
      expect(joined).not.toContain('divide by m');
      expect(whys).not.toContain('divide by m');
      expect((s.watchFor ?? []).join(' ')).not.toContain('divided by m');
      // and it says what is true instead
      expect(joined).toContain('cannot divide by 0');
      expect(joined).toContain(ex.zeroNote!);
    }
  });

  it('distinguishes no zero from every x in tutor notes', () => {
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'includes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-equation')!;
      const watchFor = (s.watchFor ?? []).join(' ');
      expect(watchFor).toContain(ex.zeroNote!);
      expect(watchFor).not.toContain('opposite side of 0 from b');
    }
  });
});

describe('from-table: two routes to the zero', () => {
  it('teaches both the walk and the solve-for-b route', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('walk');
    expect(joined).toContain('b');
    // the bare 'b' above matches any copy containing the letter, so pin the
    // algebra route down to the substitution it actually has to show
    expect(joined).toContain('b = y − ');
  });

  it('works b out of the row it quotes', () => {
    const cases = [
      { m: rat(2), b: rat(-8) },
      { m: rat(-3), b: rat(9) },
      { m: rat(3, 4), b: rat(-2) },
    ];
    for (const c of cases) {
      const ex = exampleFrom(c.m, c.b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      const row = ex.table[0]!;
      // b derived from the row and the slope the copy quotes — printing ex.b
      // instead would pass a test on the letter alone while skipping the sum
      const worked = sub(row.y, mul(c.m, rat(row.x)));
      expect(worked).toEqual(ex.b);
      expect(joined).toContain(`b = ${paren(row.y)} − ${paren(c.m)} × ${parenInt(row.x)}`);
      expect(joined).toContain(`= ${format(worked)}`);
    }
  });

  it('works the zero out in full, the way it works b', () => {
    const cases = [
      { m: rat(2), b: rat(-8), zero: rat(4) },
      { m: rat(-3), b: rat(9), zero: rat(3) },
      { m: rat(3, 4), b: rat(-2), zero: rat(8, 3) },
    ];
    for (const c of cases) {
      const ex = exampleFrom(c.m, c.b, 'excludes-zero');
      expect(ex.zero).toEqual(c.zero);
      const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      // every link of 0 = mx + b → -b = mx → x = zero, computed here rather
      // than hardcoded, so a copy that jumps straight to the answer fails
      const bTerm = c.b.n < 0 ? `− ${format(neg(c.b))}` : `+ ${format(c.b)}`;
      const chain =
        `0 = ${paren(c.m)}x ${bTerm} → ${format(neg(c.b))} = ${paren(c.m)}x` +
        ` → x = ${format(c.zero)}`;
      expect(joined).toContain(chain);
    }
  });

  it('states both routes agree for a non-flat line', () => {
    for (const c of [
      { m: rat(2), b: rat(-8) },
      { m: rat(-3), b: rat(9) },
      { m: rat(3, 4), b: rat(-2) },
    ]) {
      const ex = exampleFrom(c.m, c.b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      const last = s.steps[s.steps.length - 1]!.text.toLowerCase();
      expect(ex.zero).not.toBeNull();
      expect(last).toContain('agree');
      expect(last).toContain('walk');
      expect(last).toContain('algebra');
      expect(joined).toContain(`x = ${format(ex.zero!)}`);
    }
  });

  it('keeps flat copy honest for both flat cases', () => {
    // m = 0 is reachable from the slope slider. Then there is no single zero,
    // and div() must never be reached with m as its denominator.
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
      expect(ex.zero).toBeNull();
      const texts = s.steps.map((st) => st.text);
      const copy = [
        s.body,
        ...(s.watchFor ?? []),
        ...s.steps.flatMap((st) => [st.text, st.why ?? '']),
      ].join(' ');
      const last = texts[texts.length - 1]!.toLowerCase();
      expect(copy).not.toMatch(/divid(e|ing) by m/i);
      expect(last).not.toMatch(/both ways agree/i);
      expect(last).not.toContain('use the walk');
      expect(copy).toContain(ex.zeroNote!);
      expect(copy).not.toContain('→ x =');
      expect(copy).not.toContain('just between the rows');
    }
  });

  it('works the flat equation without claiming a walk or a zero', () => {
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'excludes-zero');
      const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
      const joined = s.steps.map((st) => st.text).join(' ');
      expect(joined).toContain('This line is flat');
      expect(joined).toContain('0 = 0x');
      expect(joined).toContain(ex.zeroNote!);
    }
  });

  it('does not call an all-zero flat table a table with no y = 0', () => {
    const ex = exampleFrom(rat(0), rat(0), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    expect(s.title).not.toContain('no y = 0');
    expect(s.body.toLowerCase()).toContain('every x is a zero');
  });
});

describe('from-table: the includes-zero branch when the line is flat', () => {
  it('stops promising a y = 0 row the table does not have', () => {
    const ex = exampleFrom(rat(0), rat(4), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    expect(ex.zero).toBeNull();
    expect(ex.table.some((r) => r.y.n === 0)).toBe(false);
    expect(s.title).not.toContain('includes y = 0');
    expect(s.body).not.toContain('has a row where y is 0');
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).not.toContain('The x above it is the zero');
    expect(joined).toContain(ex.zeroNote!);
    expect((s.watchFor ?? []).join(' ')).not.toContain('The zero is the x above the 0');
  });

  it('reads every x as the zero when the flat line is the axis', () => {
    // b = 0 with m = 0 puts a 0 in every column, so the title does hold here
    const ex = exampleFrom(rat(0), rat(0), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    expect(ex.table.every((r) => r.y.n === 0)).toBe(true);
    expect(s.title).toContain('includes y = 0');
    expect(s.body.toLowerCase()).toContain('every x is a zero');
    expect(s.body).not.toContain('the zero is sitting right there');
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).not.toContain('The x above it is the zero');
    expect(joined).not.toContain('no zero');
    expect(joined).toContain(ex.zeroNote!);
  });

  it('does not highlight an arbitrary row when a flat table has no zero row', () => {
    const offAxis = exampleFrom(rat(0), rat(4), 'includes-zero');
    const section = sectionsFor(offAxis).find((x) => x.id === 'from-table')!;
    expect(section.widget).toEqual({ kind: 'table', highlightRows: [] });
  });
});

describe('walk-to-zero widget', () => {
  it('names the flat line’s own case, in the words the rest of the app uses', () => {
    // This widget only gets m, the row and the zero — not zeroNote — so it has
    // to tell the two flat cases apart itself, matching the example's note.
    for (const b of [rat(4), rat(0)]) {
      const ex = exampleFrom(rat(0), b, 'excludes-zero');
      const row = ex.table[0]!;
      expect(flatLineNote(row.y)).toBe(ex.zeroNote);
    }
  });
});

describe('practice questions', () => {
  it('has a question in each representation section', () => {
    for (const kind of ['includes-zero', 'excludes-zero'] as TableKind[]) {
      for (const id of ['from-graph', 'from-equation', 'from-table']) {
        const ex = exampleFrom(rat(2), rat(-8), kind);
        const s = sectionsFor(ex).find((x) => x.id === id)!;
        expect(s.steps.some((st) => st.answer)).toBe(true);
      }
    }
  });

  it('asks for both slope and zero in each representation', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    for (const id of ['from-graph', 'from-equation', 'from-table']) {
      const s = sectionsFor(ex).find((x) => x.id === id)!;
      const prompts = s.steps.filter((st) => st.answer).map((st) => st.answer!.prompt);
      expect(prompts.some((p) => p.startsWith('slope'))).toBe(true);
      expect(prompts.some((p) => p.startsWith('zero'))).toBe(true);
    }
  });

  it('does not make the string none the only accepted zero when the line is the x-axis', () => {
    // m = 0, b = 0 is the x-axis: every x is a zero, and the copy says so.
    // The zero question must agree — a choice whose correct answer is 'Every
    // x is a zero' — not a numeric question that only accepts 'none'.
    for (const kind of KINDS) {
      for (const id of ['from-graph', 'from-equation', 'from-table']) {
        const ex = exampleFrom(rat(0), rat(0), kind);
        const s = sectionsFor(ex).find((x) => x.id === id)!;
        const zeroStep = s.steps.find((st) =>
          st.answer?.prompt.toLowerCase().includes('zero'),
        )!;
        expect(zeroStep.answer!.kind).toBe('choice');
        if (zeroStep.answer!.kind === 'choice') {
          expect(zeroStep.answer!.options[zeroStep.answer!.correct]).toBe('Every x is a zero');
        }
      }
    }
  });
});
