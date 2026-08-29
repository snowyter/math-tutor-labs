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
