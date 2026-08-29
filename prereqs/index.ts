import { rat } from '../src/engine/rational';
import type { PrereqLesson } from '../src/engine/types';

const coordinatePlane: PrereqLesson = {
  id: 'coordinate-plane',
  title: 'The coordinate plane',
  widget: { kind: 'graph', showTriangle: false, showZero: false },
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
  widget: { kind: 'graph', showTriangle: false, showZero: false },
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
  widget: { kind: 'graph', showTriangle: true, showZero: false },
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
  widget: { kind: 'numberLine', from: -10, to: 10 },
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

export const PREREQS: PrereqLesson[] = [
  coordinatePlane,
  readingAPoint,
  riseAndRunCounting,
  subtractingNegatives,
  fractionsAsDivision,
];
