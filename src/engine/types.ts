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

export type Parts = { parts: number; shaded: number };

export type WidgetSpec =
  // lab widgets
  | { kind: 'graph'; showTriangle: boolean; showZero: boolean }
  | { kind: 'graphPreset'; presets: LinePreset[] }
  | { kind: 'table'; highlightRows: number[] }
  | { kind: 'expression' }
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
};
