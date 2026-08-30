import { rat, format, equals } from '../src/engine/rational';
import type { Drill, DrillQuestion } from '../src/engine/types';

function pick<T>(rand: () => number, xs: T[]): T {
  return xs[Math.floor(rand() * xs.length)]!;
}

function intBetween(rand: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rand() * (hi - lo + 1));
}

function shuffle<T>(rand: () => number, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

const DRILL_LENGTH = 8;

function choice(
  rand: () => number,
  prompt: string,
  correct: string,
  distractors: string[],
  mistakes: { match: string; say: string }[],
): DrillQuestion {
  const options = shuffle(rand, [correct, ...distractors]);
  return {
    kind: 'choice',
    prompt,
    options,
    correct: options.indexOf(correct),
    mistakes,
  };
}

const coordinatePlane: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const q = pick(rand, [
      { prompt: 'Which way is positive x?', correct: 'Right', wrong: 'Left' },
      { prompt: 'Which way is positive y?', correct: 'Up', wrong: 'Down' },
      { prompt: 'Which way is negative x?', correct: 'Left', wrong: 'Right' },
      { prompt: 'Which way is negative y?', correct: 'Down', wrong: 'Up' },
    ]);
    const others = ['Right', 'Left', 'Up', 'Down'].filter(
      (o) => o !== q.correct && o !== q.wrong,
    );
    return choice(
      rand,
      q.prompt,
      q.correct,
      [q.wrong, ...shuffle(rand, others).slice(0, 2)],
      [
        {
          match: q.wrong,
          say: `${q.wrong} is the opposite direction — that is the negative way.`,
        },
      ],
    );
  },
};

const readingAPoint: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    let x = intBetween(rand, -5, 5);
    let y = intBetween(rand, -5, 5);
    if (x === 0) x = 2;
    if (y === 0) y = 3;

    const across = `${Math.abs(x)} ${x < 0 ? 'left' : 'right'}`;
    const up = `${Math.abs(y)} ${y < 0 ? 'down' : 'up'}`;
    const right = `${across}, ${up}`;

    const swapped = `${up}, ${across}`;
    const signFlipped = `${Math.abs(x)} ${x < 0 ? 'right' : 'left'}, ${up}`;
    const both = `${Math.abs(x)} ${x < 0 ? 'right' : 'left'}, ${Math.abs(y)} ${y < 0 ? 'up' : 'down'}`;

    const options = shuffle(rand, [right, swapped, signFlipped, both]);
    return {
      kind: 'choice',
      prompt: `Where is the point (${x}, ${y})?`,
      options,
      correct: options.indexOf(right),
      mistakes: [
        {
          match: swapped,
          say: 'You have described y first. x is the across number and always comes first.',
        },
        { match: signFlipped, say: `x is ${x}, so it goes ${x < 0 ? 'left' : 'right'}, not ${x < 0 ? 'right' : 'left'}.` },
        { match: both, say: 'Both parts are the wrong way round. Check the signs of x and y.' },
      ],
    };
  },
};

const riseAndRunCounting: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    let rise = intBetween(rand, 1, 6);
    let run = intBetween(rand, 2, 6);
    if (rise === run) run = run + 1;

    const slope = rat(rise, run);
    const flip = rat(run, rise);

    return {
      kind: 'numeric',
      prompt: `rise ${rise}, run ${run} — slope =`,
      correct: slope,
      mistakes: [
        {
          match: format(flip),
          say: `That is run ÷ rise. Rise goes on top: ${rise}/${run}.`,
        },
      ],
    };
  },
};

const subtractingNegatives: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const start = intBetween(rand, -9, -1);
    const step = intBetween(rand, 1, 9);
    const correct = start - step;
    const added = start + step;

    return {
      kind: 'numeric',
      prompt: `${start} - ${step} =`,
      correct: rat(correct),
      mistakes: [
        {
          match: String(added),
          say: `You added ${step}. Subtracting a positive number moves left on the number line.`,
        },
        {
          match: String(Math.abs(step) - Math.abs(start)),
          say: 'Keep the sign of the number you started from — you are going further left, not towards zero.',
        },
      ],
    };
  },
};

const fractionsAsDivision: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    let top = intBetween(rand, 1, 9);
    let bottom = intBetween(rand, 2, 9);
    if (bottom === top) bottom = top + 1;

    return {
      kind: 'numeric',
      prompt: `Write ${top} ÷ ${bottom} as a fraction.`,
      correct: rat(top, bottom),
      mistakes: [
        {
          match: format(rat(bottom, top)),
          say: `The first number goes on top. ${top} ÷ ${bottom} is ${top}/${bottom}.`,
        },
      ],
    };
  },
};

const simplifyingFractions: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const pairs = [
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [1, 4],
      [2, 5],
      [3, 5],
    ];
    const [a, b] = pick(rand, pairs) as [number, number];
    const k = intBetween(rand, 2, 4);

    const top = a! * k;
    const bottom = b! * k;

    return {
      kind: 'numeric',
      prompt: `Simplify ${top}/${bottom}.`,
      correct: rat(a!, b!),
      exact: true,
      mistakes: [
        {
          match: `${top}/${bottom}`,
          say: `That is the same value, but it is not simplified. Divide top and bottom by ${k}.`,
        },
      ],
    };
  },
};

const yEqualsZero: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const q = pick(rand, [
      {
        prompt: 'Where on a graph is y = 0?',
        correct: 'On the x-axis',
        wrong: 'On the y-axis',
        say: 'The y-axis is where x is 0. y = 0 is the flat axis going across.',
      },
      {
        prompt: 'What do we call the place where a line crosses the x-axis?',
        correct: 'The zero',
        wrong: 'The origin',
        say: 'The origin is only the one point (0, 0). The zero is wherever the crossing happens.',
      },
      {
        prompt: 'A point sits on the x-axis. What is its y-value?',
        correct: '0',
        wrong: '1',
        say: 'Every point on the x-axis has a y-value of 0 — that is what makes it the x-axis.',
      },
    ]);
    const others = ['Somewhere else', 'At the top', 'It depends', 'Only at the origin'].filter(
      (o) => o !== q.correct && o !== q.wrong,
    );
    return choice(
      rand,
      q.prompt,
      q.correct,
      // q.wrong must always be offered, or its feedback can never fire.
      [q.wrong, ...shuffle(rand, others).slice(0, 2)],
      [{ match: q.wrong, say: q.say }],
    );
  },
};

const solvingTwoStep: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const m = intBetween(rand, 2, 5);
    let j = intBetween(rand, -6, 6);
    if (j === 0) j = 3;

    const b = m * j;
    const correct = -j;
    const signError = j;

    // A "wrong divisor" guess can land on the right answer after rounding, so
    // only offer this mistake when it genuinely differs.
    const wrongDivisor = m === 2 ? 3 : 2;
    const candidate = -Math.round(b / wrongDivisor);
    const divideWrong = candidate === correct ? null : candidate;

    const mistakes: { match: string; say: string }[] = [
      {
        match: String(signError),
        say: `Check the sign. Taking ${Math.abs(b)} off both sides gives ${-Math.abs(b)}, so x is negative.`,
      },
    ];
    if (divideWrong !== null) {
      mistakes.push({
        match: String(divideWrong),
        say: `You divided by ${wrongDivisor} instead of by ${m}.`,
      });
    }

    return {
      kind: 'numeric',
      prompt: `Solve 0 = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}.  x =`,
      correct: rat(correct),
      mistakes,
    };
  },
};

const substitutingToCheck: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const m = intBetween(rand, 2, 4);
    let b = intBetween(rand, -9, 9);
    if (b === 0) b = -6;
    const x = intBetween(rand, -5, 5);

    const correct = m * x + b;
    const signError = m * x + Math.abs(b);

    const mistakes =
      b < 0 && !equals(rat(signError), rat(correct))
        ? [
            {
              match: String(signError),
              say: `b is ${b}, so the last step is ${m * x} - ${Math.abs(b)}, not plus.`,
            },
          ]
        : [];

    return {
      kind: 'numeric',
      prompt: `In y = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}, what is y when x = ${x}?  y =`,
      correct: rat(correct),
      mistakes,
    };
  },
};

const divisionByZero: Drill = {
  length: DRILL_LENGTH,
  make(rand) {
    const q = pick(rand, [
      {
        prompt: 'A straight vertical line has slope that is',
        correct: 'undefined',
        wrong: 'zero',
        say: 'Zero means flat and level. Vertical is different — the run is 0, and you cannot divide by 0.',
      },
      {
        prompt: 'A flat horizontal line has slope that is',
        correct: 'zero',
        wrong: 'undefined',
        say: 'Undefined means vertical. A flat line has zero rise, so the slope is 0.',
      },
      {
        prompt: 'Slope is rise over run. If the run is 0, the slope is',
        correct: 'undefined',
        wrong: '0',
        say: 'Rise over 0 is a division by 0, which has no answer. That is what undefined means.',
      },
    ]);
    const others = ['1', '-1', 'the same as the rise', 'half'].filter(
      (o) => o !== q.correct && o !== q.wrong,
    );
    return choice(
      rand,
      q.prompt,
      q.correct,
      // q.wrong must always be offered, or its feedback can never fire.
      [q.wrong, ...shuffle(rand, others).slice(0, 2)],
      [{ match: q.wrong, say: q.say }],
    );
  },
};

export const DRILLS: Record<string, Drill> = {
  'coordinate-plane': coordinatePlane,
  'reading-a-point': readingAPoint,
  'rise-and-run-counting': riseAndRunCounting,
  'subtracting-negatives': subtractingNegatives,
  'fractions-as-division': fractionsAsDivision,
  'simplifying-fractions': simplifyingFractions,
  'y-equals-zero': yEqualsZero,
  'solving-two-step-equations': solvingTwoStep,
  'substituting-to-check': substitutingToCheck,
  'division-by-zero-undefined': divisionByZero,
};
