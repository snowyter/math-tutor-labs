import { rat } from '../src/engine/rational';
import { DRILLS } from './drills';
import type { PrereqLesson } from '../src/engine/types';

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

const solvingTwoStep: PrereqLesson = {
  id: 'solving-two-step-equations',
  title: 'Solving a two-step equation',
  widget: { kind: 'balanceScale', coefficient: 3, constant: 6 },
  steps: [
    { text: 'Take 0 = 3x + 6. We want x on its own.' },
    { text: 'Undo the +6 first: take 6 from both sides. That leaves -6 = 3x.' },
    { text: 'Now undo the times-3: divide both sides by 3. That leaves -2 = x.' },
    {
      text: 'So x = -2.',
      why: 'Undo the addition before the multiplication — you peel off the last layer first.',
    },
    {
      text: 'Solve 0 = 2x + 8.',
      answer: { kind: 'numeric', prompt: 'x =', correct: rat(-4) },
    },
  ],
};

const substitutingToCheck: PrereqLesson = {
  id: 'substituting-to-check',
  title: 'Checking by substituting back',
  widget: { kind: 'substitution', m: 2, b: -8 },
  steps: [
    { text: 'To check whether x = -2 is the zero of y = 3x + 6, put -2 where x is.' },
    { text: 'y = 3 times -2, plus 6.' },
    { text: 'That is -6 plus 6, which is 0.' },
    {
      text: 'y came out as 0, so x = -2 really is the zero.',
      why: 'The zero is the x that makes y come out as 0. So substitute and look for 0.',
    },
    {
      text: 'Check x = 4 in y = 2x - 8. What is y?',
      answer: { kind: 'numeric', prompt: 'y =', correct: rat(0) },
    },
  ],
};

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
  solvingTwoStep,
  substitutingToCheck,
  divisionByZero,
];

export const PREREQS: PrereqLesson[] = LESSONS.map((lesson) => ({
  ...lesson,
  drill: DRILLS[lesson.id],
}));
