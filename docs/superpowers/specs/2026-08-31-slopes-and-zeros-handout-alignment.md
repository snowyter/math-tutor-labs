# Slopes & Zeros — Handout Alignment Design

**Date:** 2026-08-31
**Status:** Approved, pending implementation plan

## Purpose

Align the slope-and-zero lab with the tutee's actual Week 4 handout
(`L4-Slopes_and_Zeros_of_Linear_Functions.pdf`) so the app is a complete
companion to the lesson rather than a parallel treatment with its own
sequence and vocabulary.

The success criterion is specific: **after working through the app with the
tutor, the student should be able to attempt every part of the handout** —
including its activities — without meeting anything for the first time.

## Context

The tutee is in Grade 9 in the Philippines under the DepEd MATATAG
curriculum. The handout is the Week 4 – Term 1 lesson and states its
competency verbatim as:

> Determine the slopes as rate of change and the zeros of linear functions
> represented in: a. graphs, b. equations, c. tables of values

That matches the MATATAG Grade 9 Quarter 1 competency exactly, so the
handout is the authoritative sequence for this topic.

## Gap analysis

| Handout topic | App status |
|---|---|
| Mika opener (150, spends 30/day) | **Missing** |
| Definition of a linear function; three representations | **Missing** |
| Is it linear? (constant change test) | **Missing** |
| Slope definition, rise/run, slope formula | Partial — no explicit formula until 2026-08-31 |
| Types of slope | Present |
| Slope as rate of change | Added 2026-08-31 |
| Zero of a function (definition) | Partial — no standalone lesson |
| Zero vs x-intercept | **Missing as a lesson** (only a tutor note) |
| From a graph (choose points → rise/run → divide) | Present, but third in sequence |
| From an equation (slope-intercept form) | Present, but named `y = mx + b` only |
| From an equation (standard form) | **Missing** |
| From a table | Present, but first in sequence |
| Not a function / vertical line | **Missing** (undefined slope is covered) |
| Activities per representation | **Missing in the lab** (prereq drills exist) |

**Sequence conflict:** the handout teaches 1. Graph → 2. Equation → 3. Table.
The app currently runs Table → Equation → Graph.

**Method conflict:** for a table with no `f(x) = 0` row, the handout teaches
find slope → substitute a point to solve for *b* → set `f(x) = 0` → solve.
The app teaches only the visual "walk to zero". Both are correct; the student
needs to recognise both.

## Locked decisions

| Decision | Choice | Consequence |
|---|---|---|
| Scope | Full alignment | Five new topics and a resequence; largest change to the lab so far |
| Sequence | Graph → Equation → Table, after foundations | Matches the handout exactly |
| Table zero | Teach **both** methods | Student recognises either on assessment |
| Mika opener | Included, with the handout's fixed numbers | Section 1 is static and ignores "New example" |
| Mika numbers | Fixed (150, 30/day) | Deliberate: the handout uses these; randomising would break the parallel |
| Undefined slope | Cross-reference from the graph section | Not duplicated in the "not a function" step |
| Foundations | Teaching content is fixed | Sections 1–2 use no example data at all; 3–5 teach fixed ideas but may display the current line |
| Representations | Generated from the current example | Sections 6–8 respond to "New example" |

## New section sequence

### 1. `what-is-linear` — What is a linear function?

- **Widget:** `table` (extended, with explicit `rows`)
- **Content:** Mika has 150 in her wallet and spends 30 a day. Table of
  Day 0–5 against Money Left 150, 120, 90, 60, 30, 0.
- **Steps** (mirroring the handout's three questions):
  1. How much money is lost each day? → 30. Named as **slope**.
  2. Is the change the same every day? → Yes, constant.
  3. On what day will Mika have 0 left? → Day 5. Named as **zero**.
  4. Definition: a linear function graphs as a straight line, has a constant
     rate of change, and has degree one or less.
  5. The same function shown three ways — equation, table, graph.
- **Why this works:** slope and zero arrive as answers to real questions
  before they are named, exactly as the handout does it.

### 2. `is-it-linear` — Is it linear?

- **Widget:** new `tableCompare`
- **Content:** two tables side by side with the change in `f(x)` annotated
  under each:
  - `x: -1, 0, 1, 2` / `f(x): 4, 6, 8, 10` → change `+2, +2, +2` → linear
  - `x: 0, 1, 2, 3` / `f(x): 1, 2, 4, 7` → change `+1, +2, +3` → not linear
- **Steps:** the constant-change rule; a "which of these is linear?" question.
- **Note:** the handout also asks this of graphs and equations. Those are
  covered as steps, not as new widgets — a straight line, and degree one or
  less.

### 3. `slope-recall` — Slope

- **Widget:** `graph` with the rise/run triangle
- **Content:** slope is the ratio of vertical change to horizontal change
  between two points, denoted *m*. Shows rise and run on the graph, then
  states the slope formula `(y₂ − y₁)/(x₂ − x₁)`.
- **Steps:** definition; rise/run; the formula as the same thing written with
  coordinates; "m is positive if the run goes right, negative if it goes left".

### 4. `types-of-slope` — Types of slope

Existing section, kept. Positive, negative, zero, undefined.

### 5. `zero-of-a-function` — The zero of a function

- **Widget:** `graph` with `showZero`
- **Content:** the zero is the value of *x* that makes the output 0. In a
  table, the *x* where `f(x) = 0`. In a graph, the *x* where the line crosses
  the x-axis.
- **Steps:** definition; the table case; the graph case; **zero vs
  x-intercept** — if the line crosses at `(4, 0)`, the x-intercept is the
  *point* `(4, 0)` but the zero is the *x-value* `4`.
- **Why this matters:** the handout devotes a whole slide to it and the
  current app only warns about it in a tutor note.

### 6. `from-graph` — From a graph

Existing content, moved to first. Keeps the handout's numbered method:
1. Choose two points.
2. Identify the rise and the run.
3. Divide and simplify.
Then find the zero where the line crosses the x-axis. Add a closing step
cross-referencing the vertical-line case back to `types-of-slope`.

### 7. `from-equation` — From an equation

- **Content:** `f(x) = mx + b`, named as **slope-intercept form**, where
  *m* is the slope and *b* is the y-intercept.
- **Steps:** read *m*; read *b*; find the zero by setting `f(x) = 0`.
- **New:** a **standard form** step — `Ax + By = C` — showing how to recover
  the slope as `−A/B`.

### 8. `from-table` — From a table

- **Content:** if the table has an `f(x) = 0` row, read the zero off.
  Otherwise find the slope first.
- **Two methods for the no-zero case, both taught:**
  - **Walk to zero** (existing `walkToZero` widget) — the visual route.
  - **Solve for b** (handout route) — find slope, substitute a point to solve
    for *b*, write the equation, set `f(x) = 0`, solve.
- **Steps:** read-off case; slope from the table; method A (walk to zero);
  method B (solve for b); a closing step stating both routes give the same
  zero.

## Widget changes

### Extend `table` with optional `rows`

```ts
| { kind: 'table'; highlightRows: number[]; rows?: Point[] }
```

When `rows` is supplied the widget renders those instead of
`example.table`. Needed because the Mika numbers are fixed and must not
change when the tutor rolls a new example.

### New `tableCompare`

```ts
| { kind: 'tableCompare'; tables: { rows: Point[]; changes: string[] }[] }
```

Renders two or three small tables, each with its change annotation
underneath (`+2, +2, +2`). This is what makes the linearity test visible
rather than merely stated.

### Reused unchanged

`graph`, `graphPreset`, `zeroLine`, `walkToZero`, `expression`.

## Data model changes

Add to `WidgetSpec` in `src/engine/types.ts`:

- `rows?: Point[]` on the `table` variant
- the new `tableCompare` variant

No change to `Section`, `Step`, `Answer`, or `LinearExample`.

## Testing strategy

- **Section tests** in `labs/slope-and-zero.test.ts`, extending the file added
  on 2026-08-31:
  - every section id in the expected order
  - `what-is-linear` quotes the Mika numbers (150, 30, Day 5)
  - `is-it-linear` shows one linear and one non-linear table
  - `zero-of-a-function` distinguishes zero from x-intercept
  - `from-equation` names slope-intercept form and covers standard form
  - `from-table` offers both methods
- **Widget tests** for `tableCompare` following the existing
  `*.layout.test.ts` pattern.
- **Regression:** the existing 1,936 tests must stay green, including the
  bridge and rate-of-change tests added on 2026-08-31.
- **Build** must pass (`tsc -b && vite build`).

## Staged implementation

| Stage | Content | Checkpoint |
|-------|---------|-----------|
| 1 | `table.rows` extension, `tableCompare` widget, sections 1–2 | Mika opener and linearity test working |
| 2 | Sections 3–5 | Slope recall, types, zero + zero-vs-intercept |
| 3 | Resequence to 6–8, add standard form | Graph → Equation → Table order live |
| 4 | Table both methods; practice questions per representation | Both routes present; handout fully covered |

Each stage ends green (tests + build) and pauses for review before the next.

## Out of scope

- Rewriting the prerequisite lessons — they stay as they are.
- The Activities 1–3 slides are represented as lab practice questions, not as
  separate printed worksheets.
- Any change to the other lab (there is only one).
- Randomising the Mika numbers.
