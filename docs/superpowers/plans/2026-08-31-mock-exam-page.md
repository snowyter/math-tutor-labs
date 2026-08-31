# Mock Exam Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the mock exam on the website at `#/exam` — a three-state page that grades the 30 auto-scored items from the paper exam, self-checks the essays, and records attempts on the Progress page.

**Architecture:** Exam content is data — a typed `MOCK_EXAM` object in `src/engine/exam.ts` holding the 30 items and 5 essays verbatim from the paper exam, so web and paper can never drift. The page is one component with three states (intro → taking → result). Grading reuses `isCorrect()` from `src/engine/parse.ts`; attempts are stored in a new `examAttempts` localStorage record, kept deliberately separate from the existing lesson progress key.

**Tech Stack:** Vite + React 19 + TypeScript, Vitest (node environment — no DOM tests; grade logic is a pure function and the page is verified by build + source-level checks).

**Spec:** `docs/superpowers/specs/2026-08-31-mock-exam-page-design.md`

## Global Constraints

- Exact rational arithmetic only. Numeric grading must go through `isCorrect(input, correct-as-Rational)` from `src/engine/parse.ts` — never string-compare decimal approximations. The `accept` list is for exact-string alternates only (e.g. `3.5`), never a substitute for rational equality.
- Test files must be `.test.ts` (not `.tsx`); Vitest runs in `node`, so no DOM. Page components are verified by `tsc -b` plus source-level tests where genuinely load-bearing.
- The app has no `@types/node`; tests importing `node:fs` need `// @ts-expect-error` above the import.
- `src/main.tsx` imports `responsive.css` LAST — do not reorder.
- Vite uses `base: './'` — never hardcode the repo path.
- Exam item numbers, stems, options, answers and explanations must match the paper exam (`docs/mock-exam-slopes-and-zeros.md`) **exactly** — same numbers, same wording, same order.
- `npm test` and `npm run build` must pass before every commit; all pre-existing tests stay green.
- The existing lesson-progress key (`math-tutor-labs:progress:v1`) must not change shape — exam attempts go in their own key.
- localStorage access is wrapped in try/catch everywhere (private mode, quota).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/engine/exam.ts` | Types + `MOCK_EXAM` data (30 items, 5 essays) + `gradeExam()` |
| `src/engine/exam.test.ts` | Data integrity + grading tests |
| `src/shell/useExamAttempts.ts` | localStorage hook for attempt history |
| `src/shell/useExamAttempts.test.ts` | Hook logic tests (pure functions) |
| `src/shell/useHashRoute.ts` | Add `exam` route variant |
| `src/shell/useHashRoute.test.ts` | Extend with `#/exam` cases |
| `src/pages/ExamPage.tsx` | Three-state page (intro → taking → result) |
| `src/pages/ExamPage.css` | Mobile-first page styles |
| `src/App.tsx` | Wire the route |
| `src/pages/ProgressPage.tsx` | "Take the mock exam" button + attempt history |

---

### Task 1: Route + exam attempt storage

**Files:**
- Modify: `src/shell/useHashRoute.ts` (Route type + parseHash)
- Test: `src/shell/useHashRoute.test.ts`
- Create: `src/shell/useExamAttempts.ts`
- Test: `src/shell/useExamAttempts.test.ts`

**Interfaces:**
- Consumes: `parseHash`, `useProgress` storage pattern
- Produces: `Route` gains `{ view: 'exam' }`; `goToExam()`; `useExamAttempts()` returning `{ attempts, record, clear }` where `record(score, of, partI, partII)` prepends an `ExamAttempt`

- [ ] **Step 1: Write the failing route test**

Append to `src/shell/useHashRoute.test.ts`:

```ts
describe('parseHash exam route', () => {
  it('parses #/exam to the exam view', () => {
    expect(parseHash('#/exam', 'lab')).toEqual({ view: 'exam' });
  });

  it('does not treat #/examfoo as the exam route', () => {
    expect(parseHash('#/examfoo', 'lab').view).toBe('lab');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shell/useHashRoute.test.ts`
Expected: FAIL — `view: 'exam'` not in the Route union (TS error) and route falls through to lab

- [ ] **Step 3: Implement the route**

In `src/shell/useHashRoute.ts`:

Add to the `Route` union:

```ts
  | { view: 'exam' }
```

In `parseHash`, before the prereq branch:

```ts
  if (hash === '#/exam') return { view: 'exam' };
```

Add alongside the other `goTo*` functions:

```ts
export function goToExam() {
  window.location.hash = '#/exam';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shell/useHashRoute.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Write the failing attempts test**

Create `src/shell/useExamAttempts.test.ts`. The storage logic lives in pure functions so it is testable without a DOM:

```ts
import { describe, it, expect } from 'vitest';
import { pushAttempt, capAttempts } from './useExamAttempts';
import type { ExamAttempt } from './useExamAttempts';

const a = (score: number, at: number): ExamAttempt => ({
  score,
  of: 60,
  partI: score,
  partII: 0,
  updatedAt: at,
});

describe('exam attempt list logic', () => {
  it('prepends the newest attempt', () => {
    const next = pushAttempt([], a(50, 1));
    expect(next).toHaveLength(1);
    expect(next[0]!.score).toBe(50);
  });

  it('caps history at 10, dropping the oldest', () => {
    const full = Array.from({ length: 10 }, (_, i) => a(i, i));
    const next = pushAttempt(full, a(99, 100));
    expect(next).toHaveLength(10);
    expect(next[0]!.score).toBe(99);
    expect(next.some((x) => x.score === 0)).toBe(false);
  });

  it('capAttempts is a no-op under the cap', () => {
    expect(capAttempts([a(1, 1)])).toHaveLength(1);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/shell/useExamAttempts.test.ts`
Expected: FAIL — module not found

- [ ] **Step 7: Implement the hook**

Create `src/shell/useExamAttempts.ts`:

```ts
import { useCallback, useState } from 'react';

export type ExamAttempt = {
  score: number; // out of `of`
  of: number; // auto-scored total, 60
  partI: number; // out of 20
  partII: number; // out of 40
  updatedAt: number; // Date.now()
};

const KEY = 'math-tutor-labs:exam-attempts:v1';
const MAX = 10;

export function capAttempts(list: ExamAttempt[]): ExamAttempt[] {
  return list.slice(0, MAX);
}

export function pushAttempt(list: ExamAttempt[], attempt: ExamAttempt): ExamAttempt[] {
  return capAttempts([attempt, ...list]);
}

function read(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return capAttempts(parsed as ExamAttempt[]);
    return [];
  } catch {
    // localStorage can be unavailable or hold corrupt data; start fresh.
    return [];
  }
}

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(read);

  const record = useCallback((score: number, of: number, partI: number, partII: number) => {
    setAttempts((prev) => {
      const next = pushAttempt(prev, { score, of, partI, partII, updatedAt: Date.now() });
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage full or blocked; keep the in-memory history for this session.
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing to do; the in-memory reset below still applies.
    }
    setAttempts([]);
  }, []);

  return { attempts, record, clear };
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/shell/useExamAttempts.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 9: Commit**

```bash
git add src/shell/useHashRoute.ts src/shell/useHashRoute.test.ts src/shell/useExamAttempts.ts src/shell/useExamAttempts.test.ts
git commit -m "feat: add exam route and attempt storage"
```

---

### Task 2: Exam data and grading

**Files:**
- Create: `src/engine/exam.ts`
- Test: `src/engine/exam.test.ts`

**Interfaces:**
- Consumes: `rat`, `format` from `./rational`; `isCorrect` from `./parse`
- Produces: `MOCK_EXAM: MockExam`, `gradeExam(answers: Map<string, string>) → { score, of, partI, partII, results }` where answers are keyed by `` `${part.id}-${n}` `` and `results[i] = { partId, item, student, ok, explain }`

- [ ] **Step 1: Write the failing test**

Create `src/engine/exam.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MOCK_EXAM, gradeExam } from './exam';
import { isCorrect, parseAnswer } from './parse';

describe('mock exam data integrity', () => {
  it('has 20 + 10 auto-scored items and 5 essays', () => {
    const [i, ii] = MOCK_EXAM.parts;
    expect(i!.items).toHaveLength(20);
    expect(ii!.items).toHaveLength(10);
    expect(MOCK_EXAM.essays).toHaveLength(5);
  });

  it('auto-scored totals match the paper exam (60 points)', () => {
    const [i, ii] = MOCK_EXAM.parts;
    expect(i!.items.length * i!.pointsEach).toBe(20);
    expect(ii!.items.length * ii!.pointsEach).toBe(40);
  });

  it('numbers items uniquely within each part', () => {
    for (const part of MOCK_EXAM.parts) {
      const ns = part.items.map((x) => x.n);
      expect(new Set(ns).size).toBe(ns.length);
    }
  });

  it('keeps choice correct indexes in range', () => {
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'choice') {
          expect(item.correct).toBeGreaterThanOrEqual(0);
          expect(item.correct).toBeLessThan(item.options.length);
        }
      }
    }
  });

  it('numeric keys are well-formed: each key parses and grades as its own answer', () => {
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'numeric') {
          // the key itself must parse; isCorrect(key, parsedKey) proves the
          // key is well-formed and would grade a student who typed it exactly
          const parsed = parseAnswer(item.correct);
          expect(parsed).not.toBeNull();
          expect(isCorrect(item.correct, parsed!)).toBe(true);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/exam.test.ts`
Expected: FAIL — `./exam` not found

- [ ] **Step 3: Implement the exam data and grading**

Create `src/engine/exam.ts`. The 30 items below are transcribed verbatim from `docs/mock-exam-slopes-and-zeros.md`. **Transcribe every stem, option, answer and explanation exactly** — this is the single largest and most error-prone step; the data-integrity tests catch structural mistakes, and the numeric-key test catches malformed keys, but wording fidelity is on you.

```ts
import { rat } from './rational';
import { isCorrect } from './parse';
import type { Rational } from './types';

export type ExamChoice = {
  kind: 'choice';
  n: number;
  stem: string;
  options: string[];
  correct: number;
  explain: string;
  table?: string[][];
};

export type ExamNumeric = {
  kind: 'numeric';
  n: number;
  stem: string;
  correct: string; // the paper key's exact answer, graded via isCorrect
  accept?: string[]; // extra accepted exact strings, e.g. '3.5'
  explain: string;
  table?: string[][];
  hint?: string;
};

export type ExamItem = ExamChoice | ExamNumeric;

export type ExamPart = { id: string; title: string; pointsEach: number; items: ExamItem[] };

export type ExamEssay = { n: number; prompt: string; guide: string };

export type MockExam = {
  title: string;
  minutes: number;
  parts: ExamPart[];
  essays: ExamEssay[];
};

export type ExamResult = {
  item: ExamItem;
  student: string | null; // null = unanswered
  ok: boolean;
  explain: string;
};

export type ExamScore = {
  score: number;
  of: number;
  partI: number;
  partII: number;
  results: ExamResult[];
};

const PART_I_TABLES: Record<number, string[][]> = {
  1: [
    ['A', 'B', 'C', 'D'],
    ['x', '0, 1, 2, 3', '−1, 0, 1, 2', '0, 1, 2, 3', '0, 1, 2, 3'],
    ['f(x)', '1, 2, 4, 7', '4, 6, 8, 10', '0, 1, 4, 9', '1, 1, 2, 2'],
  ],
  15: [
    ['x', '0', '1', '2', '3'],
    ['f(x)', '6', '4', '2', '0'],
  ],
};

const PART_II_TABLES: Record<number, string[][]> = {
  3: [
    ['x', '1', '3', '5', '7'],
    ['f(x)', '11', '5', '−1', '−7'],
  ],
  8: [
    ['x', '0', '1', '2', '3'],
    ['f(x)', '2', '5', '8', '11'],
  ],
};

export const MOCK_EXAM: MockExam = {
  title: 'Mock Examination: Slopes and Zeros of Linear Functions',
  minutes: 90,
  parts: [
    {
      id: 'part-i',
      title: 'Part I. Multiple Choice',
      pointsEach: 1,
      items: [
        // 1-20, verbatim from docs/mock-exam-slopes-and-zeros.md
      ],
    },
    {
      id: 'part-ii',
      title: 'Part II. Problem Solving',
      pointsEach: 4,
      items: [
        // 1-10, verbatim
      ],
    },
  ],
  essays: [
    // 5 essays, verbatim
  ],
};
```

**The 20 Part I items** (fill the `items` array; each is `kind: 'choice'`):

```ts
        {
          kind: 'choice', n: 1,
          stem: 'Which table of values shows a linear function?',
          table: PART_I_TABLES[1],
          options: ['Table A', 'Table B', 'Table C', 'Table D'],
          correct: 1,
          explain: 'Change in f(x) is +2, +2, +2 — constant. The others are +1,+2,+3 / +1,+3,+5 / 0,+1,0.',
        },
        {
          kind: 'choice', n: 2,
          stem: 'A linear function always has a constant _______.',
          options: ['value', 'rate of change', 'x-intercept', 'denominator'],
          correct: 1,
          explain: 'A linear function has a constant rate of change.',
        },
        {
          kind: 'choice', n: 3,
          stem: 'Slope is the ratio of the _______ change to the _______ change between two points.',
          options: ['run, rise', 'x, y', 'vertical, horizontal', 'horizontal, vertical'],
          correct: 2,
          explain: 'Slope = vertical change ÷ horizontal change.',
        },
        {
          kind: 'choice', n: 4,
          stem: 'Slope is denoted by the letter _______.',
          options: ['b', 'm', 'x', 'c'],
          correct: 1,
          explain: 'Slope is denoted by m.',
        },
        {
          kind: 'choice', n: 5,
          stem: 'Using the points (1, −1) and (3, 2), the slope is _______.',
          options: ['2/3', '3/2', '−3/2', '1/2'],
          correct: 1,
          explain: 'rise = 2 − (−1) = 3; run = 3 − 1 = 2; m = 3/2.',
        },
        {
          kind: 'choice', n: 6,
          stem: 'A line that goes up as you read from left to right has a _______ slope.',
          options: ['positive', 'negative', 'zero', 'undefined'],
          correct: 0,
          explain: 'Positive slope rises left to right.',
        },
        {
          kind: 'choice', n: 7,
          stem: 'A straight vertical line has a slope that is _______.',
          options: ['0', '1', 'undefined', 'negative'],
          correct: 2,
          explain: 'Vertical line → run = 0 → slope undefined.',
        },
        {
          (item 8): options ['0', 'undefined', '1', '−1'], correct 0,
          stem: 'A flat horizontal line has a slope of _______.',
          explain: 'Horizontal line → rise = 0 → slope = 0.',
        },
        {
          kind: 'choice', n: 9,
          stem: 'In f(x) = mx + b, the value of b is the _______.',
          options: ['slope', 'y-intercept', 'zero', 'x-intercept'],
          correct: 1,
          explain: 'b is the y-intercept.',
        },
        {
          kind: 'choice', n: 10,
          stem: 'In f(x) = −3x + 5, the slope is _______.',
          options: ['5', '−3', '3', '−5'],
          correct: 1,
          explain: 'm is the number multiplied by x, so m = −3.',
        },
        {
          kind: 'choice', n: 11,
          stem: 'In standard form Ax + By = C, the slope is _______.',
          options: ['A/B', '−A/B', 'C/B', '−B/A'],
          correct: 1,
          explain: 'Rearranging Ax + By = C gives y = (−A/B)x + C/B.',
        },
        {
          kind: 'choice', n: 12,
          stem: 'For 2x + 4y = 8, the slope is _______.',
          options: ['2', '−2', '1/2', '−1/2'],
          correct: 3,
          explain: 'A = 2, B = 4 → m = −2/4 = −1/2.',
        },
        {
          kind: 'choice', n: 13,
          stem: 'The zero of a function is _______.',
          options: [
            'the y-value where the line crosses the y-axis',
            'the x-value that makes the output equal to 0',
            'always equal to 0',
            'the point where x = 0',
          ],
          correct: 1,
          explain: 'The zero is the x that makes the output 0.',
        },
        {
          kind: 'choice', n: 14,
          stem: 'If a line crosses the x-axis at (4, 0), then _______.',
          options: [
            'the zero is 4, and the x-intercept is the point (4, 0)',
            'the zero is the point (4, 0)',
            'the x-intercept is 4',
            'the zero is 0',
          ],
          correct: 0,
          explain: 'Zero = the x-value 4; x-intercept = the point (4, 0).',
        },
        {
          kind: 'choice', n: 15,
          stem: 'Given the table below, the zero is _______.',
          table: PART_I_TABLES[15],
          options: ['0', '3', '6', '−2'],
          correct: 1,
          explain: 'f(x) = 0 when x = 3.',
        },
        {
          kind: 'choice', n: 16,
          stem: 'Using the same table as item 15, the slope is _______.',
          table: PART_I_TABLES[15],
          options: ['2', '−2', '6', '−6'],
          correct: 1,
          explain: '(4 − 6)/(1 − 0) = −2.',
        },
        {
          kind: 'choice', n: 17,
          stem: 'The zero of f(x) = 2x − 8 is _______.',
          options: ['−8', '−4', '4', '8'],
          correct: 2,
          explain: '0 = 2x − 8 → 2x = 8 → x = 4.',
        },
        {
          kind: 'choice', n: 18,
          stem: 'Mika has ₱150 and spends ₱30 each day. After how many days will she have ₱0 left?',
          options: ['Day 3', 'Day 4', 'Day 5', 'Day 6'],
          correct: 2,
          explain: '150 ÷ 30 = 5, so Day 5.',
        },
        {
          kind: 'choice', n: 19,
          stem: "For Mika's situation, the slope of the function is _______.",
          options: ['30', '−30', '150', '−150'],
          correct: 1,
          explain: 'Money decreases by 30 per day → slope = −30.',
        },
        {
          kind: 'choice', n: 20,
          stem: 'Which equation is NOT a linear function?',
          options: ['y = 3x − 1', '2x + y = 7', 'y = x² + 2', 'y = −x'],
          correct: 2,
          explain: 'x² has degree 2, so it is not linear.',
        },
```

**The 10 Part II items** (each is `kind: 'numeric'`; stems verbatim; grading via `isCorrect` against the parsed key):

```ts
        {
          kind: 'numeric', n: 1,
          stem: 'Find the slope of the line passing through (2, 5) and (6, 13).',
          correct: '2',
          explain: 'rise = 13 − 5 = 8; run = 6 − 2 = 4; m = 8/4 = 2.',
        },
        {
          kind: 'numeric', n: 2,
          stem: 'Find the slope of the line passing through (−3, 4) and (1, −2). Express in lowest terms.',
          correct: '-3/2',
          explain: 'rise = −2 − 4 = −6; run = 1 − (−3) = 4; m = −6/4 = −3/2.',
        },
        {
          kind: 'numeric', n: 3,
          stem: 'From the table below, find the slope.',
          table: PART_II_TABLES[3],
          correct: '-3',
          explain: 'Δx = 2 each step, Δf(x) = −6 each step; m = −6/2 = −3.',
        },
        {
          kind: 'numeric', n: 4,
          stem: 'Find the slope of 3x − 6y = 12.',
          correct: '1/2',
          accept: ['0.5'],
          explain: 'A = 3, B = −6 → m = −A/B = −3/(−6) = 1/2. Check: −6y = −3x + 12 → y = ½x − 2.',
        },
        {
          kind: 'numeric', n: 5,
          stem: 'Find the zero of f(x) = 5x + 15.',
          correct: '-3',
          explain: '0 = 5x + 15 → 5x = −15 → x = −3.',
        },
        {
          kind: 'numeric', n: 6,
          stem: 'Find the zero of f(x) = −2x + 7.',
          correct: '7/2',
          accept: ['3.5'],
          explain: '0 = −2x + 7 → 2x = 7 → x = 7/2 (or 3.5).',
        },
        {
          kind: 'numeric', n: 7,
          stem: "Using the table in item 3, the value f(x) = 0 does not appear. Find the zero anyway.",
          table: PART_II_TABLES[3],
          hint: 'Find the slope, use one point to solve for b, write the equation, then set f(x) = 0.',
          correct: '14/3',
          explain: 'From item 3, m = −3. Using (1, 11): 11 = −3(1) + b → b = 14. So f(x) = −3x + 14. Set to 0: 0 = −3x + 14 → 3x = 14 → x = 14/3. Check: −3(14/3) + 14 = 0 ✓.',
        },
        {
          kind: 'numeric', n: 8,
          stem: 'Is the table below linear? Explain using the change in f(x), and give the slope if it is.',
          table: PART_II_TABLES[8],
          correct: '3',
          explain: 'Changes are +3, +3, +3 — constant, so it is linear; slope = 3/1 = 3.',
        },
        {
          kind: 'numeric', n: 9,
          stem: 'A line has rise = 2 and run = −3. What is the slope?',
          correct: '-2/3',
          explain: 'm = rise/run = 2/(−3) = −2/3.',
        },
        {
          kind: 'numeric', n: 10,
          stem: 'A water tank holds 200 litres and drains at 25 litres per hour. After how many hours is the tank empty?',
          correct: '8',
          explain: 'f(x) = −25x + 200; 0 = −25x + 200 → 25x = 200 → x = 8 hours.',
        },
```

**The 5 essays** (verbatim prompts; `guide` is the marking guide from the paper exam):

```ts
  essays: [
    {
      n: 1,
      prompt: 'Explain what the slope of a line means. Then describe how to find it from (a) a graph, (b) a table of values, and (c) an equation.',
      guide: 'Slope measures steepness — the ratio of vertical change to horizontal change, denoted m. From a graph: pick two points on grid corners, count rise and run, divide. From a table: divide the change in f(x) by the change in x (or use (y₂ − y₁)/(x₂ − x₁)). From an equation: in slope-intercept form f(x) = mx + b the slope is m; in standard form Ax + By = C the slope is −A/B.',
    },
    {
      n: 2,
      prompt: 'Explain the difference between the zero of a function and the x-intercept. Use a concrete example such as a line crossing at (4, 0).',
      guide: 'The zero is an x-value; the x-intercept is a point. A line crossing the x-axis at (4, 0) has x-intercept (4, 0) and zero x = 4. The answer is "x = 4", not "(4, 0)".',
    },
    {
      n: 3,
      prompt: 'Explain why a constant rate of change means a function is linear. Show your explanation with one table that is linear and one that is not.',
      guide: 'A function is linear when equal changes in x always produce equal changes in f(x). Constant-change table (+2, +2, +2) is linear; changing-change table (+1, +2, +3) is not.',
    },
    {
      n: 4,
      prompt: 'Explain what standard form (Ax + By = C) is, and show how to find the slope from an equation written in that form. Use an example.',
      guide: 'Standard form is Ax + By = C, with x and y on the same side. Rearranging gives y = (−A/B)x + C/B, so the slope is −A/B. Example: 2x + 4y = 8 → m = −1/2.',
    },
    {
      n: 5,
      prompt: 'A table of values does not contain a row where f(x) = 0. Explain how you would still find the zero. Describe the steps clearly.',
      guide: '(1) Find the slope from two columns. (2) Substitute one point into f(x) = mx + b and solve for b. (3) Write the full equation. (4) Set f(x) = 0 and solve for x. The same zero can also be found by walking from a known row using the slope.',
    },
  ],
```

**Grading function** — append to `src/engine/exam.ts` (imports at the top of the file: `import { parseAnswer, isCorrect } from './parse';` — `rat` and `format` are NOT needed).

**Important — answer keys are namespaced by part.** Part I and Part II both number from 1, so a bare `n` would collide. The answers map is `Map<string, string>` keyed by `` `${part.id}-${n}` `` (e.g. `part-i-5`, `part-ii-7`); `gradeExam` looks the key up the same way, and `ExamResult` carries `partId` for rendering:

```ts
export function gradeExam(answers: Map<string, string>): ExamScore {
  let partI = 0;
  let partII = 0;
  const results: ExamResult[] = [];

  for (const part of MOCK_EXAM.parts) {
    for (const item of part.items) {
      const student = answers.get(`${part.id}-${item.n}`) ?? null;
      const answered = student !== null && student.trim() !== '';
      let ok = false;

      if (answered && item.kind === 'choice') {
        ok = student === item.options[item.correct]!;
      } else if (answered && item.kind === 'numeric') {
        const key = parseAnswer(item.correct);
        if (key !== null && key !== 'none') {
          ok = isCorrect(student, key);
        }
        if (!ok && item.accept) {
          const clean = student.replace(/\s+/g, '');
          ok = item.accept.some((s) => clean === s);
        }
      }

      if (ok) {
        if (part.id === 'part-i') partI += part.pointsEach;
        else partII += part.pointsEach;
      }
      results.push({ partId: part.id, item, student, ok, explain: item.explain });
    }
  }

  return { score: partI + partII, of: 60, partI, partII, results };
}
```

with the `ExamResult` type in the same file defined as:

```ts
export type ExamResult = {
  partId: string;
  item: ExamItem;
  student: string | null; // null = unanswered
  ok: boolean;
  explain: string;
};
```

(The `ExamResult` block in the type listing earlier in this task does NOT have `partId` — use this version instead.)

The `ExamPage` (Task 3) must build the same composite keys: `setAnswer(part.id, item.n, value)` storing under `${partId}-${n}`, and read with the same key.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/exam.test.ts && npm run build`
Expected: PASS, build clean

- [ ] **Step 5: Add grading tests**

Append to `src/engine/exam.test.ts` (note the composite `${part.id}-${n}` keys — Part I and Part II both number from 1, so keys MUST be namespaced by part):

```ts
describe('gradeExam', () => {
  function allCorrect(): Map<string, string> {
    const answers = new Map<string, string>();
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'choice') answers.set(`${part.id}-${item.n}`, item.options[item.correct]!);
        else answers.set(`${part.id}-${item.n}`, item.correct);
      }
    }
    return answers;
  }

  it('gives a perfect paper 60/60', () => {
    const s = gradeExam(allCorrect());
    expect(s.score).toBe(60);
    expect(s.partI).toBe(20);
    expect(s.partII).toBe(40);
  });

  it('grades a blank paper 0/60 without crashing', () => {
    const s = gradeExam(new Map());
    expect(s.score).toBe(0);
    expect(s.results.every((r) => !r.ok)).toBe(true);
  });

  it('treats unanswered as wrong, not a crash', () => {
    const answers = allCorrect();
    answers.delete('part-i-5');
    const s = gradeExam(answers);
    expect(s.score).toBe(59);
  });

  it('does not let Part II answers collide with Part I item numbers', () => {
    // Part I item 1 and Part II item 1 are different questions; answering
    // Part I item 1's correct text must not mark Part II item 1.
    const answers = allCorrect();
    const partIItem1 = MOCK_EXAM.parts[0]!.items[0]!;
    const partIIItem1 = MOCK_EXAM.parts[1]!.items[0]!;
    answers.delete(`part-ii-1`);
    answers.set(`part-i-1`, partIItem1.kind === 'choice' ? partIItem1.options[partIItem1.correct]! : '');
    const s = gradeExam(answers);
    const ii1 = s.results.find((r) => r.partId === 'part-ii' && r.item.n === 1)!;
    expect(ii1.ok).toBe(false);
  });

  it('accepts the documented alternate forms', () => {
    const answers = allCorrect();
    // item II-4 accepts 0.5 for 1/2; item II-6 accepts 3.5 for 7/2
    answers.set('part-ii-4', '0.5');
    answers.set('part-ii-6', '3.5');
    const s = gradeExam(answers);
    expect(s.partII).toBe(40);
  });

  it('parses decimal and fraction forms of the same value as equal', () => {
    const answers = allCorrect();
    answers.set('part-ii-2', '-1.5');
    const s = gradeExam(answers);
    expect(s.partII).toBe(40);
  });
});
```

This requires `gradeExam`'s `ExamScore.results` to carry `partId` (added above) and the `ExamScore`/`ExamResult` types in `exam.ts` to be:

```ts
export type ExamResult = {
  partId: string;
  item: ExamItem;
  student: string | null; // null = unanswered
  ok: boolean;
  explain: string;
};
```

- [ ] **Step 6: Run the full suite**

Run: `npm test && npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/engine/exam.ts src/engine/exam.test.ts
git commit -m "feat: add mock exam data and grading"
```

---

### Task 3: ExamPage component

**Files:**
- Create: `src/pages/ExamPage.tsx`
- Create: `src/pages/ExamPage.css`
- Modify: `src/App.tsx` (wire the route)

**Interfaces:**
- Consumes: `MOCK_EXAM`, `gradeExam` from Task 2; `useExamAttempts` from Task 1
- Produces: `ExamPage` component rendered at `#/exam`

- [ ] **Step 1: Implement ExamPage**

Create `src/pages/ExamPage.tsx`:

```tsx
import { useState } from 'react';
import './ExamPage.css';
import { MOCK_EXAM, gradeExam } from '../engine/exam';
import type { ExamScore } from '../engine/exam';
import { useExamAttempts } from '../shell/useExamAttempts';

type Stage = 'intro' | 'taking' | 'result';

export function ExamPage() {
  const { record } = useExamAttempts();
  const [stage, setStage] = useState<Stage>('intro');
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [score, setScore] = useState<ExamScore | null>(null);

  // Answer keys are namespaced by part: Part I and Part II both number from 1.
  const setAnswer = (partId: string, n: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(`${partId}-${n}`, value));
  };

  const submit = () => {
    const s = gradeExam(answers);
    setScore(s);
    record(s.score, s.of, s.partI, s.partII);
    setStage('result');
    window.scrollTo(0, 0);
  };

  const restart = () => {
    setAnswers(new Map());
    setScore(null);
    setStage('intro');
    window.scrollTo(0, 0);
  };

  if (stage === 'intro') {
    return (
      <div className="exam-page">
        <header className="exam-head">
          <p className="exam-kicker">Practice</p>
          <h1 className="exam-title">Mock Examination</h1>
          <p className="soft">
            {MOCK_EXAM.title} — {MOCK_EXAM.minutes} minutes.
          </p>
        </header>

        <table className="exam-table">
          <thead>
            <tr><th>Part</th><th>Type</th><th>Items</th><th>Points</th></tr>
          </thead>
          <tbody>
            {MOCK_EXAM.parts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.id === 'part-i' ? 'Multiple choice' : 'Problem solving'}</td>
                <td>{p.items.length}</td>
                <td>{p.items.length * p.pointsEach}</td>
              </tr>
            ))}
            <tr>
              <td>Part III</td><td>Essay (self-check)</td><td>{MOCK_EXAM.essays.length}</td>
              <td>not auto-scored</td>
            </tr>
        </tbody>
        </table>

        <button className="primary" onClick={() => setStage('taking')}>
          Start
        </button>
      </div>
    );
  }

  if (stage === 'taking') {
    return (
      <div className="exam-page">
        <p className="exam-progress soft">Answer everything, then submit once.</p>

        {MOCK_EXAM.parts.map((part) => (
          <section key={part.id} className="exam-part">
            <h2 className="exam-part-title">{part.title}</h2>
            {part.items.map((item) => {
              const key = `${part.id}-${item.n}`;
              return (
                <div className="exam-item" key={key}>
                  <p className="exam-n">
                    <strong>{item.n}.</strong> {item.stem}
                  </p>
                  {item.table && <ExamTable table={item.table} />}
                  {item.kind === 'choice' ? (
                    <div className="exam-choices">
                      {item.options.map((opt, i) => (
                        <button
                          key={i}
                          className={answers.get(key) === opt ? 'is-picked' : undefined}
                          onClick={() => setAnswer(part.id, item.n, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="exam-numeric">
                      {item.hint && <p className="exam-hint soft">{item.hint}</p>}
                      <input
                        type="text"
                        inputMode="text"
                        value={answers.get(key) ?? ''}
                        placeholder="Your answer, e.g. 3/2 or -3"
                        onChange={(e) => setAnswer(part.id, item.n, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}

        <button className="primary" onClick={submit}>Submit</button>
      </div>
    );
  }

  // result
  return (
    <div className="exam-page">
      <header className="exam-head">
        <p className="exam-kicker">Your score</p>
        <h1 className="exam-title">{`${score!.score}/${score!.of}`}</h1>
        <p className="soft">
          {`Part I: ${score!.partI}/20. Part II: ${score!.partII}/40.`}
        </p>
      </header>

      <h2 className="exam-part-title">Solutions</h2>
      {score!.results.map((r) => (
        <div className={`exam-item ${r.ok ? 'is-ok' : 'is-bad'}`} key={`${r.partId}-${r.item.n}`}>
          <p className="exam-n">
            <strong>{r.item.n}.</strong> {r.item.stem}
          </p>
          <p className="exam-verdict">
            {r.ok ? 'Correct' : r.student === null ? 'Unanswered' : 'Not quite'}
            {!r.ok && ` — the answer is ${correctText(r.item)}`}
          </p>
          <p className="exam-explain soft">{r.explain}</p>
        </div>
      ))}
```

Add the `correctText` helper and the `ExamItem` import at module scope (needed by the result block above):

```tsx
import type { ExamItem } from '../engine/exam';

function correctText(item: ExamItem): string {
  return item.kind === 'choice' ? item.options[item.correct]! : item.correct;
}
```

- [ ] **Step 2: Essays + actions section** — the result stage continues:

```tsx
      <h2 className="exam-part-title">Part III. Essays — check yourself</h2>
      {MOCK_EXAM.essays.map((e) => (
        <div className="exam-item" key={e.n}>
          <p className="exam-n"><strong>{e.n}.</strong> {e.prompt}</p>
          <details className="exam-guide">
            <summary>Show the marking guide</summary>
            <p className="exam-explain soft">{e.guide}</p>
          </details>
        </div>
      ))}

      <button className="primary" onClick={restart}>Take it again</button>
    </div>
  );
}

function ExamTable({ table }: { table: string[][] }) {
  return (
    <table className="exam-mini">
      <tbody>
        {table.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: CSS**

Create `src/pages/ExamPage.css`:

```css
.exam-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 20px 64px;
  max-width: 640px;
  margin: 0 auto;
}

.exam-kicker {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
}

.exam-title {
  margin: 0;
  font-size: 26px;
}

.exam-table,
.exam-mini {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.exam-mini {
  max-width: 420px;
}

.exam-table th,
.exam-table td,
.exam-mini td {
  border: 1px solid var(--line);
  padding: 6px 8px;
  text-align: left;
  font-size: 15px;
}

.exam-part {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exam-part-title {
  margin: 0;
  font-size: 19px;
}

.exam-item {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
}

.exam-item.is-ok {
  border-color: var(--ok);
}

.exam-item.is-bad {
  border-color: var(--bad);
}

.exam-n {
  margin: 0 0 8px;
}

.exam-verdict {
  margin: 0 0 4px;
  font-weight: 600;
}

.exam-explain {
  margin: 0;
}

.exam-hint {
  margin: 0 0 6px;
  font-size: 14px;
}

.exam-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exam-choices button.is-picked {
  outline: 2px solid var(--c-line);
  outline-offset: 1px;
}

.exam-numeric input {
  width: 100%;
  max-width: 280px;
  min-height: 44px;
  font-size: 17px;
}

.exam-guide summary {
  cursor: pointer;
  color: var(--ink-soft);
  font-weight: 600;
}
```

- [ ] **Step 4: Wire the route in App.tsx**

In `src/App.tsx`:

```tsx
import { ExamPage } from './pages/ExamPage';
```

and after the `progress` branch:

```tsx
  if (route.view === 'exam') return <ExamPage />;
```

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run build`
Expected: PASS

Commit:

```bash
git add src/pages/ExamPage.tsx src/pages/ExamPage.css src/App.tsx
git commit -m "feat: add the mock exam page"
```

---

### Task 4: Progress page entry point and history

**Files:**
- Modify: `src/pages/ProgressPage.tsx`

**Interfaces:**
- Consumes: `goToExam()` from Task 1; `useExamAttempts` from Task 1
- Produces: exam entry button + attempt history on the Progress page

- [ ] **Step 1: Implement the Progress page changes**

In `src/pages/ProgressPage.tsx`:

Add imports:

```tsx
import { useExamAttempts } from '../shell/useExamAttempts';
import { goToExam } from '../shell/useHashRoute';
```

Add to the component body:

```tsx
  const { attempts } = useExamAttempts();
```

In the header, after the "Back to lab" button:

```tsx
        <button className="primary" onClick={goToExam}>
          Take the mock exam
        </button>
```

Below the prerequisite list, before the storage note:

```tsx
      <section className="exam-history">
        <h2 className="exam-history-title">Mock exam</h2>
        {attempts.length === 0 ? (
          <p className="soft">No attempts yet.</p>
        ) : (
          <ul className="exam-history-list">
            {attempts.map((a, i) => (
              <li key={a.updatedAt}>
                {`${a.score}/${a.of}`}
                <span className="soft">
                  {` — Part I ${a.partI}/20, Part II ${a.partII}/40 — ${new Date(a.updatedAt).toLocaleDateString()}`}
                </span>
                {i === 0 && ' (latest)'}
              </li>
            ))}
          </ul>
        )}
      </section>
```

- [ ] **Step 2: CSS**

Add to `src/pages/ProgressPage.css`:

```css
.exam-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exam-history-title {
  margin: 0;
  font-size: 19px;
}

.exam-history-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm test && npm run build && git diff --check`
Expected: PASS

Commit:

```bash
git add src/pages/ProgressPage.tsx src/pages/ProgressPage.css
git commit -m "feat: exam entry point and history on the progress page"
```

---

### Task 5: Responsive pass and final verification

**Files:**
- Modify: `src/pages/ExamPage.css` (mobile rules)

- [ ] **Step 1: Mobile rules**

Add to `src/pages/ExamPage.css`:

```css
@media (max-width: 820px) {
  .exam-page {
    padding: 20px 16px 64px;
    gap: 14px;
  }

  .exam-title {
    font-size: 22px;
  }

  .exam-mini {
    max-width: 100%;
  }

  .exam-choices button {
    flex: 1 1 auto;
    min-width: 44%;
  }

  .exam-numeric input {
    max-width: 100%;
  }
}
```

- [ ] **Step 2: Full verification**

Run: `npm test && npm run build && git diff --check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/ExamPage.css
git commit -m "fix: stack exam choices on narrow screens"
```

---

### Task 6: Push and deploy

- [ ] **Step 1: Push**

```bash
git push origin feat/handout-alignment
```

(Do not merge to main without the tutor's explicit go-ahead — `main` auto-deploys to the live site.)

- [ ] **Step 2: Manual browser check**

Start `npm run dev` and walk the flow: Progress page → "Take the mock exam" → answer some items → submit → score and solutions → essays self-check → take it again. Confirm mobile layout at 390px via devtools.
