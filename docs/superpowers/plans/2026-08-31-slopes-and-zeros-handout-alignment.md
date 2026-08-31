# Slopes & Zeros — Handout Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the slope-and-zero lab into the eight-section sequence of the tutee's Week 4 handout, add the five topics the app is missing, and teach both methods for finding a zero from a table.

**Architecture:** The lab is data, not components. `labs/slope-and-zero.ts` exports `sectionsFor(example)` which returns `Section[]`; `LabShell` renders each section's `widget` and `steps`. So the restructure is mostly rewriting that one file, plus two widget changes: `table` gains an optional `rows` so static tables (Mika) can be supplied, and a new `tableCompare` widget renders two tables with their change annotations.

**Tech Stack:** Vite + React 19 + TypeScript, Vitest (node environment, `include: ['src/**/*.test.ts', 'prereqs/**/*.test.ts', 'labs/**/*.test.ts']`).

**Spec:** `docs/superpowers/specs/2026-08-31-slopes-and-zeros-handout-alignment.md`

## Global Constraints

- Exact rational arithmetic only — never floats for educational answers. Values are `{ n, d }` via `rat()`, `sub()`, `div()`, `format()` from `src/engine/rational.ts`.
- Test files must be `.test.ts` (not `.tsx`); Vitest runs in `node`, so no DOM. Assert on section data, not rendered output.
- The app has no `@types/node`; any test importing `node:fs` needs a `// @ts-expect-error` comment above the import.
- `main.tsx` imports `responsive.css` **last** — do not reorder, or mobile rules break.
- Vite uses `base: './'`; do not hardcode the repo path.
- Every task ends green: `npm test` and `npm run build` must both pass before commit.
- Existing 1,936 tests must stay green throughout.
- The Mika numbers are fixed (150, 30/day, Day 5). They must NOT change when the tutor rolls a new example.
- Section ids are load-bearing: `labs/slope-and-zero.test.ts` asserts on them.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/engine/types.ts` | `WidgetSpec` — add `rows?` to `table`, add `tableCompare` variant |
| `src/widgets/Table.tsx` | Unchanged (already takes `rows` as a prop) |
| `src/widgets/TableCompare.tsx` | **New** — renders N tables each with a change annotation |
| `src/widgets/TableCompare.css` | **New** — layout for the compare widget |
| `src/shell/LabShell.tsx` | Wire `table.rows` and the new `tableCompare` widget |
| `labs/slope-and-zero.ts` | Restructure into 3 groups returning 8 sections in handout order |
| `labs/slope-and-zero.test.ts` | Extend with tests for every new section |

---

### Task 1: Let the `table` widget take explicit rows

**Files:**
- Modify: `src/engine/types.ts:56`
- Modify: `src/shell/LabShell.tsx:106-108`
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `Point`, `WidgetSpec` from `src/engine/types.ts`
- Produces: `{ kind: 'table'; highlightRows: number[]; rows?: Point[] }` — later tasks use `rows` for the Mika table

- [ ] **Step 1: Write the failing test**

Append to `labs/slope-and-zero.test.ts`:

```ts
describe('table widget can carry its own rows', () => {
  it('lets a section supply rows instead of using the example table', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    // A section may declare rows so it can show fixed teaching numbers.
    const spec = { kind: 'table' as const, highlightRows: [], rows: ex.table.slice(0, 2) };
    expect(spec.rows).toHaveLength(2);
    expect(spec.rows![0]!.x).toBe(ex.table[0]!.x);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — `rows` does not exist on the `table` variant (TS error)

- [ ] **Step 3: Write minimal implementation**

In `src/engine/types.ts`, change line 56:

```ts
  | { kind: 'table'; highlightRows: number[]; rows?: Point[] }
```

In `src/shell/LabShell.tsx`, replace lines 106-108:

```tsx
          {section.widget?.kind === 'table' && (
            <Table
              rows={section.widget.rows ?? example.table}
              highlightRows={section.widget.highlightRows}
            />
          )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add src/engine/types.ts src/shell/LabShell.tsx labs/slope-and-zero.test.ts
git commit -m "feat: let the table widget take explicit rows"
```

---

### Task 2: New `tableCompare` widget

**Files:**
- Create: `src/widgets/TableCompare.tsx`
- Create: `src/widgets/TableCompare.css`
- Modify: `src/engine/types.ts` (WidgetSpec)
- Modify: `src/shell/LabShell.tsx`
- Test: `src/widgets/TableCompare.layout.test.ts`

**Interfaces:**
- Consumes: `Table` from `src/widgets/Table.tsx` (`{ rows: Point[]; highlightRows?: number[] }`)
- Produces: `TableCompare({ tables }: { tables: { rows: Point[]; changes: string[] }[] })`

- [ ] **Step 1: Write the failing test**

Create `src/widgets/TableCompare.layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TableCompare.tsx', import.meta.url), 'utf8');

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/TableCompare.layout.test.ts`
Expected: FAIL — cannot find `./TableCompare.tsx`

- [ ] **Step 3: Write minimal implementation**

Create `src/widgets/TableCompare.tsx`:

```tsx
import './TableCompare.css';
import { Table } from './Table';
import type { Point } from '../engine/types';

export type ComparedTable = { rows: Point[]; changes: string[] };

export function TableCompare({ tables }: { tables: ComparedTable[] }) {
  return (
    <div className="tcompare">
      {tables.map((t, i) => (
        <div className="tcompare-item" key={i}>
          <Table rows={t.rows} />
          <p className="tcompare-changes">{`Change in f(x): ${t.changes.join(', ')}`}</p>
        </div>
      ))}
    </div>
  );
}
```

Create `src/widgets/TableCompare.css`:

```css
.tcompare {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.tcompare-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tcompare-changes {
  margin: 0;
  font-size: 14px;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
```

In `src/engine/types.ts`, add to `WidgetSpec` after the `table` variant:

```ts
  | { kind: 'tableCompare'; tables: { rows: Point[]; changes: string[] }[] }
```

In `src/shell/LabShell.tsx`, add after the `table` block:

```tsx
          {section.widget?.kind === 'tableCompare' && (
            <TableCompare tables={section.widget.tables} />
          )}
```

and add the import next to the other widget imports:

```tsx
import { TableCompare } from '../widgets/TableCompare';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/TableCompare.layout.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add src/widgets/TableCompare.tsx src/widgets/TableCompare.css src/widgets/TableCompare.layout.test.ts src/engine/types.ts src/shell/LabShell.tsx
git commit -m "feat: add tableCompare widget for the linearity test"
```

---

### Task 3: Section `what-is-linear` (Mika opener)

**Files:**
- Modify: `labs/slope-and-zero.ts`
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `rat()` from `../src/engine/rational`; the `rows?` field from Task 1
- Produces: `foundationSections(): Section[]` — first element is `what-is-linear`

- [ ] **Step 1: Write the failing test**

Append to `labs/slope-and-zero.test.ts`:

```ts
describe('what-is-linear: the Mika opener', () => {
  it('opens with Mika losing 30 a day from 150', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'what-is-linear')!;
    const rows = (s.widget as { rows?: { x: number; y: { n: number; d: number } }[] }).rows!;
    expect(rows[0]!.y.n).toBe(150);
    expect(rows[1]!.y.n).toBe(120);
    expect(rows[5]!.y.n).toBe(0);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — no section with id `what-is-linear`

- [ ] **Step 3: Write minimal implementation**

In `labs/slope-and-zero.ts`, add above `sectionsOneTwo`:

```ts
// Fixed teaching numbers from the handout's opener — deliberately NOT
// generated, so they match the worksheet the student has in front of them.
const MIKA_ROWS: Point[] = [
  { x: 0, y: rat(150) },
  { x: 1, y: rat(120) },
  { x: 2, y: rat(90) },
  { x: 3, y: rat(60) },
  { x: 4, y: rat(30) },
  { x: 5, y: rat(0) },
];

export function foundationSections(): Section[] {
  return [
    {
      id: 'what-is-linear',
      title: 'What is a linear function?',
      body: 'Mika has 150 in her wallet. She spends 30 each day for snacks.',
      widget: { kind: 'table', highlightRows: [], rows: MIKA_ROWS },
      steps: [
        { text: 'How much money is lost each day?', answer: { kind: 'numeric', prompt: 'lost each day =', correct: rat(30) } },
        {
          text: 'That 30 is the same every day — it is the slope.',
          why: 'Slope is how much the output changes for each 1 step across.',
        },
        {
          text: 'Is the change the same every day?',
          answer: {
            kind: 'choice',
            prompt: 'The change is',
            options: ['The same every day', 'Different each day'],
            correct: 0,
          },
        },
        { text: 'On what day will Mika have 0 left?', answer: { kind: 'numeric', prompt: 'day =', correct: rat(5) } },
        {
          text: 'That day is the Zero — the x that makes the output 0.',
          why: 'The zero is the x-value, not the point.',
        },
        {
          text: 'A linear function graphs as a straight line, has a constant rate of change, and has degree one or less.',
          why: 'If x changes by the same amount and f(x) also changes by the same amount, it is linear.',
        },
        { text: 'The same function can be written three ways: an equation, a table, and a graph.' },
      ],
      watchFor: [
        'Slope is the amount lost per day, not the total.',
        'The zero answers "when is it 0?", so it is a day number, not a money amount.',
      ],
    },
  ];
}
```

Import `Section` and `Point` are already imported; ensure `rat` is imported (it is).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: add the Mika opener as what-is-linear"
```

---

### Task 4: Section `is-it-linear`

**Files:**
- Modify: `labs/slope-and-zero.ts`
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `tableCompare` widget spec from Task 2
- Produces: second element of `foundationSections()`

- [ ] **Step 1: Write the failing test**

Append:

```ts
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

  it('asks which one is linear', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'is-it-linear')!;
    const choice = s.steps.map((st) => st.answer).find((a) => a?.kind === 'choice')!;
    expect(choice.kind).toBe('choice');
    if (choice.kind === 'choice') expect(choice.correct).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — no `is-it-linear` section

- [ ] **Step 3: Write minimal implementation**

Add to the array returned by `foundationSections()`, after `what-is-linear`:

```ts
    {
      id: 'is-it-linear',
      title: 'Is it linear?',
      body: 'The change in f(x) has to be the same every time.',
      widget: {
        kind: 'tableCompare',
        tables: [
          {
            rows: [
              { x: -1, y: rat(4) },
              { x: 0, y: rat(6) },
              { x: 1, y: rat(8) },
              { x: 2, y: rat(10) },
            ],
            changes: ['+2', '+2', '+2'],
          },
          {
            rows: [
              { x: 0, y: rat(1) },
              { x: 1, y: rat(2) },
              { x: 2, y: rat(4) },
              { x: 3, y: rat(7) },
            ],
            changes: ['+1', '+2', '+3'],
          },
        ],
      },
      steps: [
        {
          text: 'Work out the change in f(x) between each pair of columns.',
          why: 'Constant change means linear. Changing change means it is not.',
        },
        {
          text: 'The first table changes by +2 every time, so it is linear. The second changes by +1, then +2, then +3, so it is not.',
        },
        {
          text: 'Which table is a linear function?',
          answer: {
            kind: 'choice',
            prompt: 'The linear function is',
            options: ['The first table', 'The second table', 'Both of them', 'Neither of them'],
            correct: 0,
          },
        },
        { text: 'On a graph, a linear function is a straight line.' },
        { text: 'In an equation, the degree of x is one or less — no x-squared, no x in a denominator.' },
      ],
      watchFor: [
        'A constant change in f(x) is the test — not whether the numbers look nice.',
        'Check every gap, not just the first one: +1, +2, +3 hides a change that is not constant.',
      ],
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: add is-it-linear with the constant-change test"
```

---

### Task 5: Section `slope-recall`

This replaces the current `definitions` section. The existing test asserts
`definitions` contains "rate of change" — it must be updated to `slope-recall`.

**Files:**
- Modify: `labs/slope-and-zero.ts`
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `example.m` for the graph widget
- Produces: first element of a new `conceptSections(ex)`

- [ ] **Step 1: Update the existing rate-of-change test**

In `labs/slope-and-zero.test.ts`, change the definitions test:

```ts
  it('names slope as a rate of change where it is first defined', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const defs = sectionsFor(ex).find((s) => s.id === 'slope-recall')!;
    expect(defs.body).toContain('rate of change');
  });
```

- [ ] **Step 2: Write the failing test**

Append:

```ts
describe('slope-recall', () => {
  it('states the slope formula', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('(y₂ − y₁)/(x₂ − x₁)');
  });

  it('explains the sign of m from the direction of the run', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'includes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'slope-recall')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('positive');
    expect(joined).toContain('negative');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — no `slope-recall` section

- [ ] **Step 4: Write minimal implementation**

Add a new exported function to `labs/slope-and-zero.ts`:

```ts
export function conceptSections(ex: LinearExample): Section[] {
  return [
    {
      id: 'slope-recall',
      title: 'Slope',
      body:
        'Slope describes how steep a line is. It is the ratio of the vertical change to the horizontal change between two points. It is also called the rate of change.',
      widget: { kind: 'graph', showTriangle: true, showZero: false },
      steps: [
        { text: 'Slope is vertical change over horizontal change. It is written m.', why: 'Vertical on top, horizontal on the bottom.' },
        { text: 'The vertical change is the rise. The horizontal change is the run.' },
        { text: 'Written with two points, that is (y₂ − y₁)/(x₂ − x₁).', why: 'The y-difference is the rise, the x-difference is the run — same thing in symbols.' },
        { text: 'm is positive if the run goes to the right, and negative if it goes to the left.' },
        {
          text: 'What is the slope?',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
      ],
      watchFor: [
        'Rise goes on top and run on the bottom — students often divide the other way round.',
        'Read the run left to right. Reading it right to left flips the sign.',
      ],
    },
  ];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 6: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: add slope-recall with the coordinate formula"
```

---

### Task 6: Section `zero-of-a-function` (zero vs x-intercept)

**Files:**
- Modify: `labs/slope-and-zero.ts`
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `example.zero` for the graph
- Produces: third element of `conceptSections(ex)`

- [ ] **Step 1: Write the failing test**

Append:

```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — no `zero-of-a-function` section

- [ ] **Step 3: Write minimal implementation**

Add to the array in `conceptSections`, after `slope-recall`:

```ts
    {
      id: 'zero-of-a-function',
      title: 'The zero of a function',
      body: 'The zero is the value of x that makes the output equal to zero.',
      widget: { kind: 'graph', showTriangle: false, showZero: true },
      steps: [
        { text: 'The zero of a function is the value of x that makes the output equal to zero.' },
        { text: 'In a table, it is the x-value where f(x)=0.' },
        { text: 'In a graph, it is the x-value where the line crosses the x-axis.' },
        {
          text: 'A line crosses the x-axis at (4, 0). The x-intercept is the point (4, 0), but the zero is the x-value 4.',
          why: 'The zero is the x-value, not the point.',
        },
        {
          text: 'A line crosses the x-axis at (4, 0). What is the zero?',
          answer: {
            kind: 'choice',
            prompt: 'The zero is',
            options: ['x = 4', 'the point (4, 0)', 'y = 4', '0'],
            correct: 0,
          },
        },
      ],
      watchFor: [
        'The zero is an x-value. The x-intercept is the point. The handout tests this distinction.',
        'Say "x = 4", not "(4, 0)".',
      ],
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: add zero-of-a-function and separate it from the x-intercept"
```

---

### Task 7: Resequence to Graph → Equation → Table

**Files:**
- Modify: `labs/slope-and-zero.ts` (the `sectionsThreeFive` return and `sectionsFor`)
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `foundationSections()` (Task 3–4), `conceptSections(ex)` (Task 5–6)
- Produces: `sectionsFor(ex)` returning all 8 sections in handout order

- [ ] **Step 1: Write the failing test**

Append:

```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — order does not match

- [ ] **Step 3: Write minimal implementation**

In `labs/slope-and-zero.ts`:

1. Move the existing `types-of-slope` object out of `sectionsOneTwo` and into the array returned by `conceptSections`, between `slope-recall` and `zero-of-a-function`.
2. Delete `sectionsOneTwo` (its other section, `definitions`, is superseded by `slope-recall`).
3. Rename `sectionsThreeFive` to `representationSections` and reorder its return array to `from-graph`, `from-equation`, `from-table`.
4. In `from-graph`, add a closing step cross-referencing the vertical-line case, which the handout raises but which the app already teaches elsewhere:

```ts
        {
          text: 'One special case: a straight vertical line has no run at all, so its slope is undefined — see Types of slope.',
          why: 'Undefined is not the same as zero. Zero is flat, undefined is vertical.',
        },
```

5. Rewrite `sectionsFor`:

```ts
export function sectionsFor(ex: LinearExample): Section[] {
  return [...foundationSections(), ...conceptSections(ex), ...representationSections(ex)];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "refactor: resequence sections to graph, equation, table"
```

---

### Task 8: Standard form in `from-equation`

**Files:**
- Modify: `labs/slope-and-zero.ts` (`from-equation`)
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `example.m`, `example.b`
- Produces: extra steps in `from-equation`

- [ ] **Step 1: Write the failing test**

Append:

```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — no mention of slope-intercept or standard form

- [ ] **Step 3: Write minimal implementation**

In the `from-equation` section of `representationSections`:

1. Change `body` to: `'In f(x) = mx + b — the slope-intercept form — the slope and the y-intercept are both sitting in the equation.'`
2. Add after the step naming b:

```ts
        {
          text: 'This is called slope-intercept form, because it hands you the slope and the y-intercept directly.',
        },
```

3. Add after the zero steps:

```ts
        {
          text: 'An equation can also be written in standard form: Ax + By = C.',
          why: 'The x and y sit on the same side, so the slope is no longer visible.',
        },
        {
          text: 'In standard form the slope is −A/B.',
          why: 'Rearranging Ax + By = C into slope-intercept form gives y = (−A/B)x + C/B.',
        },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: name slope-intercept form and cover standard form"
```

---

### Task 9: Both methods for the table zero

**Files:**
- Modify: `labs/slope-and-zero.ts` (`from-table` excludes-zero branch)
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `example.table`, `example.m`, `example.zero`, `bridgeText(rows)`
- Produces: extra steps teaching the solve-for-b route alongside `walkToZero`

- [ ] **Step 1: Write the failing test**

Append:

```ts
describe('from-table: two routes to the zero', () => {
  it('teaches both the walk and the solve-for-b route', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    const joined = s.steps.map((st) => st.text).join(' ');
    expect(joined).toContain('walk');
    expect(joined).toContain('b');
  });

  it('states both routes agree', () => {
    const ex = exampleFrom(rat(2), rat(-8), 'excludes-zero');
    const s = sectionsFor(ex).find((x) => x.id === 'from-table')!;
    const last = s.steps[s.steps.length - 1]!;
    expect(last.text).toContain('same');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — only the walk is taught

- [ ] **Step 3: Write minimal implementation**

In the `from-table-excludes` branch, add after the existing walk step:

```ts
            {
              text: 'A second way: use the slope and one row to find b, then solve f(x) = 0.',
              why: 'Write y = mx + b, put in the row, work out b, then set y to 0.',
            },
            {
              text: `Here the slope is ${format(ex.m)}, so b = y − mx for any row.`,
            },
            {
              text: `Then set y to 0 and solve: the zero is ${zeroText(ex)}.`,
              why: 'Both routes reach the same zero — the walk shows it, the algebra works it out.',
            },
            {
              text: 'Both ways give the same zero. Use the walk to see it, the algebra to work it out.',
            },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: teach both routes to the zero from a table"
```

---

### Task 10: Practice questions per representation

**Files:**
- Modify: `labs/slope-and-zero.ts` (all three representation sections)
- Test: `labs/slope-and-zero.test.ts`

**Interfaces:**
- Consumes: `example.m`, `example.zero`
- Produces: one extra question in each of `from-graph`, `from-equation`, `from-table`

- [ ] **Step 1: Write the failing test**

Append:

```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run labs/slope-and-zero.test.ts`
Expected: FAIL — `from-graph` currently has no slope/zero question pair

- [ ] **Step 3: Write minimal implementation**

In `from-graph`, add at the end of `steps`:

```ts
        {
          text: 'What is the slope?',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
        {
          text: 'What is the zero?',
          answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
        },
```

`from-equation` already asks both ("What is the slope?" and "What is the
zero?"). `from-table` already asks both in each branch — "What is the zero?"
plus either "What is the slope?" (includes-zero) or "First find the slope from
any two columns." (excludes-zero). So only `from-graph` needs the pair added
above.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run labs/slope-and-zero.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Commit**

```bash
git add labs/slope-and-zero.ts labs/slope-and-zero.test.ts
git commit -m "feat: add practice questions to each representation"
```

---

### Task 11: Final verification and mobile pass

**Files:**
- Modify: `src/styles/responsive.css` (if the compare widget needs a mobile rule)
- Test: full suite

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: all tests pass (1,936 plus the new ones)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean, exit 0

- [ ] **Step 3: Stack the compare widget on narrow screens**

Two tables side by side will not fit a phone. Add to `src/styles/responsive.css` inside the `@media (max-width: 820px)` block, next to the existing `.table` rules:

```css
  .tcompare {
    flex-direction: column;
    gap: 14px;
  }
```

- [ ] **Step 4: Re-run tests and build**

Run: `npm test && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/styles/responsive.css
git commit -m "fix: stack the table compare widget on narrow screens"
```

- [ ] **Step 6: Push and verify deployment**

```bash
git push origin main
gh run watch <run-id> --exit-status
```

Confirm the deployed bundle hash matches `dist/`.
