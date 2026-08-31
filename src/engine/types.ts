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

// A wrong answer the student is likely to give, and what to say about it.
// `match` is parsed the same way as student input, so '3/2' also catches '1.5'.
export type Mistake = { match: string; say: string };

export type Answer =
  | {
      kind: 'numeric';
      prompt: string;
      correct: Rational | 'none';
      mistakes?: Mistake[];
      // Requires the reduced form, not merely an equal value. Needed where the
      // form IS the skill — otherwise typing 6/9 back passes a simplify drill.
      exact?: boolean;
    }
  | { kind: 'choice'; prompt: string; options: string[]; correct: number; mistakes?: Mistake[] };

// A drill question is just an answer with its own generated feedback.
export type DrillQuestion = Answer;

export type Drill = {
  length: number;
  make(rand: () => number): DrillQuestion;
};

export type Step = { text: string; why?: string; answer?: Answer };

export type LinePreset =
  | { label: string; m: Rational; b: Rational }
  | { label: string; vertical: Rational };

export type Parts = { parts: number; shaded: number };

// Numbers handed from the lab's current example to a prerequisite lesson.
export type LabNumbers = { m: number; b: number };

export type WidgetSpec =
  // lab widgets
  | { kind: 'graph'; showTriangle: boolean; showZero: boolean }
  | { kind: 'graphPreset'; presets: LinePreset[] }
  | { kind: 'table'; highlightRows: number[]; rows?: Point[] }
  | { kind: 'tableCompare'; tables: { rows: Point[]; changes: string[] }[] }
  | { kind: 'expression' }
  | { kind: 'walkToZero'; row: number }
  | { kind: 'zeroLine' }
  // prerequisite interactives — each is manipulable, never static
  | { kind: 'dragPlane'; mode: 'free' | 'target'; target?: { x: number; y: number } }
  | { kind: 'dragRiseRun' }
  | { kind: 'dragVertical' }
  | { kind: 'dragNumberLine'; from: number; to: number; start: number }
  | { kind: 'fractionBars'; parts: number; shaded: number }
  | { kind: 'fractionCompare'; left: Parts; right: Parts }
  | { kind: 'balanceScale'; coefficient: number; constant: number }
  | { kind: 'substitution'; m: number; b: number };

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
  drill?: Drill;
};

export type LessonProgress = {
  attempts: number;
  best: number;
  last: number;
  of: number;
  updatedAt: number;
};

export type Progress = {
  lessons: Record<string, LessonProgress>;
};
