import { generate } from './generate';
import { sectionsFor } from '../../labs/slope-and-zero';
import { buildPrereq, PREREQS } from '../../prereqs';
import type { Lab, LabNumbers, Level, TableKind, LinearExample, PrereqLesson } from './types';

export const slopeAndZero: Lab = {
  id: 'slope-and-zero',
  title: 'Slope and zero of a linear function',
  concept:
    'What slope and zero mean, and how to find them from a table, an equation, or a graph.',
  gradeBand: 'Algebra 1',
  prerequisites: PREREQS.map((p) => p.id),
  generate,
  sections: sectionsFor,
};

export const LABS: Lab[] = [slopeAndZero];

export const PREREQ_LESSONS: PrereqLesson[] = PREREQS;

export function prereqById(id: string, params?: LabNumbers): PrereqLesson | undefined {
  return buildPrereq(id, params);
}

export function firstExample(level: Level, tableKind: TableKind): LinearExample {
  return generate(1, level, tableKind);
}
