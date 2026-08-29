import { rat, format } from '../src/engine/rational';
import type { LinearExample, Section } from '../src/engine/types';

function zeroText(ex: LinearExample): string {
  if (ex.zero === null) return 'no zero';
  return `x = ${format(ex.zero)}`;
}

export function sectionsOneTwo(ex: LinearExample): Section[] {
  return [
    {
      id: 'definitions',
      title: 'What slope and zero mean',
      body:
        'Slope measures how steep a line is: rise over run. The zero is where the line crosses the x-axis — the place where y is 0.',
      widget: { kind: 'graph', showTriangle: true, showZero: true },
      steps: [
        {
          text: 'Slope is rise over run — how far up, divided by how far across.',
          why: 'Rise goes on top. Run goes on the bottom.',
        },
        { text: 'Move the slope slider and watch the rise and the run both change.' },
        { text: 'The zero is the x-value where the line reaches y = 0.' },
        {
          text: 'Read the slope off the line shown.',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
      ],
      watchFor: [
        'Rise goes on top and run on the bottom — students often divide the other way round.',
        `The zero is an x-value, not a point. Say "${zeroText(ex)}", not a coordinate pair.`,
      ],
    },
    {
      id: 'types-of-slope',
      title: 'Types of slope',
      body: 'Four kinds of line. Pick one and look at it.',
      widget: {
        kind: 'graphPreset',
        presets: [
          { label: 'Positive', m: rat(2), b: rat(1) },
          { label: 'Negative', m: rat(-2), b: rat(3) },
          { label: 'Zero', m: rat(0), b: rat(3) },
          { label: 'Undefined', vertical: rat(2) },
        ],
      },
      steps: [
        { text: 'Positive slope: the line goes up as you move to the right.' },
        { text: 'Negative slope: the line goes down as you move to the right.' },
        { text: 'Zero slope: a flat, horizontal line. It runs level.' },
        {
          text: 'Undefined slope: a straight vertical line. The run is 0, and you cannot divide by 0.',
          why: 'Undefined is not the same as zero. Zero is flat, undefined is vertical.',
        },
        {
          text: 'Which type is a slope of -2?',
          answer: {
            kind: 'choice',
            prompt: 'A slope of -2 is',
            options: ['Positive', 'Negative', 'Zero', 'Undefined'],
            correct: 1,
          },
        },
      ],
      watchFor: [
        'Zero slope and undefined slope are different things: flat versus vertical.',
        'Read the slope left to right. Reading it right to left flips the sign.',
      ],
    },
  ];
}
