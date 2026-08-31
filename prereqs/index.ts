import { rat } from '../src/engine/rational';
import { DRILLS } from './drills';
import type { LabNumbers, PrereqLesson } from '../src/engine/types';

const coordinatePlane: PrereqLesson = {
  id: 'coordinate-plane',
  title: 'The coordinate plane',
  widget: { kind: 'dragPlane', mode: 'free' },
  steps: [
    { text: 'The flat surface is crossed by two number lines.' },
    { text: 'The horizontal one is the x-axis. The vertical one is the y-axis.' },
    { text: 'They cross at the origin, which is the point (0, 0).' },
    {
      text: 'Right is positive x and left is negative x.',
      why: 'It is the number line you already know, laid on its side.',
    },
    { text: 'Up is positive y and down is negative y.' },
    {
      text: 'Which direction is positive y?',
      answer: {
        kind: 'choice',
        prompt: 'Positive y is',
        options: ['Up', 'Down', 'Right', 'Left'],
        correct: 0,
      },
    },
  ],
};

const readingAPoint: PrereqLesson = {
  id: 'reading-a-point',
  title: 'Reading a point',
  widget: { kind: 'dragPlane', mode: 'target', target: { x: -2, y: 3 } },
  steps: [
    { text: 'A point is written (x, y) — x always first, then y.' },
    { text: 'The x number tells you how far across: right if positive, left if negative.' },
    { text: 'The y number tells you how far up: up if positive, down if negative.' },
    {
      text: 'Where is the point (-2, 3)?',
      answer: {
        kind: 'choice',
        prompt: '(-2, 3) is',
        options: ['2 left, 3 up', '2 right, 3 up', '3 left, 2 up', '2 left, 3 down'],
        correct: 0,
      },
    },
  ],
};

const riseAndRunCounting: PrereqLesson = {
  id: 'rise-and-run-counting',
  title: 'Rise and run by counting',
  widget: { kind: 'dragRiseRun' },
  steps: [
    { text: 'Put your finger on the left-hand point.' },
    {
      text: 'Count squares straight up or down until you are level with the second point. That is the rise.',
    },
    { text: 'Then count squares straight across to reach it. That is the run.' },
    { text: 'Slope is rise over run.', why: 'Say it in that order: rise first, run second.' },
    {
      text: 'Which number goes on top?',
      answer: { kind: 'choice', prompt: 'On top goes the', options: ['rise', 'run'], correct: 0 },
    },
  ],
};

const subtractingNegatives: PrereqLesson = {
  id: 'subtracting-negatives',
  title: 'Subtracting negative numbers',
  widget: { kind: 'dragNumberLine', from: -10, to: 10, start: -1 },
  steps: [
    { text: 'A number line goes up to the right and down to the left.' },
    { text: '-1 - 5 means: start at -1, then take 5 more steps to the left.' },
    {
      text: 'Five steps left of -1 is -6. So -1 - 5 = -6.',
      why: 'Subtracting a positive always moves left, even when you start already negative.',
    },
    {
      text: 'What is -2 - 4?',
      answer: { kind: 'numeric', prompt: '-2 - 4 =', correct: rat(-6) },
    },
  ],
};

const fractionsAsDivision: PrereqLesson = {
  id: 'fractions-as-division',
  title: 'A fraction is a division',
  widget: { kind: 'fractionBars', parts: 4, shaded: 3 },
  steps: [
    { text: 'A fraction is a division that has not been worked out yet.' },
    { text: '2 over 3 means 2 divided by 3.' },
    {
      text: 'It is still one number — it sits between 0 and 1.',
      why: '2 divided by 3 is less than 1, because 2 is smaller than 3.',
    },
    {
      text: 'Write 3 divided by 4 as a fraction.',
      answer: { kind: 'numeric', prompt: '3 ÷ 4 =', correct: rat(3, 4) },
    },
  ],
};

const simplifyingFractions: PrereqLesson = {
  id: 'simplifying-fractions',
  title: 'Simplifying fractions',
  widget: {
    kind: 'fractionCompare',
    left: { parts: 6, shaded: 4 },
    right: { parts: 3, shaded: 2 },
  },
  steps: [
    { text: '4 over 6 and 2 over 3 are the same number.' },
    {
      text: 'You get from one to the other by dividing the top and the bottom by the same thing.',
    },
    { text: 'Divide both by 2: 4 divided by 2 is 2, and 6 divided by 2 is 3.' },
    {
      text: 'So 4 over 6 is 2 over 3.',
      why: 'Dividing top and bottom by the same number does not change the value.',
    },
    {
      text: 'Simplify 6 over 9.',
      answer: { kind: 'numeric', prompt: '6/9 =', correct: rat(2, 3) },
    },
  ],
};

const yEqualsZero: PrereqLesson = {
  id: 'y-equals-zero',
  title: 'What y = 0 means',
  widget: { kind: 'dragPlane', mode: 'free' },
  steps: [
    { text: 'Every point on the x-axis has a y-value of 0.' },
    {
      text: 'So asking "where is y = 0?" is the same as asking "where does it cross the x-axis?"',
    },
    { text: 'That crossing point is called the zero.' },
    {
      text: 'Where on a graph is y = 0?',
      answer: {
        kind: 'choice',
        prompt: 'y = 0 happens',
        options: ['On the x-axis', 'On the y-axis', 'Only at the origin', 'At the top'],
        correct: 0,
      },
    },
  ],
};

function eqText(c: number, k: number): string {
  return k < 0 ? `0 = ${c}x - ${Math.abs(k)}` : `0 = ${c}x + ${k}`;
}

// Both lessons need whole numbers with a whole zero and a positive
// coefficient: the balance scale shows x-blocks, and the practice equation
// stays readable.
function lessonParams(p: LabNumbers): { m: number; b: number } | null {
  if (!Number.isInteger(p.m) || !Number.isInteger(p.b)) return null;
  if (p.m < 1 || p.b === 0) return null;
  if (!Number.isInteger(-p.b / p.m)) return null;
  return { m: p.m, b: p.b };
}

function solvingTwoStep(c: number, k: number): PrereqLesson {
  const zero = -k / c;
  const c2 = c + 1;
  const k2 = 3 * c2;
  const undoConstant =
    k < 0
      ? `Undo the -${Math.abs(k)} first: add ${Math.abs(k)} to both sides. That leaves ${Math.abs(k)} = ${c}x.`
      : `Undo the +${k} first: take ${k} from both sides. That leaves ${-k} = ${c}x.`;
  return {
    id: 'solving-two-step-equations',
    title: 'Solving a two-step equation',
    widget: { kind: 'balanceScale', coefficient: c, constant: k },
    steps: [
      { text: `Take ${eqText(c, k)}. We want x on its own.` },
      { text: undoConstant },
      { text: `Now undo the times-${c}: divide both sides by ${c}. That leaves ${zero} = x.` },
      {
        text: `So x = ${zero}.`,
        why: 'Undo the addition before the multiplication — you peel off the last layer first.',
      },
      {
        text: `Solve 0 = ${c2}x + ${k2}.`,
        answer: { kind: 'numeric', prompt: 'x =', correct: rat(-k2 / c2) },
      },
    ],
  };
}

function substitutingToCheck(m: number, b: number): PrereqLesson {
  const zero = -b / m;
  const m2 = m + 1;
  const b2 = 3 * m2;
  const combine =
    b < 0
      ? `That is ${m * zero} - ${Math.abs(b)}, which is 0.`
      : `That is ${m * zero} plus ${b}, which is 0.`;
  return {
    id: 'substituting-to-check',
    title: 'Checking by substituting back',
    widget: { kind: 'substitution', m, b },
    steps: [
      {
        text: `To check whether x = ${zero} is the zero of y = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}, put ${zero} where x is.`,
      },
      { text: `y = ${m} times ${zero}, ${b < 0 ? 'minus' : 'plus'} ${Math.abs(b)}.` },
      { text: combine },
      {
        text: `y came out as 0, so x = ${zero} really is the zero.`,
        why: 'The zero is the x that makes y come out as 0. So substitute and look for 0.',
      },
      {
        text: `Check x = -3 in y = ${m2}x ${b2 < 0 ? '-' : '+'} ${Math.abs(b2)}. What is y?`,
        answer: { kind: 'numeric', prompt: 'y =', correct: rat(0) },
      },
    ],
  };
}

export function buildPrereq(id: string, params?: LabNumbers): PrereqLesson | undefined {
  if (id === 'solving-two-step-equations') {
    const p = params ? lessonParams(params) : null;
    return attachDrill(p ? solvingTwoStep(p.m, p.b) : solvingTwoStep(3, 6));
  }
  if (id === 'substituting-to-check') {
    const p = params ? lessonParams(params) : null;
    return attachDrill(p ? substitutingToCheck(p.m, p.b) : substitutingToCheck(2, -8));
  }
  const lesson = LESSONS.find((l) => l.id === id);
  return lesson ? attachDrill(lesson) : undefined;
}

function attachDrill(lesson: PrereqLesson): PrereqLesson {
  return { ...lesson, drill: DRILLS[lesson.id] };
}

const divisionByZero: PrereqLesson = {
  id: 'division-by-zero-undefined',
  title: 'Why division by zero is undefined',
  widget: { kind: 'dragVertical' },
  steps: [
    { text: 'Slope is rise over run.' },
    { text: 'For a straight vertical line, the run is 0 — it does not go across at all.' },
    { text: 'So the slope becomes rise divided by 0.' },
    { text: 'Division by 0 has no answer, so the slope of a vertical line is undefined.' },
    {
      text: 'Undefined is not the same as zero. Zero slope is flat. Undefined slope is vertical.',
    },
    {
      text: 'A vertical line has slope that is',
      answer: {
        kind: 'choice',
        prompt: 'A vertical line has slope',
        options: ['zero', 'undefined', '1', '-1'],
        correct: 1,
      },
    },
  ],
};

const LESSONS: PrereqLesson[] = [
  coordinatePlane,
  readingAPoint,
  riseAndRunCounting,
  subtractingNegatives,
  fractionsAsDivision,
  simplifyingFractions,
  yEqualsZero,
  divisionByZero,
];

const PREREQ_IDS = [
  'coordinate-plane',
  'reading-a-point',
  'rise-and-run-counting',
  'subtracting-negatives',
  'fractions-as-division',
  'simplifying-fractions',
  'y-equals-zero',
  'solving-two-step-equations',
  'substituting-to-check',
  'division-by-zero-undefined',
] as const;

export const PREREQS: PrereqLesson[] = PREREQ_IDS.map((id) => buildPrereq(id)!);
