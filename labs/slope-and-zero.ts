import { rat, format, isZero, sub, mul, div, neg } from '../src/engine/rational';
import type { LinearExample, Point, Rational, Section, Step } from '../src/engine/types';

function zeroText(ex: LinearExample): string {
  if (ex.zero === null) return 'no zero';
  return `x = ${format(ex.zero)}`;
}

// The sign of m comes from the direction of the LINE read left to right, not
// from the run: read that way the run always points right, so it carries no sign.
function signPhrase(m: Rational): string {
  if (isZero(m)) return 'runs level as you read left to right, so the slope is zero';
  return m.n < 0
    ? 'goes down as you read left to right, so the slope is negative'
    : 'goes up as you read left to right, so the slope is positive';
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

// Fixed teaching numbers from the handout's opener — deliberately NOT
// generated, so they match the worksheet the student has in front of them.
const MIKA_ROWS: Point[] = [
  { x: 0, y: rat(150) },
  { x: 1, y: rat(120) },
  { x: 2, y: rat(90) },
  { x: 3, y: rat(60) },
  { x: 4, y: rat(30) },
  { x: 5, y: rat(0) },
];

export function foundationSections(): Section[] {
  return [
    {
      id: 'what-is-linear',
      title: 'What is a linear function?',
      body: 'Mika has 150 in her wallet. She spends 30 each day for snacks.',
      widget: { kind: 'table', highlightRows: [], rows: MIKA_ROWS },
      steps: [
        {
          text: 'How much money is lost each day?',
          answer: { kind: 'numeric', prompt: 'lost each day =', correct: rat(30) },
        },
        {
          text: 'That 30 is lost every day, so the money goes down by 30. Slope is the change in the output for each 1 step across. Going down means the slope is -30.',
          why: 'Slope is a rate, not a total. Down gives a negative slope. Up gives a positive one.',
        },
        {
          text: 'Is the change the same every day?',
          answer: {
            kind: 'choice',
            prompt: 'The change is',
            options: ['The same every day', 'Different each day'],
            correct: 0,
          },
        },
        {
          text: 'On what day will Mika have 0 left?',
          answer: { kind: 'numeric', prompt: 'day =', correct: rat(5) },
        },
        {
          text: 'That day is the Zero — the x that makes the output 0.',
          why: 'The zero is the x-value, not the point.',
        },
        { text: 'A linear function graphs as a straight line.' },
        {
          text: 'It has a constant rate of change.',
          why: 'If x changes by the same amount and f(x) also changes by the same amount, it is linear.',
        },
        { text: 'Its degree is one or less.' },
        { text: 'The same function can be written three ways: an equation, a table, and a graph.' },
      ],
      watchFor: [
        'Slope is the change per day, not the total. Money going down means the slope is -30.',
        'The zero answers "when is it 0?", so it is a day number, not a money amount.',
      ],
    },
    {
      id: 'is-it-linear',
      title: 'Is it linear?',
      body: 'The change in f(x) has to be the same every time.',
      widget: {
        kind: 'tableCompare',
        tables: [
          {
            rows: [
              { x: -1, y: rat(4) },
              { x: 0, y: rat(6) },
              { x: 1, y: rat(8) },
              { x: 2, y: rat(10) },
            ],
            changes: ['+2', '+2', '+2'],
          },
          {
            rows: [
              { x: 0, y: rat(1) },
              { x: 1, y: rat(2) },
              { x: 2, y: rat(4) },
              { x: 3, y: rat(7) },
            ],
            changes: ['+1', '+2', '+3'],
          },
        ],
      },
      steps: [
        {
          text: 'Read the change in f(x) between each pair of columns.',
          why: 'Constant change means it is linear. A change that is not constant means it is not.',
        },
        {
          text: 'The first table changes by +2 every time, so it is linear. The second changes by +1, then +2, then +3, so it is not.',
        },
        {
          text: 'Which table is a linear function?',
          answer: {
            kind: 'choice',
            prompt: 'The linear function is',
            options: ['The first table', 'The second table', 'Both of them', 'Neither of them'],
            correct: 0,
          },
        },
        { text: 'On a graph, a linear function is a straight line.' },
        {
          text: 'In an equation, the degree of x is one or less — no x-squared, no x in a denominator.',
        },
      ],
      watchFor: [
        'A constant change in f(x) is the test — not whether the numbers look nice.',
        'Check every gap, not just the first one: +1, +2, +3 hides a change that is not constant.',
      ],
    },
  ];
}

export function conceptSections(ex: LinearExample): Section[] {
  // Both readings of the crossing come from the example so the words always
  // match the line on screen: "x = 4" is the zero, "(4, 0)" the x-intercept.
  // A flat line has no crossing at all — the slope slider can reach m = 0 — so
  // say that instead of naming a point that is not there.
  const z = ex.zero;
  const zx = z === null ? '' : format(z);
  const zPoint = `(${zx}, 0)`;
  const zZero = zeroText(ex);
  const crossingSteps: Step[] =
    z === null
      ? [{ text: ex.zeroNote ?? 'This line has no zero.' }]
      : [
          {
            text: `This line crosses the x-axis at ${zPoint}. The x-intercept is the point ${zPoint}, but the zero is ${zZero} — the x-value on its own.`,
            why: 'The zero is the x-value, not the point.',
          },
          {
            text: `This line crosses the x-axis at ${zPoint}. What is the zero?`,
            answer: {
              kind: 'choice',
              prompt: 'The zero is',
              options: [zZero, `the point ${zPoint}`, `y = ${zx}`, '0'],
              correct: 0,
            },
          },
        ];

  return [
    {
      id: 'slope-recall',
      title: 'Slope',
      body:
        'Slope describes how steep a line is. It is the ratio of the vertical change to the horizontal change between two points. It is also called the rate of change.',
      widget: { kind: 'graph', showTriangle: true, showZero: false },
      steps: [
        {
          text: 'Slope is vertical change over horizontal change. It is written m.',
          why: 'Vertical on top, horizontal on the bottom.',
        },
        { text: 'The vertical change is the rise. The horizontal change is the run.' },
        {
          text: 'Written with two points, that is (y₂ − y₁)/(x₂ − x₁).',
          why: 'The y-difference is the rise, the x-difference is the run — same thing in symbols.',
        },
        {
          text: 'm is positive when the line goes up as you read left to right. It is negative when the line goes down.',
        },
        {
          text: 'What is the slope?',
          answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
        },
        // Kept after the question on purpose: StepReveal leaves revealed steps
        // on screen, so quoting m any earlier would hand over the answer.
        {
          text: `Here m is ${format(ex.m)} — the line ${signPhrase(ex.m)}.`,
          why: 'Read the line left to right. That direction decides the sign.',
        },
      ],
      watchFor: [
        'Rise goes on top and run on the bottom — students often divide the other way round.',
        'Take the rise and the run in the same direction. Mixing the two is what flips the sign.',
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
      watchFor: ['Zero slope and undefined slope are different things: flat versus vertical.'],
    },
    {
      id: 'zero-of-a-function',
      title: 'The zero of a function',
      body: 'The zero is the value of x that makes the output equal to zero.',
      widget: { kind: 'graph', showTriangle: false, showZero: true },
      steps: [
        { text: 'The zero of a function is the value of x that makes the output equal to zero.' },
        { text: 'In a table, it is the x-value where f(x)=0.' },
        { text: 'In a graph, it is the x-value where the line crosses the x-axis.' },
        ...crossingSteps,
      ],
      watchFor: [
        'The zero is an x-value. The x-intercept is the point. The handout tests this distinction.',
        ...(z === null ? [] : [`Say "${zZero}", not "${zPoint}".`]),
      ],
    },
  ];
}

export function representationSections(ex: LinearExample): Section[] {
  const rows = ex.table;
  const zeroRowIndex = rows.findIndex((r) => isZero(r.y));
  const zero = ex.zero ?? 'none';

  // The algebra route to the zero: work b out of y = mx + b over the table's
  // first row, printed as a full chain so nothing is skipped when read aloud.
  const row0 = rows[0]!;
  const mx0 = mul(ex.m, rat(row0.x));
  const bVal = sub(row0.y, mx0);
  const bWorked =
    `Take the row x = ${row0.x}, y = ${format(row0.y)}: ` +
    `b = ${signedRat(row0.y)} − ${signedRat(ex.m)} × ${signedInt(row0.x)}` +
    ` = ${signedRat(row0.y)} − ${signedRat(mx0)} = ${format(bVal)}`;

  // The zero, worked the same way: 0 = mx + b, take b off both sides, read off x.
  // Branch on the zero itself rather than dividing by m — the slope slider can
  // reach m = 0, and div() throws on a zero denominator. "0 = 2x − 8" reads
  // better aloud than "0 = 2x + (-8)", so the sign goes on the operator.
  const zeroRat = ex.zero;
  const flat = zeroRat === null;
  const bTerm = bVal.n < 0 ? `− ${format(neg(bVal))}` : `+ ${format(bVal)}`;
  const zeroWorked = flat
    ? `0 = ${signedRat(ex.m)}x ${bTerm} → 0 = ${format(bVal)}`
    : `0 = ${signedRat(ex.m)}x ${bTerm} → ${format(neg(bVal))} = ${signedRat(ex.m)}x → x = ${format(zeroRat)}`;

  const tableSection: Section =
    ex.tableKind === 'includes-zero'
      ? {
          id: 'from-table',
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
          id: 'from-table',
          title: 'From a table with no y = 0',
          body:
            'There is no row where y is 0, so the zero cannot be read off. Find the slope first, then walk to it.',
          widget: { kind: 'walkToZero', row: 0 },
          steps: [
            // The slope slider reaches m = 0, and then y never changes: there
            // is no zero to walk to and no m to divide by. Every line below
            // that claims a zero swaps to saying so.
            ...(flat
              ? [
                  {
                    text: `Look down the y row: it reads ${format(row0.y)} in every column. This line is flat, so y never changes.`,
                    why: 'Zero slope means level — see Types of slope.',
                  },
                ]
              : [
                  { text: 'There is no 0 in the y row, so the zero is not in the table.' },
                  {
                    text: 'The line still crosses the x-axis — just between the rows we have.',
                    why: 'The table only shows a few points. The line goes on past them.',
                  },
                ]),
            {
              text: 'First find the slope from any two columns.',
              answer: { kind: 'numeric', prompt: 'slope =', correct: ex.m },
            },
            {
              text: bridgeText(rows),
              why: 'That is why slope is also called the rate of change — how much y changes for each 1 step across.',
            },
            ...(flat
              ? [
                  {
                    text: 'The walk slides across on the slope. This line has none, so there is nothing to walk.',
                  },
                ]
              : [
                  {
                    text: 'Now walk from the first row: come down to y = 0, sliding across as you go. Where you land is the zero.',
                    why: 'Each 1 down is 1/m across. So x = the column x minus y over m.',
                  },
                ]),
            {
              text: 'What is the zero?',
              answer: { kind: 'numeric', prompt: 'zero: x =', correct: zero },
            },
            // Kept below the question on purpose: StepReveal leaves revealed
            // steps on screen, so printing the zero here would hand it over.
            {
              text: 'A second way: use the slope and one row to find b, then solve f(x) = 0.',
              why: 'Write y = mx + b, put in the row, work out b, then set y to 0.',
            },
            {
              text: `Here the slope is ${format(ex.m)}, so b = y − ${signedRat(ex.m)}x. ${bWorked}.`,
            },
            {
              text:
                `Now set y to 0 and solve for x: ${zeroWorked}.` +
                // the flat line's own case is the conclusion: no zero, or every x
                (flat ? ` ${ex.zeroNote ?? 'This line has no zero.'}` : ''),
              why: flat
                ? 'Finding the zero means dividing by m, and here m is 0 — you cannot divide by 0.'
                : 'Take b off both sides first, then divide by m.',
            },
            // One closing line for both cases: it must not name a zero, since
            // a flat line has none for the two routes to give.
            {
              text: 'Both ways agree. Use the walk to see it, the algebra to work it out.',
            },
          ],
          watchFor: [
            'No y = 0 in the table does not mean there is no zero — the line still crosses, just between rows.',
            'Order matters here: find the slope first, then the zero.',
            'A negative y means the zero sits to the right of that row; a positive y puts it to the left.',
          ],
        };

  return [
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
        {
          text: 'One special case: a straight vertical line has no run at all, so its slope is undefined — see Types of slope.',
        },
      ],
      watchFor: [
        'Pick points on grid corners. Points elsewhere give fractions that are hard to count.',
        'The zero is where it crosses the x-axis, not the y-axis.',
      ],
    },
    {
      id: 'from-equation',
      title: 'From an equation',
      body: 'In y = mx + b, the slope and the y-intercept are both sitting in the equation.',
      widget: { kind: 'zeroLine' },
      steps: [
        { text: 'm is the number multiplied by x — that is the slope.' },
        { text: 'b is the number on its own — where the line crosses the y-axis.' },
        {
          text: 'This is called slope-intercept form, because it hands you the slope and the y-intercept directly.',
        },
        {
          text: 'The zero is where y is 0, so solve 0 = mx + b.',
          why: 'Set y to 0 because the zero is where the line meets the x-axis.',
        },
        { text: 'Take b off both sides, then divide by m. So x = -b/m. Watch the signs on the number line.' },
        {
          text: 'An equation can also be written in standard form: Ax + By = C.',
          why: 'The x and y sit on the same side, so the slope is no longer visible.',
        },
        {
          text: 'In standard form the slope is −A/B.',
          why: 'Rearranging Ax + By = C into slope-intercept form gives y = (−A/B)x + C/B.',
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
        'm is the number times x, not the number on its own.',
        'The zero is negative b divided by m — the sign is the usual place it goes wrong.',
        'When m is positive the zero sits on the opposite side of 0 from b; a negative m keeps it on the same side.',
      ],
    },
    tableSection,
  ];
}

export function sectionsFor(ex: LinearExample): Section[] {
  return [...foundationSections(), ...conceptSections(ex), ...representationSections(ex)];
}
