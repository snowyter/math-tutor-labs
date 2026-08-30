# Math Tutor Labs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Tutor Labs framework and its first lab — slope and zero of a linear function — as a Vite + React + TypeScript app a tutor drives live.

**Architecture:** Labs are plain TypeScript data files that describe content and name which shared widgets to use. A pure-function engine (`rational`, `parse`, `math`, `generate`) holds all arithmetic and is unit-tested; React components render widgets and never do math. Sections are derived from the current example so that moving a slider keeps every step and answer correct.

**Tech Stack:** Vite, React 19, TypeScript, Vitest. No charting library — the graph is hand-rolled SVG. No animation library, no KaTeX.

**Spec:** `docs/superpowers/specs/2026-08-30-math-tutor-labs-design.md`

## Global Constraints

- Runtime dependencies: `react`, `react-dom` only. No others.
- All arithmetic on `Rational`, never floats. No float tolerance anywhere.
- Light theme; tokens live in `src/styles/tokens.css`. rise = green, run = amber, zero = red, line = blue, consistently.
- Sliders set slope and y-intercept. No drag-and-drop.
- Graph pane fixed on the left in every section; right column stacks the section's widget above the step panel.
- Prerequisite lessons always render as a full-screen focus overlay. No side-by-side variant.
- Student-facing text 18–20px.
- Tests cover pure functions only. No component tests.
- Commit after every task.
- **Typecheck via `npm run build`, never `npx tsc --noEmit`.** Vite's
  `tsconfig.json` is a solution-style file with `"files": []` and references only,
  so `tsc --noEmit` against it checks nothing and passes silently. `npm run build`
  runs `tsc -b && vite build`, which follows the references and really does check.
- **`noUnusedLocals` is on** in `tsconfig.app.json`. An unused import fails the
  build. Only import what a file actually uses.
- Type-only imports need `import type` — `verbatimModuleSyntax` is on.

### Deviation from the spec

The spec defines `Lab.sections: Section[]`. This plan changes it to
`sections(example: LinearExample): Section[]`.

**Why:** step text and answers embed the example's numbers. The sliders change
`m` and `b` at any time, so static sections would go stale the instant a slider
moves — showing "rise = 4" for a line whose rise is now 2. Deriving sections
from the current example keeps them correct always. No user-visible behaviour
changes; the spec's five sections, their order, and their content are unchanged.

---

### Task 1: Scaffold the Vite project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Modify: `.gitignore` (Vite's template ships its own — it will be overwritten)

**Note:** the project directory already contains `.git` and `docs/`, so
scaffolding in place triggers Vite's "remove existing files?" prompt. Scaffold
into a temp subdirectory and copy up instead — non-interactive and non-destructive.

- [ ] **Step 1: Scaffold into a temp directory**

```bash
cd "c:/Users/KRYSTER/orca/projects/Math Aug 31 Tutor Labs"
mkdir -p .scaffold-tmp
npm create vite@latest .scaffold-tmp -- --template react-ts
```

- [ ] **Step 2: Copy up and clean up**

```bash
cp -r .scaffold-tmp/. .
rm -rf .scaffold-tmp
```

- [ ] **Step 3: Restore the `.superpowers/` ignore rule**

Vite's template `.gitignore` overwrote ours. Read `.gitignore` and confirm it
contains all three entries; add any that are missing:

```
node_modules/
dist/
.superpowers/
*.tsbuildinfo
```

`*.tsbuildinfo` is there because `tsc -b` in build mode writes incremental
build info files that should not be committed.

- [ ] **Step 4: Add Vitest**

```bash
npm install
npm install -D vitest
```

- [ ] **Step 5: Configure Vitest**

`tsconfig.json` from the Vite template is a solution-style file with references;
leave it alone. Rewrite `vite.config.ts` to:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 6: Delete the template demo files**

Remove `src/App.css`, `src/index.css`, `src/assets/`, and `public/`. The template's
`src/main.tsx` imports `./index.css`, which will no longer exist, so rewrite
`src/main.tsx` to:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Replace `src/App.tsx` with a stub that renders `<div>Tutor Labs</div>`.

- [ ] **Step 7: Verify the build works**

Run: `npm run build`
Expected: builds without errors.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Core types and rational arithmetic

**Files:**
- Create: `src/engine/types.ts`, `src/engine/rational.ts`, `src/engine/rational.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Rational`, `Point`, `Level`, `TableKind`, `LinearExample`, `Answer`, `Step`, `LinePreset`, `WidgetSpec`, `Section`, `Lab`, `PrereqLesson`; and `rat`, `ZERO`, `isZero`, `add`, `sub`, `mul`, `div`, `neg`, `equals`, `toNumber`, `isInteger`, `format`

Rational values are always reduced with `d > 0`. `div` throws on a zero divisor —
callers check `isZero` first rather than catching.

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/rational.test.ts
import { describe, it, expect } from 'vitest';
import { rat, add, sub, mul, div, neg, equals, isZero, isInteger, format, toNumber } from './rational';

describe('rat', () => {
  it('reduces', () => expect(rat(4, 6)).toEqual({ n: 2, d: 3 }));
  it('normalises sign to the denominator', () => expect(rat(1, -2)).toEqual({ n: -1, d: 2 }));
  it('normalises -0', () => expect(rat(0, -5)).toEqual({ n: 0, d: 1 }));
  it('rejects a zero denominator', () => expect(() => rat(1, 0)).toThrow());
});

describe('arithmetic', () => {
  it('adds', () => expect(add(rat(1, 2), rat(1, 3))).toEqual({ n: 5, d: 6 }));
  it('subtracts through zero', () => expect(sub(rat(1, 3), rat(1, 2))).toEqual({ n: -1, d: 6 }));
  it('multiplies', () => expect(mul(rat(2, 3), rat(3, 4))).toEqual({ n: 1, d: 2 }));
  it('divides', () => expect(div(rat(2, 3), rat(4, 5))).toEqual({ n: 5, d: 6 }));
  it('refuses to divide by zero', () => expect(() => div(rat(1), rat(0))).toThrow());
  it('negates', () => expect(neg(rat(2, 3))).toEqual({ n: -2, d: 3 }));
});

describe('comparison', () => {
  it('treats 4/6 and 2/3 as equal', () => expect(equals(rat(4, 6), rat(2, 3))).toBe(true));
  it('treats 2 and 2/1 as equal', () => expect(equals(rat(2), rat(2, 1))).toBe(true));
  it('distinguishes 1/2 from 2/3', () => expect(equals(rat(1, 2), rat(2, 3))).toBe(false));
});

describe('predicates and formatting', () => {
  it('detects zero', () => expect(isZero(rat(0, 7))).toBe(true));
  it('detects integers', () => expect(isInteger(rat(6, 2))).toBe(true));
  it('rejects non-integers', () => expect(isInteger(rat(3, 2))).toBe(false));
  it('formats whole numbers bare', () => expect(format(rat(4, 2))).toBe('2'));
  it('formats fractions', () => expect(format(rat(-3, 2))).toBe('-3/2'));
  it('converts to number', () => expect(toNumber(rat(3, 2))).toBe(1.5));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./rational`.

- [ ] **Step 3: Write `src/engine/types.ts`**

```ts
export type Rational = { n: number; d: number };
export type Point = { x: number; y: Rational };

export type Level = 'gentle' | 'standard' | 'challenging';
export type TableKind = 'includes-zero' | 'excludes-zero';

export type LinearExample = {
  m: Rational;
  b: Rational;
  zero: Rational | null;
  zeroNote: string | null;
  tableKind: TableKind;
  table: Point[];
  points: [Point, Point];
};

export type Answer =
  | { kind: 'numeric'; prompt: string; correct: Rational | 'none' }
  | { kind: 'choice'; prompt: string; options: string[]; correct: number };

export type Step = { text: string; why?: string; answer?: Answer };

export type LinePreset =
  | { label: string; m: Rational; b: Rational }
  | { label: string; vertical: Rational };

export type WidgetSpec =
  | { kind: 'graph'; showTriangle: boolean; showZero: boolean }
  | { kind: 'graphPreset'; presets: LinePreset[] }
  | { kind: 'table'; highlightRows: number[] }
  | { kind: 'numberLine'; from: number; to: number }
  | { kind: 'expression' };

export type Section = {
  id: string;
  title: string;
  body: string;
  widget?: WidgetSpec;
  steps: Step[];
  watchFor?: string[];
  tutorNote?: string;
};

export type Lab = {
  id: string;
  title: string;
  concept: string;
  gradeBand: string;
  prerequisites: string[];
  generate(seed: number, level: Level, tableKind: TableKind): LinearExample;
  sections(example: LinearExample): Section[];
};

export type PrereqLesson = {
  id: string;
  title: string;
  widget?: WidgetSpec;
  steps: Step[];
};
```

- [ ] **Step 4: Write `src/engine/rational.ts`**

```ts
import type { Rational } from './types';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error('rational: zero denominator');
  if (n === 0) return { n: 0, d: 1 };
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export const ZERO: Rational = { n: 0, d: 1 };

export function isZero(r: Rational): boolean {
  return r.n === 0;
}

export function add(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function sub(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mul(a: Rational, b: Rational): Rational {
  return rat(a.n * b.n, a.d * b.d);
}

export function div(a: Rational, b: Rational): Rational {
  if (b.n === 0) throw new Error('rational: division by zero');
  return rat(a.n * b.d, a.d * b.n);
}

export function neg(a: Rational): Rational {
  return rat(-a.n, a.d);
}

export function equals(a: Rational, b: Rational): boolean {
  return a.n === b.n && a.d === b.d;
}

export function toNumber(r: Rational): number {
  return r.n / r.d;
}

export function isInteger(r: Rational): boolean {
  return r.d === 1;
}

export function format(r: Rational): string {
  if (r.d === 1) return String(r.n);
  return `${r.n}/${r.d}`;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine && git commit -m "feat: add core types and rational arithmetic"
```

---

### Task 3: Answer input parsing

**Files:**
- Create: `src/engine/parse.ts`, `src/engine/parse.test.ts`

**Interfaces:**
- Consumes: `rat`, `Rational` from Task 2
- Produces: `ParsedAnswer`, `parseAnswer(raw: string): ParsedAnswer`, `isCorrect(input: string, correct: Rational | 'none'): boolean`

`ParsedAnswer` is `Rational | 'none' | null` where `null` means unparseable.
Decimals convert exactly (1.5 → 3/2), never through float rounding drift.

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/parse.test.ts
import { describe, it, expect } from 'vitest';
import { parseAnswer, isCorrect } from './parse';
import { rat } from './rational';

describe('parseAnswer', () => {
  it('parses integers', () => expect(parseAnswer('4')).toEqual(rat(4)));
  it('parses negative integers', () => expect(parseAnswer('-3')).toEqual(rat(-3)));
  it('parses fractions', () => expect(parseAnswer('2/3')).toEqual(rat(2, 3)));
  it('parses negative fractions', () => expect(parseAnswer('-2/3')).toEqual(rat(-2, 3)));
  it('reduces as it parses', () => expect(parseAnswer('4/6')).toEqual(rat(2, 3)));
  it('parses decimals exactly', () => expect(parseAnswer('1.5')).toEqual(rat(3, 2)));
  it('parses negative decimals', () => expect(parseAnswer('-1.5')).toEqual(rat(-3, 2)));
  it('trims whitespace', () => expect(parseAnswer('  2/3 ')).toEqual(rat(2, 3)));
  it('accepts the literal none', () => expect(parseAnswer('none')).toBe('none'));
  it('rejects a zero denominator', () => expect(parseAnswer('1/0')).toBeNull());
  it('rejects garbage', () => expect(parseAnswer('abc')).toBeNull());
  it('rejects empty input', () => expect(parseAnswer('')).toBeNull());
  it('rejects a lone slash', () => expect(parseAnswer('2/')).toBeNull());
});

describe('isCorrect', () => {
  it('accepts an equivalent fraction', () => expect(isCorrect('4/6', rat(2, 3))).toBe(true));
  it('accepts the decimal form', () => expect(isCorrect('1.5', rat(3, 2))).toBe(true));
  it('accepts 2 for 2/1', () => expect(isCorrect('2', rat(2))).toBe(true));
  it('rejects a wrong value', () => expect(isCorrect('3/4', rat(2, 3))).toBe(false));
  it('rejects unparseable input', () => expect(isCorrect('abc', rat(1))).toBe(false));
  it('matches the literal none', () => expect(isCorrect('none', 'none')).toBe(true));
  it('rejects a number when none is correct', () => expect(isCorrect('0', 'none')).toBe(false));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./parse`.

- [ ] **Step 3: Write `src/engine/parse.ts`**

```ts
import { rat, equals } from './rational';
import type { Rational } from './types';

export type ParsedAnswer = Rational | 'none' | null;

function fromDecimal(x: number): Rational {
  const s = String(x);
  const dot = s.indexOf('.');
  if (dot === -1) return rat(x);
  const denom = 10 ** (s.length - dot - 1);
  return rat(Math.round(x * denom), denom);
}

export function parseAnswer(raw: string): ParsedAnswer {
  const s = raw.trim().toLowerCase();
  if (s === '') return null;
  if (s === 'none' || s === 'no zero') return 'none';

  const frac = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(s);
  if (frac) {
    const d = Number(frac[2]);
    if (d === 0) return null;
    return rat(Number(frac[1]), d);
  }

  if (/^-?\d+(\.\d+)?$/.test(s)) return fromDecimal(Number(s));
  return null;
}

export function isCorrect(input: string, correct: Rational | 'none'): boolean {
  const parsed = parseAnswer(input);
  if (parsed === null) return false;
  if (parsed === 'none' || correct === 'none') return parsed === correct;
  return equals(parsed, correct);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/parse.ts src/engine/parse.test.ts && git commit -m "feat: parse and check typed answers"
```

---

### Task 4: Linear-function math

**Files:**
- Create: `src/engine/math.ts`, `src/engine/math.test.ts`

**Interfaces:**
- Consumes: `rat`, `add`, `sub`, `div`, `neg`, `isZero`, `isInteger`, `equals`, `Rational`, `Point` from Task 2
- Produces: `slopeFromPoints(p1, p2): Rational | null`, `zeroFromEquation(m, b): Rational | null`, `zeroFromTable(table, m): Rational | null`, `yAt(m, b, x): Rational`

`null` means "no zero exists" — returned when the slope is zero. Nothing in this
file ever produces `NaN`; the zero-slope case is a `null`, not a division.

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/math.test.ts
import { describe, it, expect } from 'vitest';
import { slopeFromPoints, zeroFromEquation, zeroFromTable, yAt } from './math';
import { rat } from './rational';
import type { Point } from './types';

const p = (x: number, yN: number, yD = 1): Point => ({ x, y: rat(yN, yD) });

describe('slopeFromPoints', () => {
  it('finds a positive integer slope', () => expect(slopeFromPoints(p(0, 1), p(2, 5))).toEqual(rat(2)));
  it('finds a negative slope', () => expect(slopeFromPoints(p(0, 5), p(2, 1))).toEqual(rat(-2)));
  it('finds a fractional slope', () => expect(slopeFromPoints(p(0, 0), p(3, 2))).toEqual(rat(2, 3)));
  it('finds a zero slope', () => expect(slopeFromPoints(p(0, 3), p(4, 3))).toEqual(rat(0)));
  it('returns null for a vertical pair', () => expect(slopeFromPoints(p(2, 0), p(2, 5))).toBeNull());
  it('is direction independent', () => expect(slopeFromPoints(p(2, 5), p(0, 1))).toEqual(slopeFromPoints(p(0, 1), p(2, 5))));
});

describe('zeroFromEquation', () => {
  it('solves y = 2x + 6', () => expect(zeroFromEquation(rat(2), rat(6))).toEqual(rat(-3)));
  it('solves a fractional result', () => expect(zeroFromEquation(rat(2), rat(3))).toEqual(rat(-3, 2)));
  it('solves y = -3x + 9', () => expect(zeroFromEquation(rat(-3), rat(9))).toEqual(rat(3)));
  it('solves y = 2x - 7', () => expect(zeroFromEquation(rat(2), rat(-7))).toEqual(rat(7, 2)));
  it('returns null for a horizontal line', () => expect(zeroFromEquation(rat(0), rat(5))).toBeNull());
  it('returns null for the x-axis', () => expect(zeroFromEquation(rat(0), rat(0))).toBeNull());
  it('returns zero for y = 2x', () => expect(zeroFromEquation(rat(2), rat(0))).toEqual(rat(0)));
});

describe('yAt', () => {
  it('evaluates the line at an integer x', () => expect(yAt(rat(2), rat(3), 4)).toEqual(rat(11)));
  it('evaluates at a negative x', () => expect(yAt(rat(2), rat(3), -2)).toEqual(rat(-1)));
  it('evaluates a fractional slope', () => expect(yAt(rat(2, 3), rat(1), 3)).toEqual(rat(3)));
});

describe('zeroFromTable', () => {
  it('reads the zero straight off a row that has one', () => {
    const table = [p(-1, 3), p(0, 2), p(1, 1), p(2, 0)];
    expect(zeroFromTable(table, rat(-1))).toEqual(rat(2));
  });
  it('extrapolates when no row has y = 0', () => {
    const table = [p(0, 3), p(1, 5), p(2, 7), p(3, 9)];
    expect(zeroFromTable(table, rat(2))).toEqual(rat(-3, 2));
  });
  it('agrees regardless of which row it starts from', () => {
    const table = [p(0, 3), p(1, 5), p(2, 7), p(3, 9)];
    expect(zeroFromTable(table, rat(2))).toEqual(rat(-3, 2));
  });
  it('returns null when the slope is zero', () => {
    const table = [p(0, 4), p(1, 4), p(2, 4), p(3, 4)];
    expect(zeroFromTable(table, rat(0))).toBeNull();
  });
  it('returns null for an empty table', () => expect(zeroFromTable([], rat(2))).toBeNull());
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./math`.

- [ ] **Step 3: Write `src/engine/math.ts`**

```ts
import { rat, add, sub, div, neg, mul, isZero } from './rational';
import type { Point, Rational } from './types';

export function yAt(m: Rational, b: Rational, x: number): Rational {
  return add(mul(m, rat(x)), b);
}

export function slopeFromPoints(p1: Point, p2: Point): Rational | null {
  const run = rat(p2.x - p1.x);
  if (isZero(run)) return null;
  return div(sub(p2.y, p1.y), run);
}

export function zeroFromEquation(m: Rational, b: Rational): Rational | null {
  if (isZero(m)) return null;
  return div(neg(b), m);
}

export function zeroFromTable(table: Point[], m: Rational): Rational | null {
  if (table.length === 0) return null;
  if (isZero(m)) return null;

  const exact = table.find((row) => isZero(row.y));
  if (exact) return rat(exact.x);

  const row = table[0]!;
  return sub(rat(row.x), div(row.y, m));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all PASS. In particular `zeroFromEquation(rat(0), rat(5))` returns
`null` rather than throwing — `div` is never reached with a zero divisor.

- [ ] **Step 5: Commit**

```bash
git add src/engine/math.ts src/engine/math.test.ts && git commit -m "feat: add slope and zero math"
```

---

### Task 5: Example generation

**Files:**
- Create: `src/engine/generate.ts`, `src/engine/generate.test.ts`

**Interfaces:**
- Consumes: `rat`, `isZero`, `isInteger`, `toNumber`, `mul`, `add`, `Rational`, `Point`, `Level`, `TableKind`, `LinearExample` from Task 2; `zeroFromEquation`, `yAt` from Task 4
- Produces: `generate(seed, level, tableKind): LinearExample`, `exampleFrom(m, b, tableKind): LinearExample`

Both invariants are guaranteed **by construction**, not by hope: `generate`
enumerates candidate `(m, b)` pairs, filters out any that violate the level's
rules, and only then picks one with the seeded RNG. `generate` never calls
`Math.random`, so tests are deterministic.

Rules enforced by the filter:
- `gentle` → slope is a positive integer and the zero is a whole number
- `includes-zero` → the zero is a whole number (so it can appear as a table row)
- the zero is never `0` (avoids the trivial through-the-origin case)
- `|b| <= 6` and `|zero| <= 9`, so the line stays near the visible grid

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/generate.test.ts
import { describe, it, expect } from 'vitest';
import { generate, exampleFrom } from './generate';
import { rat, isInteger, isZero, toNumber } from './rational';
import { yAt, zeroFromEquation } from './math';
import type { Level, TableKind } from './types';

const LEVELS: Level[] = ['gentle', 'standard', 'challenging'];
const KINDS: TableKind[] = ['includes-zero', 'excludes-zero'];

describe('generate invariants', () => {
  for (const level of LEVELS) {
    for (const kind of KINDS) {
      for (let seed = 1; seed <= 200; seed++) {
        it(`level=${level} kind=${kind} seed=${seed}`, () => {
          const ex = generate(seed, level, kind);

          // the zero matches the equation
          expect(ex.zero).toEqual(zeroFromEquation(ex.m, ex.b));

          // every table row lies on the line
          for (const row of ex.table) {
            expect(row.y).toEqual(yAt(ex.m, ex.b, row.x));
          }

          // both points lie on the line
          for (const pt of ex.points) {
            expect(pt.y).toEqual(yAt(ex.m, ex.b, pt.x));
          }

          // table rows are ordered and distinct
          const xs = ex.table.map((r) => r.x);
          expect(new Set(xs).size).toBe(xs.length);
          expect(ex.table.length).toBe(4);

          // the table kind is honoured
          const hasZeroRow = ex.table.some((r) => isZero(r.y));
          if (kind === 'includes-zero') expect(hasZeroRow).toBe(true);
          else expect(hasZeroRow).toBe(false);

          // gentle never produces a negative slope or a fractional zero
          if (level === 'gentle') {
            expect(toNumber(ex.m)).toBeGreaterThan(0);
            expect(ex.zero).not.toBeNull();
            expect(isInteger(ex.zero!)).toBe(true);
          }

          // includes-zero always has a whole-number zero
          if (kind === 'includes-zero') {
            expect(ex.zero).not.toBeNull();
            expect(isInteger(ex.zero!)).toBe(true);
          }

          // the zero is never trivially zero
          expect(isZero(ex.zero!)).toBe(false);
        });
      }
    }
  }
});

describe('generate determinism', () => {
  it('returns the same example for the same seed', () => {
    expect(generate(42, 'standard', 'excludes-zero')).toEqual(generate(42, 'standard', 'excludes-zero'));
  });
  it('returns different examples for different seeds', () => {
    expect(generate(1, 'standard', 'excludes-zero')).not.toEqual(generate(2, 'standard', 'excludes-zero'));
  });
});

describe('exampleFrom', () => {
  it('derives the zero for y = 2x + 6', () => {
    expect(exampleFrom(rat(2), rat(6), 'excludes-zero').zero).toEqual(rat(-3));
  });
  it('reports no zero for a horizontal line', () => {
    const ex = exampleFrom(rat(0), rat(4), 'excludes-zero');
    expect(ex.zero).toBeNull();
    expect(ex.zeroNote).toMatch(/no zero/i);
  });
  it('reports every x for the x-axis', () => {
    const ex = exampleFrom(rat(0), rat(0), 'excludes-zero');
    expect(ex.zero).toBeNull();
    expect(ex.zeroNote).toMatch(/every x/i);
  });
  it('gives two distinct points', () => {
    const ex = exampleFrom(rat(2, 3), rat(1), 'excludes-zero');
    expect(ex.points[0].x).not.toBe(ex.points[1].x);
  });
  it('keeps point coordinates integral', () => {
    const ex = exampleFrom(rat(2, 3), rat(1), 'excludes-zero');
    for (const pt of ex.points) expect(isInteger(pt.y)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./generate`.

- [ ] **Step 3: Write `src/engine/generate.ts`**

```ts
import { rat, isZero, isInteger, toNumber } from './rational';
import { zeroFromEquation, yAt } from './math';
import type { Level, TableKind, LinearExample, Point, Rational } from './types';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SLOPES: Record<Level, Rational[]> = {
  gentle: [rat(1), rat(2), rat(3)],
  standard: [rat(1), rat(-1), rat(2), rat(-2), rat(3), rat(-3), rat(4), rat(-4), rat(5), rat(-5), rat(1, 2), rat(2, 3), rat(3, 2)],
  challenging: [rat(3, 4), rat(-3, 4), rat(5, 2), rat(-5, 2), rat(7, 3), rat(-7, 3)],
};

function candidatesFor(level: Level, tableKind: TableKind): { m: Rational; b: Rational }[] {
  const out: { m: Rational; b: Rational }[] = [];
  const needIntegerZero = level === 'gentle' || tableKind === 'includes-zero';

  for (const m of SLOPES[level]) {
    for (let bInt = -6; bInt <= 6; bInt++) {
      const b = rat(bInt);
      const zero = zeroFromEquation(m, b);
      if (zero === null) continue;
      if (needIntegerZero && !isInteger(zero)) continue;
      if (isZero(zero)) continue;
      if (Math.abs(toNumber(zero)) > 9) continue;
      out.push({ m, b });
    }
  }
  return out;
}

function buildTable(m: Rational, b: Rational, zero: Rational | null, tableKind: TableKind): Point[] {
  const step = m.d;
  const row = (x: number): Point => ({ x, y: yAt(m, b, x) });

  if (tableKind === 'includes-zero' && zero !== null && isInteger(zero)) {
    const z = zero.n;
    return [z - 2 * step, z - step, z, z + step].map(row);
  }

  if (zero !== null && isInteger(zero)) {
    // straddle the zero without landing on it
    const z = zero.n;
    return [z - 2 * step, z - step, z + step, z + 2 * step].map(row);
  }

  return [-step, 0, step, 2 * step].map(row);
}

function twoPointsOn(m: Rational, b: Rational): [Point, Point] {
  const step = m.d;
  return [
    { x: 0, y: yAt(m, b, 0) },
    { x: step, y: yAt(m, b, step) },
  ];
}

export function exampleFrom(m: Rational, b: Rational, tableKind: TableKind): LinearExample {
  const zero = zeroFromEquation(m, b);
  let zeroNote: string | null = null;
  if (zero === null) {
    zeroNote = isZero(b)
      ? 'Every x is a zero — this line is the x-axis.'
      : 'This line has no zero — it never crosses the x-axis.';
  }
  return {
    m,
    b,
    zero,
    zeroNote,
    tableKind,
    table: buildTable(m, b, zero, tableKind),
    points: twoPointsOn(m, b),
  };
}

export function generate(seed: number, level: Level, tableKind: TableKind): LinearExample {
  const candidates = candidatesFor(level, tableKind);
  if (candidates.length === 0) throw new Error(`generate: no candidates for ${level}/${tableKind}`);
  const pick = candidates[Math.floor(mulberry32(seed)() * candidates.length)]!;
  return exampleFrom(pick.m, pick.b, tableKind);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all PASS, including the 1,200 generated invariant cases.

- [ ] **Step 5: Commit**

```bash
git add src/engine/generate.ts src/engine/generate.test.ts && git commit -m "feat: generate internally consistent examples"
```

---

### Task 6: Design tokens and the Fraction component

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/widgets/Fraction.tsx`, `src/widgets/Fraction.css`
- Modify: `src/main.tsx` (import the stylesheets)

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  --bg: #fbfbfa;
  --panel: #ffffff;
  --ink: #1c1c1f;
  --ink-soft: #5c5c66;
  --ink-faint: #8a8a94;
  --line: #e2e2e6;
  --grid: #ececf0;
  --axis: #9a9aa4;

  --c-line: #2f6fd0;
  --c-rise: #2f9e63;
  --c-run: #d98a1f;
  --c-zero: #d0435c;

  --ok: #2f9e63;
  --bad: #d0435c;
  --warn-bg: #fdf6e8;
  --warn-border: #d98a1f;

  --radius: 8px;
  --gap: 16px;
  --font: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
  font-size: 17px;
  line-height: 1.5;
}

.student-text { font-size: 19px; }
.soft { color: var(--ink-soft); }
.faint { color: var(--ink-faint); }

button {
  font: inherit;
  cursor: pointer;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--ink);
  border-radius: 6px;
  padding: 6px 12px;
}
button:hover { background: #f2f2f4; }
button.primary { background: var(--c-line); border-color: var(--c-line); color: #fff; }
button.primary:hover { filter: brightness(1.06); }

input[type='text'] {
  font: inherit;
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--ink);
}
```

- [ ] **Step 3: Write `src/widgets/Fraction.tsx` and `Fraction.css`**

`Fraction` renders a rational as a stacked numerator/denominator, or bare when
the value is whole. Props: `{ value: Rational; className?: string }`.

```tsx
import './Fraction.css';
import { format, isInteger } from '../engine/rational';
import type { Rational } from '../engine/types';

export function Fraction({ value, className }: { value: Rational; className?: string }) {
  if (isInteger(value)) return <span className={className}>{value.n}</span>;
  return (
    <span className={`frac ${className ?? ''}`}>
      <span className="frac-n">{value.n}</span>
      <span className="frac-d">{value.d}</span>
    </span>
  );
}
```

```css
.frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.frac-n { padding: 0 4px; border-bottom: 1.5px solid currentColor; }
.frac-d { padding: 0 4px; }
```

- [ ] **Step 4: Import the stylesheets in `src/main.tsx`**

```tsx
import './styles/tokens.css';
import './styles/global.css';
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/styles src/widgets src/main.tsx && git commit -m "feat: add design tokens and Fraction component"
```

---

### Task 7a: The Graph widget — plane, grid, and line

**Files:**
- Create: `src/widgets/Graph.tsx`, `src/widgets/Graph.css`

**Interfaces:**
- Consumes: `Rational` from Task 2; `toNumber`, `isZero`, `format` from Task 2; `yAt` from Task 4
- Produces: `Graph` component, built up over Tasks 7a–7c

Props, which stay fixed across all three sub-tasks:

```ts
type GraphProps = {
  m: Rational;
  b: Rational;
  showTriangle: boolean;
  showZero: boolean;
  onChange?: (m: Rational, b: Rational) => void;
  vertical?: Rational;   // x = k; when set, m and b are ignored
};
```

Geometry conventions, used by all three sub-tasks:

- SVG `viewBox="0 0 420 420"`, 10px padding, x and y both spanning −10..10.
- Unit grid drawn as an SVG `<pattern>`, not a loop of lines.
- `sx(x) = 10 + (x + 10) * 20` maps a data x to viewBox units.
- `sy(y) = 410 - (y + 10) * 20` maps a data y to viewBox units (y flips).
- Colours come only from tokens: line `--c-line`, rise `--c-rise`, run `--c-run`, zero `--c-zero`.

- [ ] **Step 1: Write the plane, grid, axes, and line**

```tsx
// src/widgets/Graph.tsx
import './Graph.css';
import { toNumber, isZero, format } from '../engine/rational';
import { yAt } from '../engine/math';
import type { Rational } from '../engine/types';

const LO = -10;
const HI = 10;

export function sx(x: number): number {
  return 10 + (x + 10) * 20;
}
export function sy(y: number): number {
  return 410 - (y + 10) * 20;
}

export function lineSegment(
  m: Rational,
  b: Rational,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const mf = toNumber(m);
  const bf = toNumber(b);
  const pts: { x: number; y: number }[] = [];

  for (const x of [LO, HI]) {
    const y = mf * x + bf;
    if (y >= LO && y <= HI) pts.push({ x, y });
  }
  if (mf !== 0) {
    for (const y of [LO, HI]) {
      const x = (y - bf) / mf;
      if (x >= LO && x <= HI) pts.push({ x, y });
    }
  }

  const uniq = pts.filter((p, i) => pts.findIndex((q) => q.x === p.x && q.y === p.y) === i);
  if (uniq.length < 2) return null;
  return { x1: uniq[0]!.x, y1: uniq[0]!.y, x2: uniq[1]!.x, y2: uniq[1]!.y };
}

export type GraphProps = {
  m: Rational;
  b: Rational;
  showTriangle: boolean;
  showZero: boolean;
  onChange?: (m: Rational, b: Rational) => void;
  vertical?: Rational;
};

export function Graph({ m, b, showTriangle, showZero, onChange, vertical }: GraphProps) {
  return (
    <div className="graph">
      <svg viewBox="0 0 420 420" className="graph-svg" role="img" aria-label="Coordinate plane">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" x="10" y="10">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="400" height="400" fill="url(#grid)" />
        <line x1="10" y1="410" x2="410" y2="410" stroke="var(--axis)" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="10" y2="410" stroke="var(--axis)" strokeWidth="1.5" />
        {vertical ? (
          <line
            x1={sx(toNumber(vertical))}
            y1="10"
            x2={sx(toNumber(vertical))}
            y2="410"
            stroke="var(--c-line)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          (() => {
            const seg = lineSegment(m, b);
            if (!seg) return null;
            return (
              <line
                x1={sx(seg.x1)}
                y1={sy(seg.y1)}
                x2={sx(seg.x2)}
                y2={sy(seg.y2)}
                stroke="var(--c-line)"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })()
        )}
      </svg>
    </div>
  );
}
```

Note the line is drawn from the segment **clipped to the viewBox**, not from
`x = −10` to `x = 10`. Plugging the extremes into `yAt` directly would draw the
line far outside the visible box for steep slopes.

`showTriangle`, `showZero`, and `onChange` are accepted but unused for now —
Tasks 7b and 7c use them. Reference them in a `void` expression if
`noUnusedParameters` complains; do not delete them.

- [ ] **Step 2: Write the base `src/widgets/Graph.css`**

Grid, axis, and line styling. Strokes use `vector-effect: non-scaling-stroke` so
they stay 1–2px regardless of the viewBox scale.

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/Graph.tsx src/widgets/Graph.css && git commit -m "feat: add graph plane, grid, and line"
```

---

### Task 7b: The Graph widget — zero marker, notes, and triangle

**Files:**
- Modify: `src/widgets/Graph.tsx`, `src/widgets/Graph.css`

**Interfaces:**
- Consumes: `sx`, `sy`, `GraphProps` from Task 7a; `zeroFromEquation` from Task 4; `isZero` from Task 2; `Fraction` from Task 6

- [ ] **Step 1: Add the zero marker and the two no-zero cases**

Inside the `<svg>`, after the line:

- Call `zeroFromEquation(m, b)`. When `vertical` is set, skip all of this.
- If a zero exists and `showZero` is true: a circle at `(sx(zero), sy(0))` with
  `r="7"`, `fill="none"`, `stroke="var(--c-zero)"`, `strokeWidth="2.5"`, plus a
  `<text>` label reading `zero = <format(zero)>` positioned just below it.
- If no zero exists, render the note instead of a marker. Use `zeroNote`-style
  text: "no zero — this line never crosses the x-axis" when `b` is not zero, and
  "every x is a zero — this line is the x-axis" when `b` is zero. Render it as
  `<text>` in `--c-zero` near the bottom of the plane, not as HTML, so it stays
  aligned with the drawing.

- [ ] **Step 2: Add the rise/run triangle**

Drawn between `(0, b)` and `(m.d, yAt(m, b, m.d))`, which keeps both legs
integral. Suppressed when `showTriangle` is false, when `m` is zero, or when
`vertical` is set.

- Horizontal leg from `(0, b)` to `(m.d, b)`, stroke `--c-run`, dashed.
- Vertical leg from `(m.d, b)` to `(m.d, yAt(m, b, m.d))`, stroke `--c-rise`, dashed.
- Two `<text>` labels: `run <m.d>` in `--c-run` under the horizontal leg, and
  `rise <rise>` in `--c-rise` beside the vertical leg, where
  `rise = sub(yAt(m, b, m.d), b)` formatted with `format`.

- [ ] **Step 3: Extend `src/widgets/Graph.css`**

Styles for the zero marker, the note text, the triangle legs, and the labels.

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/Graph.tsx src/widgets/Graph.css && git commit -m "feat: add zero marker and rise/run triangle to the graph"
```

---

### Task 7c: The Graph widget — sliders and readout

**Files:**
- Modify: `src/widgets/Graph.tsx`, `src/widgets/Graph.css`

- [ ] **Step 1: Add the sliders**

Rendered beneath the SVG, and only when `onChange` is supplied.

- Slope slider: `type="range"`, `min={-30}`, `max={30}`, `step={1}`, over a
  denominator of 6 — so the value is `rat(sliderValue, 6)`, spanning −5..5 in
  steps of 1/6. That step size is deliberate: it makes ½, ⅔, 3⁄2 and every other
  value in the spec's difficulty tables exactly reachable.
- Intercept slider: `type="range"`, `min={-10}`, `max={10}`, `step={1}`, value
  `rat(sliderValue)`.
- Both call `onChange(newM, newB)` on input, preserving the other value.
- Because `Rational` is always reduced, `rat(4, 6)` displays as `2/3` — so the
  readout below stays readable at every step position.

- [ ] **Step 2: Add the readout row**

Beneath the sliders: `y = <m>x + <b>` with `m` and `b` rendered through
`Fraction`, then `zero = <value>` in `--c-zero`, or the no-zero note when there
isn't one. This is the one place the equation appears as text.

- [ ] **Step 3: Extend `src/widgets/Graph.css`**

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/Graph.tsx src/widgets/Graph.css && git commit -m "feat: add slope and intercept sliders to the graph"
```

---

### Task 8: Table and NumberLine widgets

**Files:**
- Create: `src/widgets/Table.tsx`, `src/widgets/Table.css`, `src/widgets/NumberLine.tsx`, `src/widgets/NumberLine.css`

**Interfaces:**
- Consumes: `Point`, `Rational` from Task 2; `Fraction` from Task 6; `format`, `isZero` from Task 2
- Produces: `Table`, `NumberLine` components

- [ ] **Step 1: Write `src/widgets/Table.tsx`**

Props `{ rows: Point[]; highlightRows?: number[] }`. Renders a two-row table with
an `x` row and a `y` row, `x` as plain integers and `y` via `Fraction`.
Highlighted row indices get a tinted background so the tutor can point at the
two columns being used. Highlight the `y = 0` cell in `--c-zero` whenever it
appears, regardless of `highlightRows`.

- [ ] **Step 2: Write `src/widgets/Table.css`**

- [ ] **Step 3: Write `src/widgets/NumberLine.tsx`**

Props `{ from: number; to: number; marks?: number[] }`. Horizontal number line
with ticks at every integer between `from` and `to`, labels at every integer, and
an optional set of emphasised marks. Used by the `subtracting-negatives`
prerequisite lesson.

- [ ] **Step 4: Write `src/widgets/NumberLine.css`**

- [ ] **Step 5: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/widgets/Table.tsx src/widgets/Table.css src/widgets/NumberLine.tsx src/widgets/NumberLine.css && git commit -m "feat: add Table and NumberLine widgets"
```

---

### Task 9: Answer input and step reveal

**Files:**
- Create: `src/widgets/NumericInput.tsx`, `src/widgets/Choice.tsx`, `src/widgets/StepReveal.tsx`, `src/widgets/StepReveal.css`, `src/widgets/Answer.css`

**Interfaces:**
- Consumes: `Answer`, `Step` from Task 2; `isCorrect` from Task 3; `Fraction` from Task 6; `format` from Task 2
- Produces: `NumericInput`, `Choice`, `StepReveal` components

- [ ] **Step 1: Write `src/widgets/NumericInput.tsx`**

Props `{ prompt: string; correct: Rational | 'none'; onResult?: (ok: boolean) => void }`.
A text input and a Check button. On check, calls `isCorrect` and shows "Correct"
in `--ok` or "Not quite — try again" in `--bad`. Shows the accepted answer after
two wrong attempts. When `correct` is `'none'`, the hint reads: type `none`.

- [ ] **Step 2: Write `src/widgets/Choice.tsx`**

Props `{ prompt: string; options: string[]; correct: number; onResult?: (ok: boolean) => void }`.
Buttons for each option; the chosen one flashes green or red.

- [ ] **Step 3: Write `src/widgets/StepReveal.tsx`**

Props `{ steps: Step[] }`. Renders steps up to a revealed index, with a "Next
step" button. Each revealed step with a `why` gets a "Why?" toggle that expands
the explanation inline. Each step with an `answer` renders `NumericInput` or
`Choice` beneath it. Steps fade in on reveal via a CSS transition.

- [ ] **Step 4: Write `src/widgets/StepReveal.css` and `src/widgets/Answer.css`**

- [ ] **Step 5: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/widgets && git commit -m "feat: add answer input and step reveal widgets"
```

---

### Task 10: App shell

**Files:**
- Create: `src/shell/LabShell.tsx`, `src/shell/LabShell.css`, `src/shell/Toolbar.tsx`, `src/shell/WatchFor.tsx`, `src/shell/LabPicker.tsx`

**Interfaces:**
- Consumes: `Lab`, `LinearExample`, `Level`, `TableKind`, `Section`, `WidgetSpec`, `LinePreset` from Task 2; `Graph` (Task 7c), `Table`, `NumberLine` (Task 8), `StepReveal` (Task 9); `generate`, `exampleFrom` (Task 5); `Fraction` (Task 6)
- Produces: `LabShell` — the whole screen

`LabShell` owns all state:

```
lab, level, tableKind, seed, sectionIndex,
m, b                // slider state; the source of truth for the example
tutorMode, openPrereqId
```

Behaviour:

- The example is `exampleFrom(m, b, tableKind)` — derived from slider state, never
  stored. Moving a slider updates `m`/`b`, which regenerates the example, which
  rebuilds the sections, so every step and answer stays correct.
- "New example" picks a fresh `generate(seed, level, tableKind)` and copies its
  `m`/`b` into slider state.
- The graph pane is on the left and renders in every section. Section 2 passes
  `vertical` for the undefined preset.
- The right column renders the section's `widget` (table, preset buttons, or a
  rendered equation) above `StepReveal`.
- `WatchFor` renders the section's `watchFor` strings directly under the step
  panel, each as a bordered strip in `--warn-bg` / `--warn-border`.
- `Toolbar` holds the lab picker, difficulty dial, the case toggle (only when the
  current section is section 3), New example, Prereqs, and the Tutor toggle.
- `LabPicker` is a `<select>` over the registered labs. With one lab registered it
  still renders, so adding a second lab needs no shell change.

- [ ] **Step 1: Write `src/shell/WatchFor.tsx`**

Props `{ items: string[] }`. Renders nothing when empty.

- [ ] **Step 2: Write `src/shell/LabPicker.tsx`**

Props `{ labs: Lab[]; current: string; onPick: (id: string) => void }`.

- [ ] **Step 3: Write `src/shell/Toolbar.tsx`**

Props `{ labs, currentLab, onPickLab, level, onLevel, tableKind, onTableKind, showTableKind, onNewExample, onOpenPrereqs, tutorMode, onTutorMode }`.

- [ ] **Step 4: Write `src/shell/LabShell.tsx`**

- [ ] **Step 5: Write `src/shell/LabShell.css`**

Two-column grid: graph pane `minmax(0, 1.35fr)`, right column `minmax(0, 1fr)`.
The graph pane is `position: sticky; top: 0` so it never scrolls away.

- [ ] **Step 6: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/shell && git commit -m "feat: add app shell with two-column lab layout"
```

---

### Task 11: Lab sections 1–2

**Files:**
- Create: `labs/slope-and-zero.ts`
- Modify: `src/engine/types.ts` only if a type gap surfaces — prefer not to

**Interfaces:**
- Consumes: `Lab`, `Section`, `Step`, `LinePreset` from Task 2; `rat`, `format`, `isZero`, `equals` from Task 2; `Fraction` usage in JSX is the shell's job, not this file's
- Produces: the `sections` function for sections 1 and 2, exported as `sectionsOneTwo(example)`

Section text lives here as data. Keep each step's wording plain and spoken —
this is read aloud to a student.

- [ ] **Step 1: Write `labs/slope-and-zero.ts` with sections 1 and 2**

```ts
import { rat, format } from '../src/engine/rational';
import type { LinearExample, Section } from '../src/engine/types';

export function sectionsOneTwo(ex: LinearExample): Section[] {
  return [
    {
      id: 'definitions',
      title: 'What slope and zero mean',
      body: 'Slope measures how steep a line is: rise over run. The zero is where the line crosses the x-axis — the place where y is 0.',
      widget: { kind: 'graph', showTriangle: true, showZero: true },
      steps: [
        { text: 'Slope is rise over run — how far up, divided by how far across.', why: 'Rise goes on top. Run goes on the bottom.' },
        { text: 'Move the slope slider and watch the rise and the run both change.' },
        { text: 'The zero is the x-value where the line reaches y = 0.' },
        { text: 'Read the slope off the line shown.', answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m } },
      ],
      watchFor: [
        'Rise goes on top and run on the bottom — students often divide the other way round.',
        'The zero is an x-value, not a point. Say "x equals ' + (ex.zero === null ? '—' : format(ex.zero)) + '", not a coordinate pair.',
      ],
    },
    {
      id: 'types-of-slope',
      title: 'Types of slope',
      body: 'Four kinds of line. Pick one and look at it.',
      widget: {
        kind: 'graphPreset',
        presets: [
          { label: 'Positive', m: rat(2), b: rat(1) },
          { label: 'Negative', m: rat(-2), b: rat(3) },
          { label: 'Zero', m: rat(0), b: rat(3) },
          { label: 'Undefined', vertical: rat(2) },
        ],
      },
      steps: [
        { text: 'Positive slope: the line goes up as you move to the right.' },
        { text: 'Negative slope: the line goes down as you move to the right.' },
        { text: 'Zero slope: a flat, horizontal line. It runs level.' },
        { text: 'Undefined slope: a straight vertical line. The run is 0, and you cannot divide by 0.', why: 'Undefined is not the same as zero. Zero is flat, undefined is vertical.' },
        { text: 'Which type is a slope of -2?', answer: { kind: 'choice', prompt: 'A slope of -2 is', options: ['Positive', 'Negative', 'Zero', 'Undefined'], correct: 1 } },
      ],
      watchFor: [
        'Zero slope and undefined slope are different things: flat versus vertical.',
        'Read the slope left to right. Reading it right to left flips the sign.',
      ],
    },
  ];
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add labs && git commit -m "feat: add slope-and-zero lab sections 1-2"
```

---

### Task 12: Lab sections 3–5

**Files:**
- Modify: `labs/slope-and-zero.ts`
- Create: `labs/slope-and-zero.ts` export `sectionsThreeFive(example)`

- [ ] **Step 1: Add sections 3, 4 and 5**

Section 3 branches on `ex.tableKind`. When the table includes `y = 0`, the zero
is read straight off the row. When it does not, the slope is found first and the
zero is extrapolated — and the step text must say so explicitly, because that
distinction is the point of the exercise.

This lives in the same file as Task 11, so extend the existing import rather than
adding a second one: `import { rat, format, isZero } from '../src/engine/rational';`

```ts
export function sectionsThreeFive(ex: LinearExample): Section[] {
  const rows = ex.table;
  const zeroRowIndex = rows.findIndex((r) => isZero(r.y));

  const tableSection: Section =
    ex.tableKind === 'includes-zero'
      ? {
          id: 'from-table-includes',
          title: 'From a table that includes y = 0',
          body: 'When the table has a row where y is 0, the zero is sitting right there — read it off.',
          widget: { kind: 'table', highlightRows: [zeroRowIndex, zeroRowIndex + 1] },
          steps: [
            { text: 'Look down the y row for a 0.', why: 'A y-value of 0 means that point sits on the x-axis.' },
            { text: `The x above it is the zero: x = ${ex.zero === null ? '—' : format(ex.zero)}.` },
            { text: 'For the slope, take any two columns. Rise is the change in y, run is the change in x.' },
            { text: 'What is the zero?', answer: { kind: 'numeric', prompt: 'zero: x =', correct: ex.zero ?? 'none' } },
            { text: 'What is the slope?', answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m } },
          ],
          watchFor: [
            'Any two columns give the same slope — pick easy ones.',
            'The zero is the x above the 0, not the 0 itself.',
          ],
        }
      : {
          id: 'from-table-excludes',
          title: 'From a table with no y = 0',
          body: 'There is no row where y is 0, so the zero cannot be read off. Find the slope first, then work it out.',
          widget: { kind: 'table', highlightRows: [0, 1] },
          steps: [
            { text: 'There is no 0 in the y row, so the zero is not in the table.' },
            { text: 'The line still crosses the x-axis — just between the rows we have.', why: 'The table only shows a few points. The line goes on past them.' },
            { text: 'First find the slope from any two columns.', answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m } },
            { text: 'Then use it: from any column, x = the column x minus y over m.' },
            { text: 'What is the zero?', answer: { kind: 'numeric', prompt: 'zero: x =', correct: ex.zero ?? 'none' } },
          ],
          watchFor: [
            'No y = 0 in the table does not mean there is no zero — the line still crosses, just between rows.',
            'Order matters here: find the slope first, then the zero.',
          ],
        };

  return [
    tableSection,
    {
      id: 'from-equation',
      title: 'From an equation',
      body: `In y = mx + b, m is the slope and b is the y-intercept.`,
      widget: { kind: 'expression' },
      steps: [
        { text: 'm is the number multiplied by x — that is the slope.' },
        { text: 'b is the number on its own — where the line crosses the y-axis.' },
        { text: 'The zero is where y is 0, so solve 0 = mx + b.', why: 'Set y to 0 because the zero is where the line meets the x-axis.' },
        { text: 'Take b off both sides, then divide by m. So x = -b/m.' },
        { text: 'What is the slope?', answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m } },
        { text: 'What is the zero?', answer: { kind: 'numeric', prompt: 'zero: x =', correct: ex.zero ?? 'none' } },
      ],
      watchFor: [
        'm is the number times x, not the number on its own.',
        'The zero is negative b divided by m — the sign is the usual place it goes wrong.',
      ],
    },
    {
      id: 'from-graph',
      title: 'From a graph',
      body: 'Read the slope and the zero straight off the picture.',
      widget: { kind: 'graph', showTriangle: true, showZero: true },
      steps: [
        { text: 'Find two points on the line that sit exactly on grid corners.' },
        { text: 'Count squares up or down between them — that is the rise.' },
        { text: 'Count squares across — that is the run.' },
        { text: 'Slope is rise over run.', why: 'Rise on top, run on the bottom.' },
        { text: 'Follow the line down to where it crosses the x-axis. That x is the zero.' },
        { text: 'What is the slope?', answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m } },
        { text: 'What is the zero?', answer: { kind: 'numeric', prompt: 'zero: x =', correct: ex.zero ?? 'none' } },
      ],
      watchFor: [
        'Pick points on grid corners. Points elsewhere give fractions that are hard to count.',
        'The zero is where it crosses the x-axis, not the y-axis.',
      ],
    },
  ];
}
```

- [ ] **Step 2: Combine into the lab's `sections` function**

Add to the same file:

```ts
export function sectionsFor(ex: LinearExample): Section[] {
  return [...sectionsOneTwo(ex), ...sectionsThreeFive(ex)];
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add labs && git commit -m "feat: add slope-and-zero lab sections 3-5"
```

---

### Task 13: Prerequisite lessons 1–5

**Files:**
- Create: `prereqs/index.ts`

**Interfaces:**
- Consumes: `PrereqLesson`, `Step` from Task 2; `rat` from Task 2
- Produces: `PREREQS: PrereqLesson[]` with the first five lessons

Each lesson is 3–6 steps. Wording is spoken aloud, so keep sentences short.

- [ ] **Step 1: Write the first five lessons**

```ts
import { rat } from '../src/engine/rational';
import type { PrereqLesson } from '../src/engine/types';

const coordinatePlane: PrereqLesson = {
  id: 'coordinate-plane',
  title: 'The coordinate plane',
  widget: { kind: 'graph', showTriangle: false, showZero: false },
  steps: [
    { text: 'The flat surface is crossed by two number lines.' },
    { text: 'The horizontal one is the x-axis. The vertical one is the y-axis.' },
    { text: 'They cross at the origin, which is the point (0, 0).' },
    { text: 'Right is positive x and left is negative x.', why: 'It is the number line you already know, laid on its side.' },
    { text: 'Up is positive y and down is negative y.' },
    { text: 'Which direction is positive y?', answer: { kind: 'choice', prompt: 'Positive y is', options: ['Up', 'Down', 'Right', 'Left'], correct: 0 } },
  ],
};

const readingAPoint: PrereqLesson = {
  id: 'reading-a-point',
  title: 'Reading a point',
  widget: { kind: 'graph', showTriangle: false, showZero: false },
  steps: [
    { text: 'A point is written (x, y) — x always first, then y.' },
    { text: 'The x number tells you how far across: right if positive, left if negative.' },
    { text: 'The y number tells you how far up: up if positive, down if negative.' },
    { text: 'Where is the point (-2, 3)?', answer: { kind: 'choice', prompt: '(-2, 3) is', options: ['2 left, 3 up', '2 right, 3 up', '3 left, 2 up', '2 left, 3 down'], correct: 0 } },
  ],
};

const riseAndRunCounting: PrereqLesson = {
  id: 'rise-and-run-counting',
  title: 'Rise and run by counting',
  widget: { kind: 'graph', showTriangle: true, showZero: false },
  steps: [
    { text: 'Put your finger on the left-hand point.' },
    { text: 'Count squares straight up or down until you are level with the second point. That is the rise.' },
    { text: 'Then count squares straight across to reach it. That is the run.' },
    { text: 'Slope is rise over run.', why: 'Say it in that order: rise first, run second.' },
    { text: 'Which number goes on top?', answer: { kind: 'choice', prompt: 'On top goes the', options: ['rise', 'run'], correct: 0 } },
  ],
};

const subtractingNegatives: PrereqLesson = {
  id: 'subtracting-negatives',
  title: 'Subtracting negative numbers',
  widget: { kind: 'numberLine', from: -10, to: 10 },
  steps: [
    { text: 'A number line goes up to the right and down to the left.' },
    { text: '-1 - 5 means: start at -1, then take 5 more steps to the left.' },
    { text: 'Five steps left of -1 is -6. So -1 - 5 = -6.', why: 'Subtracting a positive always moves left, even when you start already negative.' },
    { text: 'What is -2 - 4?', answer: { kind: 'numeric', prompt: '-2 - 4 =', correct: rat(-6) } },
  ],
};

const fractionsAsDivision: PrereqLesson = {
  id: 'fractions-as-division',
  title: 'A fraction is a division',
  steps: [
    { text: 'A fraction is a division that has not been worked out yet.' },
    { text: '2 over 3 means 2 divided by 3.' },
    { text: 'It is still one number — it sits between 0 and 1.', why: '2 divided by 3 is less than 1, because 2 is smaller than 3.' },
    { text: 'Write 3 divided by 4 as a fraction.', answer: { kind: 'numeric', prompt: '3 ÷ 4 =', correct: rat(3, 4) } },
  ],
};

export const PREREQS: PrereqLesson[] = [
  coordinatePlane,
  readingAPoint,
  riseAndRunCounting,
  subtractingNegatives,
  fractionsAsDivision,
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add prereqs && git commit -m "feat: add prerequisite lessons 1-5"
```

---

### Task 14: Prerequisite lessons 6–10

**Files:**
- Modify: `prereqs/index.ts`

- [ ] **Step 1: Add the remaining five lessons and export them all**

```ts
const simplifyingFractions: PrereqLesson = {
  id: 'simplifying-fractions',
  title: 'Simplifying fractions',
  steps: [
    { text: '4 over 6 and 2 over 3 are the same number.' },
    { text: 'You get from one to the other by dividing the top and the bottom by the same thing.' },
    { text: 'Divide both by 2: 4 divided by 2 is 2, and 6 divided by 2 is 3.' },
    { text: 'So 4 over 6 is 2 over 3.', why: 'Dividing top and bottom by the same number does not change the value.' },
    { text: 'Simplify 6 over 9.', answer: { kind: 'numeric', prompt: '6/9 =', correct: rat(2, 3) } },
  ],
};

const yEqualsZero: PrereqLesson = {
  id: 'y-equals-zero',
  title: 'What y = 0 means',
  widget: { kind: 'graph', showTriangle: false, showZero: true },
  steps: [
    { text: 'Every point on the x-axis has a y-value of 0.' },
    { text: 'So asking "where is y = 0?" is the same as asking "where does it cross the x-axis?"' },
    { text: 'That crossing point is called the zero.' },
    { text: 'Where on a graph is y = 0?', answer: { kind: 'choice', prompt: 'y = 0 happens', options: ['On the x-axis', 'On the y-axis', 'Only at the origin', 'At the top'], correct: 0 } },
  ],
};

const solvingTwoStep: PrereqLesson = {
  id: 'solving-two-step-equations',
  title: 'Solving a two-step equation',
  steps: [
    { text: 'Take 0 = 3x + 6. We want x on its own.' },
    { text: 'Undo the +6 first: take 6 from both sides. That leaves -6 = 3x.' },
    { text: 'Now undo the times-3: divide both sides by 3. That leaves -2 = x.' },
    { text: 'So x = -2.', why: 'Undo the addition before the multiplication — you peel off the last layer first.' },
    { text: 'Solve 0 = 2x + 8.', answer: { kind: 'numeric', prompt: 'x =', correct: rat(-4) } },
  ],
};

const substitutingToCheck: PrereqLesson = {
  id: 'substituting-to-check',
  title: 'Checking by substituting back',
  steps: [
    { text: 'To check whether x = -2 is the zero of y = 3x + 6, put -2 where x is.' },
    { text: 'y = 3 times -2, plus 6.' },
    { text: 'That is -6 plus 6, which is 0.' },
    { text: 'y came out as 0, so x = -2 really is the zero.', why: 'The zero is the x that makes y come out as 0. So substitute and look for 0.' },
    { text: 'Check x = 4 in y = 2x - 8. What is y?', answer: { kind: 'numeric', prompt: 'y =', correct: rat(0) } },
  ],
};

const divisionByZero: PrereqLesson = {
  id: 'division-by-zero-undefined',
  title: 'Why division by zero is undefined',
  widget: { kind: 'graph', showTriangle: false, showZero: false },
  steps: [
    { text: 'Slope is rise over run.' },
    { text: 'For a straight vertical line, the run is 0 — it does not go across at all.' },
    { text: 'So the slope becomes rise divided by 0.' },
    { text: 'Division by 0 has no answer, so the slope of a vertical line is undefined.' },
    { text: 'Undefined is not the same as zero. Zero slope is flat. Undefined slope is vertical.' },
    { text: 'A vertical line has slope that is', answer: { kind: 'choice', prompt: 'A vertical line has slope', options: ['zero', 'undefined', '1', '-1'], correct: 1 } },
  ],
};

export const PREREQS: PrereqLesson[] = [
  coordinatePlane,
  readingAPoint,
  riseAndRunCounting,
  subtractingNegatives,
  fractionsAsDivision,
  simplifyingFractions,
  yEqualsZero,
  solvingTwoStep,
  substitutingToCheck,
  divisionByZero,
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add prereqs && git commit -m "feat: add prerequisite lessons 6-10"
```

---

### Task 15: Registry, prerequisite overlay, and wiring

**Files:**
- Create: `src/engine/registry.ts`, `src/widgets/PrereqOverlay.tsx`, `src/widgets/PrereqOverlay.css`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Write `src/engine/registry.ts`**

```ts
import type { Lab, Level, TableKind, LinearExample } from './types';
import { generate } from './generate';
import { sectionsFor } from '../../labs/slope-and-zero';
import { PREREQS } from '../../prereqs';
import type { PrereqLesson } from './types';

export const slopeAndZero: Lab = {
  id: 'slope-and-zero',
  title: 'Slope and zero of a linear function',
  concept: 'What slope and zero mean, and how to find them from a table, an equation, or a graph.',
  gradeBand: 'Algebra 1',
  prerequisites: PREREQS.map((p) => p.id),
  generate,
  sections: sectionsFor,
};

export const LABS: Lab[] = [slopeAndZero];

export const PREREQ_LESSONS: PrereqLesson[] = PREREQS;

export function prereqById(id: string): PrereqLesson | undefined {
  return PREREQ_LESSONS.find((p) => p.id === id);
}

export function firstExample(level: Level, tableKind: TableKind): LinearExample {
  return generate(1, level, tableKind);
}
```

- [ ] **Step 2: Write `src/widgets/PrereqOverlay.tsx`**

Props `{ lesson: PrereqLesson; onClose: () => void }`. A fixed full-screen
overlay — `position: fixed; inset: 0`, a translucent backdrop, and a centred
panel. Renders the lesson's `widget` if it has one, then `StepReveal` with its
steps, then a "Back to lab" button. Always full-screen; there is no side-by-side
variant.

- [ ] **Step 3: Write `src/widgets/PrereqOverlay.css`**

- [ ] **Step 4: Wire up `src/App.tsx`**

```tsx
import { LabShell } from './shell/LabShell';

export default function App() {
  return <LabShell />;
}
```

- [ ] **Step 5: Verify it compiles and builds**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src labs prereqs && git commit -m "feat: register the lab and wire up the app"
```

---

### Task 16: Final verification

**Files:** none created

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all PASS, including the 1,200 generated invariant cases.

- [ ] **Step 2: Typecheck and build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Smoke-test the dev server**

Run: `npm run dev` in the background, fetch `http://localhost:5173`, confirm the
HTML is served and the module graph loads, then stop the server. There is no
browser available here, so this confirms the app boots and compiles — it does
**not** verify layout or wording.

- [ ] **Step 4: Review the diff**

Run: `git log --oneline main..HEAD` and skim for anything unintended.

- [ ] **Step 5: Report, do not merge**

Leave the work on the `slope-and-zero` branch. Do not merge to `main`, do not
push, do not open a PR — those need the user's say-so.

---

# Addendum: prerequisite pages (added 2026-08-30)

Tasks 1–16 built prerequisites as a full-screen focus overlay. **That was
reversed.** Prerequisites are now separate pages, each with its own URL and its
own manipulable. Tasks 17–23 replace `PrereqOverlay` and add the interactives.

**Routing:** hand-rolled against `window.location.hash`. No router dependency
(Global Constraints still allow `react` and `react-dom` only).

- `#/lab/<labId>` — the lab
- `#/prereq/<lessonId>` — a prerequisite lesson

**Dragging lives here, not in the lab.** The lab keeps its sliders. The
prerequisites are where the idea is built, so that is where dragging goes.
Dragging snaps to whole grid positions and is pointer-based, so mouse, trackpad
and touch all work.

### Task 17: Hash routing and the prerequisite page shell

**Files:**
- Create: `src/shell/useHashRoute.ts`, `src/pages/PrereqPage.tsx`, `src/pages/PrereqPage.css`
- Modify: `src/App.tsx`
- Delete: `src/widgets/PrereqOverlay.tsx`, `src/widgets/PrereqOverlay.css`

**Interfaces:**
- Consumes: `prereqById`, `LABS` from Task 15; `StepReveal` from Task 9; `Lab` type
- Produces: `useHashRoute()`, `PrereqPage`

- [ ] **Step 1: Write `src/shell/useHashRoute.ts`**

```ts
import { useEffect, useState } from 'react';

export type Route =
  | { view: 'lab'; labId: string }
  | { view: 'prereq'; lessonId: string };

export function parseHash(hash: string, fallbackLabId: string): Route {
  const m = /^#\/prereq\/(.+)$/.exec(hash);
  if (m) return { view: 'prereq', lessonId: decodeURIComponent(m[1]!) };
  const l = /^#\/lab\/(.+)$/.exec(hash);
  if (l) return { view: 'lab', labId: decodeURIComponent(l[1]!) };
  return { view: 'lab', labId: fallbackLabId };
}

export function useHashRoute(fallbackLabId: string): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash, fallbackLabId));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash, fallbackLabId));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [fallbackLabId]);

  return route;
}

export function goToLab(labId: string) {
  window.location.hash = `#/lab/${encodeURIComponent(labId)}`;
}

export function goToPrereq(lessonId: string) {
  window.location.hash = `#/prereq/${encodeURIComponent(lessonId)}`;
}
```

- [ ] **Step 2: Write `src/pages/PrereqPage.tsx`**

Props `{ lesson: PrereqLesson }`. Renders a header with a "Prerequisite" kicker,
the lesson title, and a "Back to lab" button that calls `goToLab(LABS[0]!.id)`.
Below that, a switch on `lesson.widget.kind` that renders the matching
interactive (Tasks 18–21), then `<StepReveal steps={lesson.steps} />`.

The switch needs a case for every prerequisite widget kind. Where a lesson has no
widget, render nothing above the steps.

- [ ] **Step 3: Write `src/pages/PrereqPage.css`**

Full-page layout: max-width column, generous padding, header row with the back
button on the right.

- [ ] **Step 4: Rewrite `src/App.tsx`**

```tsx
import { useHashRoute } from './shell/useHashRoute';
import { LabShell } from './shell/LabShell';
import { PrereqPage } from './pages/PrereqPage';
import { LABS, prereqById } from './engine/registry';

export default function App() {
  const route = useHashRoute(LABS[0]!.id);

  if (route.view === 'prereq') {
    const lesson = prereqById(route.lessonId);
    if (lesson) return <PrereqPage lesson={lesson} />;
  }
  return <LabShell />;
}
```

- [ ] **Step 5: Delete the overlay files**

`git rm` `src/widgets/PrereqOverlay.tsx` and `src/widgets/PrereqOverlay.css`, and
remove their import from `LabShell.tsx`.

- [ ] **Step 6: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A src && git commit -m "feat: route prerequisites to their own pages"
```

---

### Task 18: DragPlane — draggable points on a coordinate plane

**Files:**
- Create: `src/widgets/DragPlane.tsx`, `src/widgets/DragPlane.css`
- Delete: `src/widgets/NumberLine.tsx`, `src/widgets/NumberLine.css` once Task 19 lands

**Interfaces:**
- Consumes: `sx`, `sy` from `Graph.tsx` (Task 7a); `format`, `rat`, `toNumber` from Task 2; `slopeFromPoints` from Task 4; `Point`, `Rational` from Task 2
- Produces: `DragPlane`, and the shared pointer-drag helper used by Tasks 19–21

This one component backs five lessons. Props:

```ts
type DragPlaneProps = {
  mode: 'free' | 'target' | 'riseRun' | 'vertical';
  target?: { x: number; y: number };   // mode 'target': the goal position
};
```

Behaviour:

- Reuse the exact same 420×420 viewBox, grid pattern, and `sx`/`sy` mapping as
  `Graph`, so the plane looks identical in the lab and in a prerequisite.
- One draggable point in `free`, `target` and `vertical` modes; two in `riseRun`.
- Drag via pointer events: `onPointerDown` on the handle calls
  `setPointerCapture`, `onPointerMove` converts client coordinates to grid
  coordinates and **snaps to whole numbers**, `onPointerUp` releases.
  Converting client → viewBox requires `svg.getBoundingClientRect()` and the
  scale factor between client pixels and viewBox units.
- `free`: shows a live `(x, y)` readout.
- `target`: shows the target as a hollow ring, and the readout turns green when
  the student lands on it.
- `riseRun`: draws the dashed rise/run triangle between the two points and shows
  `rise`, `run`, and the resulting slope as a `Fraction`.
- `vertical`: as `riseRun`, but when both points share an x the slope readout
  shows "undefined" in `--c-zero` instead of a number — this is the whole point
  of the lesson.
- Render dashed guide lines from each point to the axes, so the connection
  between a position and its coordinates is visible.

- [ ] **Step 1: Write `src/widgets/DragPlane.tsx`**
- [ ] **Step 2: Write `src/widgets/DragPlane.css`**
- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/DragPlane.tsx src/widgets/DragPlane.css && git commit -m "feat: add draggable coordinate plane for prerequisites"
```

---

### Task 19: DragNumberLine and FractionBars

**Files:**
- Create: `src/widgets/DragNumberLine.tsx`, `src/widgets/DragNumberLine.css`, `src/widgets/FractionBars.tsx`, `src/widgets/FractionBars.css`
- Delete: `src/widgets/NumberLine.tsx`, `src/widgets/NumberLine.css`

**Interfaces:**
- Consumes: `format`, `rat` from Task 2; `Fraction` from Task 6; the drag helper from Task 18

**DragNumberLine** props `{ from: number; to: number; start: number }`:

- A draggable marker that snaps to whole numbers on a number line.
- An arrow drawn from `start` to the marker's current position, so "−1 − 5"
  becomes visible as a movement left of five steps.
- A readout of the current value, and the size of the jump.

**FractionBars** props `{ parts: number; shaded: number }` and
`{ left: Parts; right: Parts }` — export both as `FractionBars` and
`FractionCompare`:

- `FractionBars`: one bar divided into `parts` equal pieces with `shaded` of them
  filled in `--c-line`. A stepper lets the student change both numbers.
- `FractionCompare`: two bars stacked, showing that 4/6 and 2/3 cover the same
  length with different-sized pieces.

- [ ] **Step 1: Write `DragNumberLine.tsx` and its CSS**
- [ ] **Step 2: Write `FractionBars.tsx` (both components) and its CSS**
- [ ] **Step 3: Remove the now-unused `NumberLine`**
- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A src/widgets && git commit -m "feat: add draggable number line and fraction bars"
```

---

### Task 20: BalanceScale and Substitution

**Files:**
- Create: `src/widgets/BalanceScale.tsx`, `src/widgets/BalanceScale.css`, `src/widgets/Substitution.tsx`, `src/widgets/Substitution.css`

**BalanceScale** props `{ coefficient: number; constant: number }`:

- Renders `coefficient` x-blocks and `constant` unit blocks on the left pan, and
  nothing on the right, representing `3x + 6 = 0`.
- Two buttons: "Take <constant> off both sides" and "Split into <coefficient>
  groups". Each applies one inverse operation and updates the displayed state.
- The beam tilts to show which side is heavier, via a CSS transform.
- When fully solved, shows `x = -2`.

**Substitution** props `{ m: number; b: number }`:

- A stepper or slider for x over a small integer range.
- Shows the substitution worked out one line at a time: `y = 3 × (−2) + 6`, then
  `y = −6 + 6`, then `y = 0`.
- The final line is highlighted in `--c-zero` when y comes out as 0, because
  reaching 0 is what makes the answer correct.

- [ ] **Step 1: Write `BalanceScale.tsx` and its CSS**
- [ ] **Step 2: Write `Substitution.tsx` and its CSS**
- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/widgets && git commit -m "feat: add balance scale and substitution interactives"
```

---

### Task 21: Update the prerequisite content to use the interactives

**Files:**
- Modify: `src/engine/types.ts`, `prereqs/index.ts`, `src/pages/PrereqPage.tsx`
- Modify: `src/shell/Toolbar.tsx` (Prereq dropdown navigates instead of opening)

- [ ] **Step 1: Add the prerequisite widget kinds to `WidgetSpec`**

Replace the `numberLine` kind with the seven interactive kinds listed in the spec:
`dragPlane`, `dragRiseRun`, `dragVertical`, `dragNumberLine`, `fractionBars`,
`fractionCompare`, `balanceScale`, `substitution`.

- [ ] **Step 2: Rewrite each lesson's `widget` in `prereqs/index.ts`**

| lesson id | widget |
|---|---|
| `coordinate-plane` | `{ kind: 'dragPlane', mode: 'free' }` |
| `reading-a-point` | `{ kind: 'dragPlane', mode: 'target', target: { x: -2, y: 3 } }` |
| `rise-and-run-counting` | `{ kind: 'dragRiseRun' }` |
| `subtracting-negatives` | `{ kind: 'dragNumberLine', from: -10, to: 10, start: -1 }` |
| `fractions-as-division` | `{ kind: 'fractionBars', parts: 4, shaded: 3 }` |
| `simplifying-fractions` | `{ kind: 'fractionCompare', left: { parts: 6, shaded: 4 }, right: { parts: 3, shaded: 2 } }` |
| `y-equals-zero` | `{ kind: 'dragPlane', mode: 'free' }` |
| `solving-two-step-equations` | `{ kind: 'balanceScale', coefficient: 3, constant: 6 }` |
| `substituting-to-check` | `{ kind: 'substitution', m: 2, b: -8 }` |
| `division-by-zero-undefined` | `{ kind: 'dragVertical' }` |

- [ ] **Step 3: Point the Toolbar's Prereq dropdown at `goToPrereq`**

Instead of setting local state, the dropdown calls `goToPrereq(id)`.

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A src prereqs && git commit -m "feat: give every prerequisite its own manipulable"
```

---

### Task 22: Verify the prerequisite pages

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Smoke-test every prerequisite route**

Start `npm run dev`, then fetch `index.html` and each module to confirm the
module graph loads. The routes themselves are hash-based and cannot be exercised
without a browser — note this honestly rather than claiming the pages render.

- [ ] **Step 4: Report, do not merge**

Leave the work on the `slope-and-zero` branch.

---

## Known limitations at the end of this plan

- Layout and wording are unverified. Only compile, unit tests, and a dev-server
  boot are checked. The user reviews visually.
- The `expression` widget for section 4 is rendered by `LabShell` as a
  large centred `y = mx + b`; there is no separate component.
- Lab content is authored in TypeScript rather than a looser data format, so
  adding a lab means editing a `.ts` file that imports from `src/engine/`.
- Drag interactions are pointer-based and unverified. Only mouse, trackpad and
  touch are considered; stylus and accessibility fallbacks are not addressed.
- Hash routing has no 404 handling. An unknown `#/prereq/<id>` falls through to
  the lab silently.
