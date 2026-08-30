# Math Tutor Labs — Design

**Date:** 2026-08-30
**Status:** Approved, pending implementation plan

## Purpose

A framework for math labs that a tutor drives live while teaching a student 1:1.
The tutor manipulates the material and explains; the app is the visual aid, not a
self-paced exercise system.

This distinction drives every decision below. Features that serve independent
*unsupervised* study — accounts, dashboards, syncing across devices — are out of
scope. **Saved progress is not**, because the student this is built for is well
behind and meets the tutor repeatedly; see "Practice, feedback, and progress".

## Locked decisions

| Decision | Choice | Consequence |
|---|---|---|
| Scope | Framework for many labs | Adding a topic means adding a file, not writing code |
| Teaching aid | Tutor drives, student watches and answers | No accounts, no cross-device sync |
| Progress | Saved to `localStorage` per browser | Reverses an earlier "no persistence" decision — this student meets the tutor repeatedly |
| Stack | Vite + React + TypeScript | Requires `npm install` and `npm run dev` |
| Lab authoring | One data file per lab, rendered by shared widgets | Labs are data, not components |
| Layout | Graph left (fixed), steps right | Graph never moves or scrolls mid-explanation |
| Manipulation | Sliders for slope and y-intercept | No drag-and-drop; calmest screen |
| Tutor content | Notes inline under the current step; prerequisite lessons are separate pages with their own URL | Prereq lessons get the whole screen and their own manipulable |
| Prereq interaction | Dragging, in contrast to the lab's sliders | Hands-on where it's being learned, calm where it's being applied |
| Theme | Light | Better in a well-lit room and on a shared screen |

Prerequisites were originally specified as a full-screen focus overlay, and the
user declined a proposal to let graph-based lessons open side-by-side instead.
**That decision was reversed on 2026-08-30.** Prerequisites are now separate
pages, each with its own URL and its own interactive manipulable. The overlay is
gone.

The split with the sliders decision is deliberate rather than contradictory: the
lab is where the student *applies* slope, so it stays calm and slider-driven. The
prerequisites are where the student *builds* the idea, so that is where dragging
lives.

## Architecture

```
src/
  main.tsx, App.tsx
  styles/        tokens.css, global.css
  engine/
    rational.ts        Rational arithmetic: add, sub, mul, div, reduce, equals
    math.ts            slopeFromPoints, zeroFromEquation, zeroFromTable
    parse.ts           "2/3" | "-1.5" | "4"  ->  Rational
    generate.ts        example generation per level
    registry.ts        lab registration and lookup
    types.ts
  widgets/
    Graph.tsx          SVG plane, sliders, zero marker, rise/run triangle
    Table.tsx
    NumericInput.tsx   renders a numeric Step answer
    Choice.tsx         renders a choice Step answer
    StepReveal.tsx
    Fraction.tsx
    NumberLine.tsx     used by the subtracting-negatives prerequisite
    DragPlane.tsx      draggable point(s) on a plane; shared by 5 prereqs
    FractionBars.tsx   bar model; shared by the two fraction prereqs
    BalanceScale.tsx   used by solving-two-step-equations
    Substitution.tsx   used by substituting-to-check
  pages/
    PrereqPage.tsx     a prerequisite lesson as a full page
  shell/
    LabShell.tsx       layout A: graph left, steps right
    LabPicker.tsx
    Toolbar.tsx        lab, difficulty, New example, Prereqs, Tutor toggle
    WatchFor.tsx       inline misconception strip
    useHashRoute.ts    hand-rolled hash routing, no router dependency
labs/
  slope-and-zero.ts
  index.ts
prereqs/
  index.ts             the ten lessons for the first lab
```

**Dependencies:** `react`, `react-dom`. Dev: `vite`, `typescript`, `vitest`.

No charting library. The graph is hand-rolled SVG — libraries built for business
charts fight the requirements here (a real cartesian grid, rise/run annotation).
No animation library; slider tracking and step fades use CSS transitions. No
KaTeX; `Fraction.tsx` renders rise/run as a styled numerator/denominator.

### Layout

Two columns. The **graph pane on the left is present in every section** and never
scrolls or re-renders position. The **right column stacks the current section's
widget** (table, preset buttons, or a rendered equation) **above the step panel**.
So in section 3 the table sits at the top of the right column with the steps
underneath, and the graph stays put on the left showing the same line.

The toolbar runs along the top of the whole screen: lab picker, difficulty dial,
the section-3 case toggle (only shown in section 3), New example, Prereqs, and
the Tutor toggle.

## Lab data model

```ts
type Rational = { n: number; d: number };   // d > 0, always reduced
type Point    = { x: number; y: Rational };

type Level     = 'gentle' | 'standard' | 'challenging';
type TableKind = 'includes-zero' | 'excludes-zero';

type LinearExample = {
  m: Rational;                  // slope
  b: Rational;                  // y-intercept
  zero: Rational | null;        // x-intercept; null when m = 0 and b != 0
  zeroNote: string | null;      // explains "no zero" / "every x is a zero"
  tableKind: TableKind;
  table: Point[];
  points: [Point, Point];       // two integer points on the line, for graph reading
};

type Answer =
  | { kind: 'numeric'; prompt: string; correct: Rational | 'none' }
  | { kind: 'choice';  prompt: string; options: string[]; correct: number };

type Step = {
  text: string;
  why?: string;                 // optional inline expansion
  answer?: Answer;
};

type Parts = { parts: number; shaded: number };

type WidgetSpec =
  // lab widgets
  | { kind: 'graph'; showTriangle: boolean; showZero: boolean }
  | { kind: 'graphPreset'; presets: LinePreset[] }   // Types of slope section
  | { kind: 'table'; highlightRows: number[] }
  | { kind: 'expression' }
  // prerequisite interactives — each is manipulable, never static
  | { kind: 'dragPlane'; mode: 'free' | 'target'; target?: { x: number; y: number } }
  | { kind: 'dragRiseRun' }                          // two draggable points
  | { kind: 'dragVertical' }                         // drag until run = 0
  | { kind: 'dragNumberLine'; from: number; to: number; start: number }
  | { kind: 'fractionBars'; parts: number; shaded: number }
  | { kind: 'fractionCompare'; left: Parts; right: Parts }
  | { kind: 'balanceScale'; coefficient: number; constant: number }
  | { kind: 'substitution'; m: number; b: number };

type LinePreset =
  | { label: string; m: Rational; b: Rational }
  | { label: string; vertical: Rational };           // x = k, the undefined case

type Section = {
  id: string;
  title: string;
  body: string;
  widget?: WidgetSpec;
  steps: Step[];
  watchFor?: string[];          // misconception warnings, shown inline
  tutorNote?: string;
};

type Lab = {
  id: string;
  title: string;
  concept: string;
  gradeBand: string;
  prerequisites: string[];      // ids into prereqs/index.ts
  generate(seed: number, level: Level, tableKind: TableKind): LinearExample;
  sections: Section[];
};
```

`generate` returns a fresh example **already solved** — correct slope, zero,
table, and graph points all derived from `m` and `b`. "New example" is a new
seed; nothing is ever hand-written, so an example can't be internally
inconsistent.

Adding a second lab later: drop in `labs/systems-of-equations.ts`, add one line
to `labs/index.ts`. No code changes.

## First lab: Slope and zero of a linear function

Five sections, taught in this order:

1. **Definitions** — slope as rise over run; the zero as the x-intercept, the
   place where y = 0. Graph with sliders, triangle shown.
2. **Types of slope** — four presets: positive, negative, zero, undefined. Each
   sets the graph; a choice question then asks the student to classify the line
   they're looking at. This section is the only place a vertical line appears.
3. **From a table** — two sub-cases, selected by the tutor with a case toggle:
   - *table includes y = 0* — read the zero straight off the row
   - *table excludes y = 0* — find the slope first, then solve for the zero
4. **From an equation** — y = mx + b gives the slope directly; the zero comes
   from solving 0 = mx + b.
5. **From a graph** — read two points off the plotted line, form rise over run,
   locate the x-intercept.

Sections 3–5 each pair a `StepReveal` worked solution with a `NumericInput`
answer check.

## Prerequisite lesson pages

Ten lessons, each 3–6 steps, each with its own **manipulable** — something the
student drags or operates, not a picture to look at.

**Prerequisites are pages, not overlays.** Each has a real URL:

- `#/lab/<labId>` — the lab
- `#/prereq/<lessonId>` — a prerequisite lesson

Routing is hand-rolled against `window.location.hash` and the `hashchange`
event. No router dependency. Because it is a real URL, the browser back button
works and a lesson can be bookmarked or opened directly before a session.

Each page has a "Back to lab" control. The lab's toolbar keeps a "Prereq"
dropdown that navigates to any of the lab's prerequisites.

| id | Title | The student does this |
|---|---|---|
| `coordinate-plane` | The coordinate plane | Drag a point around; the (x, y) readout follows |
| `reading-a-point` | Reading a point | Drag the point onto a given target, e.g. (−2, 3) |
| `rise-and-run-counting` | Rise and run by counting | Drag two points; rise and run counters update live |
| `subtracting-negatives` | Subtracting negative numbers | Drag a marker along a number line; the jump draws as an arrow |
| `fractions-as-division` | A fraction is a division | Split a bar into parts and shade some of them |
| `simplifying-fractions` | Simplifying fractions | See two bars regrouped into bigger pieces |
| `y-equals-zero` | What y = 0 means | Drag a point; it lights up the moment y hits 0 |
| `solving-two-step-equations` | Solving a two-step equation | Operate a balance scale: take 6 off, then split in 3 |
| `substituting-to-check` | Checking by substituting back | Choose an x and watch y compute step by step |
| `division-by-zero-undefined` | Why division by zero is undefined | Drag two points until the run hits 0 and the slope breaks |

Lessons are stored in `prereqs/index.ts` and referenced by id, so a later lab
can reuse `subtracting-negatives` and `solving-two-step-equations` without
re-authoring them.

Dragging snaps to whole grid positions. Every interactive is pointer-based, so it
works with a mouse, a trackpad, or a finger on a touchscreen laptop.

## Practice, feedback, and progress

Added 2026-08-30 for a student who is well behind and needs the prerequisites
taught properly, not toured.

**Practice drills.** Every prerequisite lesson carries a `Drill`: eight questions
generated from a seeded RNG, new numbers on every attempt. `DrillQuestion` has the
same shape as `Answer`, so the existing input and choice widgets render it
unchanged. The student may retry a question freely; only the eventual result is
recorded.

**Mistake feedback.** A wrong answer names the likely error rather than saying
"try again" — typing `3/2` for `2/3` gets *"That is run ÷ rise. Rise goes on
top."* The misconceptions were already authored per section; they are now
attached to the specific wrong values. Because drills generate their numbers,
they generate their own mistake list alongside each question.

Two invariants the tests enforce:
- A mistake must never equal the correct answer, or the student is told they are
  wrong when they are right.
- For choice questions, every mistake must match an option that is actually
  offered, or its feedback can never fire.

**Exact mode.** `Answer.exact` requires the reduced form rather than merely an
equal value. Needed for the simplifying-fractions drill: `6/9` and `2/3` are the
same number, so without exact mode a student could pass by retyping the question.

**Progress.** `localStorage` under `math-tutor-labs:progress:v1`. Per lesson:
attempts, best score, last score. Shown on each prerequisite page and summarised
at `#/progress`, which lists all ten with a bar per lesson. Browser-local only —
not shared between devices, and no accounts.

## Difficulty and the case toggle

Two independent controls, each doing one job.

**Difficulty dial** — numbers only. Defaults to `gentle`, and sticks while
"New example" is pressed.

| | Gentle | Standard | Challenging |
|---|---|---|---|
| Slope | positive integers 1–3 | ±1–5, plus ½, ⅔, 3⁄2 | fractions such as −3⁄4 |
| Intercept | chosen so the zero is exact | any integer | any integer |
| Zero | always a whole number | may be fractional (−3⁄2) | awkward fractions |
| Table rows | consecutive x | consecutive x | unordered, non-consecutive |
| Negative slopes | none | allowed | allowed |

Negative slopes stay out of *computation* until Standard — the intercept may be
negative at any level, since that only makes the zero land elsewhere. Section 2
has its own presets and is unaffected by the dial, so the student sees negative,
zero, and undefined slopes from section 2 onward regardless of level.

**Case toggle** — curriculum, not difficulty. For section 3 the tutor picks
"table includes y = 0" or "table excludes y = 0". Both must be taught, so they
are not easy and hard versions of one thing. The toggle governs this at every
difficulty level; the dial only controls number size and row ordering.

## Math correctness

These are correctness requirements, not nice-to-haves.

- **Gentle guarantees an integer zero.** `generate` picks `b` divisible by `m`
  so `−b/m` is whole. Asserted by tests, not assumed.
- **Every table row lies on the line.** Tables are derived from `m` and `b`.
- **`m = 0` with `b ≠ 0`** is a horizontal line with **no** zero. `−b/m` is a
  division by zero; the app must report "this line has no zero" via `zeroNote`,
  never render `NaN`.
- **`m = 0` with `b = 0`** is the x-axis — every x is a zero. Also handled by
  `zeroNote`.
- **Undefined slope** is vertical (`x = k`), cannot be expressed as
  `y = mx + b`, and appears only in section 2. The `Graph` widget accepts
  `{ vertical }` for this case.
- **Answer comparison is exact rational comparison.** `4/6` equals `2/3`, and
  `2` equals `2.0` equals `2/1`. Never string matching, never float tolerance.
- **Accepted input forms:** `2/3`, `-2/3`, `1.5`, `-1.5`, `4`, and the literal
  `none` for the no-zero case.

## Visual design

**One color, one meaning, everywhere.** rise is green, run is amber, the zero is
red, the line is blue. The student learns the code once and it carries into
later labs. Tokens live in `styles/tokens.css`.

Light background, student-facing text at 18–20px, generous spacing. Motion is
functional only: the line tracks the slider without lag, revealed steps fade in,
a checked answer flashes green or red. Nothing animates decoratively.

## Testing

Vitest, on pure functions only:

- `rational.ts` — reduce, equals, arithmetic
- `parse.ts` — all accepted input forms, and rejection of malformed input
- `math.ts` — `slopeFromPoints`, `zeroFromEquation`, `zeroFromTable`
- `generate.ts` — invariants: at `gentle` the zero is always an integer; every
  table row lies on the line; the two points lie on the line

No component tests. UI failure modes are visual, so the interface gets a manual
pass in the browser.

## Setup

```
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

**Careful:** the project directory is not empty — it already contains `.git` and
`docs/`. The Vite scaffolder will offer to remove existing files and continue.
**Do not take that option.** Choose "Ignore files and continue" instead; `docs/`
and `.git` must survive.

`.gitignore` covers `node_modules`, `dist`, and `.superpowers/`.

## Out of scope

Progress tracking, student accounts, multi-student dashboards, printing,
mobile-specific layout, localization, and any per-lab custom rendering.
