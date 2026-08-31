# Mock Exam Page — Design

**Date:** 2026-08-31
**Status:** Approved, pending implementation plan

## Purpose

Put the mock exam (`docs/mock-exam-slopes-and-zeros.md`) on the website so the
student can take it on a phone between tutoring sessions. The page is a
**practice exam**, not a test of record: the tutor grades the paper copy; the
web page gives the student unlimited realistic rehearsal with worked solutions
for anything missed.

## Locked decisions

| Decision | Choice | Consequence |
|---|---|---|
| Checking | Grade once, at the end | Realistic; a score that means something |
| Essays | Self-check marking guide shown after submission | Not auto-scored |
| Scoring | Auto-scored items carry the paper exam's points (I: 20×1, II: 10×4) | Score out of 60; essays listed separately |
| Attempts | Saved to localStorage, shown on the Progress page | Reuses the existing progress pattern |
| Content | Questions live in a typed data file, mirroring the handout | Same numbers as the paper exam; one source of truth per answer |
| Coverage | Every handout topic, same items as the paper exam | The web exam and the paper exam stay identical |

## URL and navigation

- Route: `#/exam` (new `exam` variant in `Route`)
- Entry: a button on the Progress page — the student's landing spot — labelled
  "Take the mock exam". No toolbar changes.

## Page flow

Three states, one component each, one at a time on screen:

1. **Intro** — title, competency, time-box note (90 minutes), the three-part
   table, and a "Start" button. Nothing answered yet.
2. **Taking** — all 30 auto-scored items on one scrolling page, grouped by
   part. Each item: number, stem, and the appropriate input (choice buttons or
   a text field). No feedback while taking. A single "Submit" button at the
   bottom.
3. **Result** — score out of 60, per-part breakdown, the item-by-item
   solutions (student's answer vs correct, with the key's brief explanation),
   and the five essay questions with their marking guides for self-checking.
   A "Take it again" button resets to the intro state.

Unanswered items are allowed and simply marked wrong at grading — no
forcing, matching the paper exam.

## Data model (`src/engine/exam.ts`)

```ts
export type ExamChoice = {
  kind: 'choice';
  n: number;            // item number, 1-based
  stem: string;         // may include table markup hints
  options: string[];
  correct: number;      // index
  explain: string;      // from the paper answer key
  table?: string[][];   // optional table to render above the stem
};

export type ExamNumeric = {
  kind: 'numeric';
  n: number;
  stem: string;
  correct: string;      // the paper key's exact answer, e.g. '3/2' or '-3'
  accept?: string[];    // additional accepted strings, e.g. '3.5'
  explain: string;
  table?: string[][];
  hint?: string;        // e.g. PS7's hint line
};

export type ExamItem = ExamChoice | ExamNumeric;
export type ExamPart = { id: string; title: string; pointsEach: number; items: ExamItem[] };
export type MockExam = { title: string; parts: ExamPart[]; essays: { n: number; prompt: string; guide: string }[] };
export const MOCK_EXAM: MockExam;  // the 30 items + 5 essays from the paper exam
```

Answer checking reuses `isCorrect()` from `src/engine/parse.ts`, which already
handles fractions (`3/2`, `1.5`, `-3/2`) — the same parser the lab uses, so
`-0.5` and `-1/2` both grade correct for item 12. The essay prompts and guides
are data on the same file, not a separate module.

## Components

| File | Responsibility |
|---|---|
| `src/engine/exam.ts` | The `MockExam` data and types — the 30 items + 5 essays from the paper exam |
| `src/pages/ExamPage.tsx` | The three-state page (intro → taking → result) |
| `src/pages/ExamPage.css` | Page styles, mobile-first |
| `src/shell/useHashRoute.ts` | Add the `exam` route variant |
| `src/App.tsx` | Render `ExamPage` on the route |
| `src/pages/ProgressPage.tsx` | "Take the mock exam" button + recent exam attempts |
| `src/shell/useProgress.ts` | Extend to record exam attempts (new `exams` record; untouched lesson logic) |

## Exam attempt record

```ts
export type ExamAttempt = {
  score: number;      // out of 60
  of: number;
  partI: number;      // out of 20
  partII: number;     // out of 40
  updatedAt: number;  // Date.now()
};
```

Stored in localStorage under a new `examAttempts` key (array, newest last,
capped at 10). The Progress page shows the last attempt's score and a small
history line. Lesson progress logic is untouched.

## Marking

- Part I: 1 point per item, 20 items.
- Part II: 4 points per item, 10 items.
- Numeric grading via `isCorrect(studentAnswer, correct-as-rational)`; the
  `accept` list adds exact-string alternates (e.g. `3.5` for `7/2`).
- Unanswered = wrong, no penalty.
- Essays: not scored; shown with their guides.

## Testing

- **Data test** (`src/engine/exam.test.ts`): every item number unique per
  part; every choice's `correct` index in range; the exam contains 20 + 10
  items and 5 essays; totals match the paper exam (60 auto-scored points);
  spot-checks that specific items' answers parse correctly via `isCorrect`
  (e.g. item 12 accepts both `-1/2` and `-0.5`).
- **Route test**: `#/exam` parses to the exam route (extend `useHashRoute.test.ts`).
- **Progress test**: an exam attempt round-trips through the storage hook.
- Build must pass; all existing tests stay green.

## Out of scope

- Timer enforcement — the page shows the 90-minute target but does not enforce
  it.
- Randomised variants of the exam.
- Tutor grading of essays in-app.
- Any change to the lab or prerequisite lessons.
