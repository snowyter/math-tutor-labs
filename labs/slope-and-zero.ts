import { rat, format, isZero, sub, div } from '../src/engine/rational';
import type { LinearExample, Point, Rational, Section } from '../src/engine/types';

function zeroText(ex: LinearExample): string {
  if (ex.zero === null) return 'no zero';
  return `x = ${format(ex.zero)}`;
}

function signedInt(v: number): string {
  return v < 0 ? `(${v})` : String(v);
}

function signedRat(v: Rational): string {
  return v.n < 0 ? `(${format(v)})` : format(v);
}

// DepEd teaches rise/run and the coordinate formula (y₂ − y₁)/(x₂ − x₁) as
// the same idea, so bridge between them using the table's own two rows.
function bridgeText(rows: Point[]): string {
  const a = rows[0]!;
  const b = rows[1]!;
  const rise = sub(b.y, a.y);
  const run = rat(b.x - a.x);
  // "2/1 = 2" is worth showing; "1/2 = 1/2" is just noise.
  const ratio = `${format(rise)}/${format(run)}`;
  const slope = format(div(rise, run));
  const shown = ratio === slope ? ratio : `${ratio} = ${slope}`;
  return (
    `Take two columns: (${a.x}, ${format(a.y)}) and (${b.x}, ${format(b.y)}). ` +
    `The rise is the change in y: ${signedRat(b.y)} − ${signedRat(a.y)} = ${format(rise)}. ` +
    `The run is the change in x: ${signedInt(b.x)} − ${signedInt(a.x)} = ${format(run)}. ` +
    `So the slope is ${shown}. ` +
    `Written with coordinates, that is (y₂ − y₁)/(x₂ − x₁) — the same thing.`
  );
}

export function sectionsOneTwo(ex: LinearExample): Section[] {
  return [
    {
      id: 'definitions',
      title: 'What slope and zero mean',
      body:
        'Slope measures how steep a line is: rise over run. It is also called the rate of change. The zero is where the line crosses the x-axis — the place where y is 0.',
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

export function sectionsThreeFive(ex: LinearExample): Section[] {
  const rows = ex.table;
  const zeroRowIndex = rows.findIndex((r) => isZero(r.y));
  const zero = ex.zero ?? 'none';

  const tableSection: Section =
    ex.tableKind === 'includes-zero'
      ? {
          id: 'from-table-includes',
          title: 'From a table that includes y = 0',
          body: 'When the table has a row where y is 0, the zero is sitting right there — read it off.',
          widget: {
            kind: 'table',
            highlightRows: [zeroRowIndex, Math.min(zeroRowIndex + 1, rows.length - 1)],
          },
          steps: [
            {
              text: 'Look down the y row for a 0.',
              why: 'A y-value of 0 means that point sits on the x-axis.',
            },
            { text: `The x above it is the zero: ${zeroText(ex)}.` },
            {
              text: 'For the slope, take any two columns. Rise is the change in y, run is the change in x.',
            },
            {
              text: 'What is the zero?',
              answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
            },
            {
              text: 'What is the slope?',
              answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
            },
            {
              text: bridgeText(rows),
              why: 'That is why slope is also called the rate of change — how much y changes for each 1 step across.',
            },
          ],
          watchFor: [
            'Any two columns give the same slope — pick easy ones.',
            'The zero is the x above the 0, not the 0 itself.',
            '(y₂ − y₁)/(x₂ − x₁) is just rise over run written with coordinates — keep the y-difference on top.',
          ],
        }
      : {
          id: 'from-table-excludes',
          title: 'From a table with no y = 0',
          body:
            'There is no row where y is 0, so the zero cannot be read off. Find the slope first, then walk to it.',
          widget: { kind: 'walkToZero', row: 0 },
          steps: [
            { text: 'There is no 0 in the y row, so the zero is not in the table.' },
            {
              text: 'The line still crosses the x-axis — just between the rows we have.',
              why: 'The table only shows a few points. The line goes on past them.',
            },
            {
              text: 'First find the slope from any two columns.',
              answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
            },
            {
              text: bridgeText(rows),
              why: 'That is why slope is also called the rate of change — how much y changes for each 1 step across.',
            },
            {
              text: 'Now walk from the first row: come down to y = 0, sliding across as you go. Where you land is the zero.',
              why: 'Each 1 down is 1/m across. So x = the column x minus y over m.',
            },
            {
              text: 'What is the zero?',
              answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
            },
          ],
          watchFor: [
            'No y = 0 in the table does not mean there is no zero — the line still crosses, just between rows.',
            'Order matters here: find the slope first, then the zero.',
            'A negative y means the zero sits to the right of that row; a positive y puts it to the left.',
          ],
        };

  return [
    tableSection,
    {
      id: 'from-equation',
      title: 'From an equation',
      body: 'In y = mx + b, the slope and the y-intercept are both sitting in the equation.',
      widget: { kind: 'zeroLine' },
      steps: [
        { text: 'm is the number multiplied by x — that is the slope.' },
        { text: 'b is the number on its own — where the line crosses the y-axis.' },
        {
          text: 'The zero is where y is 0, so solve 0 = mx + b.',
          why: 'Set y to 0 because the zero is where the line meets the x-axis.',
        },
        { text: 'Take b off both sides, then divide by m. So x = -b/m. Watch the signs on the number line.' },
        {
          text: 'What is the slope?',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
        {
          text: 'What is the zero?',
          answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
        },
      ],
      watchFor: [
        'm is the number times x, not the number on its own.',
        'The zero is negative b divided by m — the sign is the usual place it goes wrong.',
        'When m is positive the zero sits on the opposite side of 0 from b; a negative m keeps it on the same side.',
      ],
    },
    {
      id: 'from-graph',
      title: 'From a graph',
      body: 'Read the slope and the zero straight off the picture.',
      widget: { kind: 'graph', showTriangle: true, showZero: true },
      steps: [
        { text: 'Find two points on the line that sit exactly on grid corners.' },
        { text: 'Count squares up or down between them — that is the rise.' },
        { text: 'Count squares across — that is the run.' },
        { text: 'Slope is rise over run.', why: 'Rise on top, run on the bottom.' },
        {
          text: 'Follow the line down to where it crosses the x-axis. That x is the zero.',
        },
        {
          text: 'What is the slope?',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
        {
          text: 'What is the zero?',
          answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
        },
      ],
      watchFor: [
        'Pick points on grid corners. Points elsewhere give fractions that are hard to count.',
        'The zero is where it crosses the x-axis, not the y-axis.',
      ],
    },
  ];
}

export function sectionsFor(ex: LinearExample): Section[] {
  return [...sectionsOneTwo(ex), ...sectionsThreeFive(ex)];
}
