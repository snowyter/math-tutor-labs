import { parseAnswer, isCorrect } from './parse';

export type ExamChoice = {
  kind: 'choice';
  n: number;
  stem: string;
  options: string[];
  correct: number;
  explain: string;
  table?: string[][];
};

export type ExamNumeric = {
  kind: 'numeric';
  n: number;
  stem: string;
  correct: string; // the paper key's exact answer, graded via isCorrect
  accept?: string[]; // extra accepted exact strings, e.g. '3.5'
  explain: string;
  table?: string[][];
  hint?: string;
};

export type ExamItem = ExamChoice | ExamNumeric;

export type ExamPart = { id: string; title: string; pointsEach: number; items: ExamItem[] };

export type ExamEssay = { n: number; prompt: string; guide: string };

export type MockExam = {
  title: string;
  minutes: number;
  parts: ExamPart[];
  essays: ExamEssay[];
};

export type ExamResult = {
  partId: string; // the answers map is namespaced by part — see gradeExam below
  item: ExamItem;
  student: string | null; // null = unanswered
  ok: boolean;
  explain: string;
};

export type ExamScore = {
  score: number;
  of: number;
  partI: number;
  partII: number;
  results: ExamResult[];
};

const PART_I_TABLES: Record<number, string[][]> = {
  1: [
    ['A', 'B', 'C', 'D'],
    ['x', '0, 1, 2, 3', '−1, 0, 1, 2', '0, 1, 2, 3', '0, 1, 2, 3'],
    ['f(x)', '1, 2, 4, 7', '4, 6, 8, 10', '0, 1, 4, 9', '1, 1, 2, 2'],
  ],
  15: [
    ['x', '0', '1', '2', '3'],
    ['f(x)', '6', '4', '2', '0'],
  ],
};

const PART_II_TABLES: Record<number, string[][]> = {
  3: [
    ['x', '1', '3', '5', '7'],
    ['f(x)', '11', '5', '−1', '−7'],
  ],
  8: [
    ['x', '0', '1', '2', '3'],
    ['f(x)', '2', '5', '8', '11'],
  ],
};

export const MOCK_EXAM: MockExam = {
  title: 'Mock Examination: Slopes and Zeros of Linear Functions',
  minutes: 90,
  parts: [
    {
      id: 'part-i',
      title: 'Part I. Multiple Choice',
      pointsEach: 1,
      items: [
        {
          kind: 'choice', n: 1,
          stem: 'Which table of values shows a linear function?',
          table: PART_I_TABLES[1],
          options: ['Table A', 'Table B', 'Table C', 'Table D'],
          correct: 1,
          explain: 'Change in f(x) is +2, +2, +2 — constant. The others are +1,+2,+3 / +1,+3,+5 / 0,+1,0.',
        },
        {
          kind: 'choice', n: 2,
          stem: 'A linear function always has a constant _______.',
          options: ['value', 'rate of change', 'x-intercept', 'denominator'],
          correct: 1,
          explain: 'A linear function has a constant rate of change.',
        },
        {
          kind: 'choice', n: 3,
          stem: 'Slope is the ratio of the _______ change to the _______ change between two points.',
          options: ['run, rise', 'x, y', 'vertical, horizontal', 'horizontal, vertical'],
          correct: 2,
          explain: 'Slope = vertical change ÷ horizontal change.',
        },
        {
          kind: 'choice', n: 4,
          stem: 'Slope is denoted by the letter _______.',
          options: ['b', 'm', 'x', 'c'],
          correct: 1,
          explain: 'Slope is denoted by m.',
        },
        {
          kind: 'choice', n: 5,
          stem: 'Using the points (1, −1) and (3, 2), the slope is _______.',
          options: ['2/3', '3/2', '−3/2', '1/2'],
          correct: 1,
          explain: 'rise = 2 − (−1) = 3; run = 3 − 1 = 2; m = 3/2.',
        },
        {
          kind: 'choice', n: 6,
          stem: 'A line that goes up as you read from left to right has a _______ slope.',
          options: ['positive', 'negative', 'zero', 'undefined'],
          correct: 0,
          explain: 'Positive slope rises left to right.',
        },
        {
          kind: 'choice', n: 7,
          stem: 'A straight vertical line has a slope that is _______.',
          options: ['0', '1', 'undefined', 'negative'],
          correct: 2,
          explain: 'Vertical line → run = 0 → slope undefined.',
        },
        {
          kind: 'choice', n: 8,
          stem: 'A flat horizontal line has a slope of _______.',
          options: ['0', 'undefined', '1', '−1'],
          correct: 0,
          explain: 'Horizontal line → rise = 0 → slope = 0.',
        },
        {
          kind: 'choice', n: 9,
          stem: 'In f(x) = mx + b, the value of b is the _______.',
          options: ['slope', 'y-intercept', 'zero', 'x-intercept'],
          correct: 1,
          explain: 'b is the y-intercept.',
        },
        {
          kind: 'choice', n: 10,
          stem: 'In f(x) = −3x + 5, the slope is _______.',
          options: ['5', '−3', '3', '−5'],
          correct: 1,
          explain: 'm is the number multiplied by x, so m = −3.',
        },
        {
          kind: 'choice', n: 11,
          stem: 'In standard form Ax + By = C, the slope is _______.',
          options: ['A/B', '−A/B', 'C/B', '−B/A'],
          correct: 1,
          explain: 'Rearranging Ax + By = C gives y = (−A/B)x + C/B.',
        },
        {
          kind: 'choice', n: 12,
          stem: 'For 2x + 4y = 8, the slope is _______.',
          options: ['2', '−2', '1/2', '−1/2'],
          correct: 3,
          explain: 'A = 2, B = 4 → m = −2/4 = −1/2.',
        },
        {
          kind: 'choice', n: 13,
          stem: 'The zero of a function is _______.',
          options: [
            'the y-value where the line crosses the y-axis',
            'the x-value that makes the output equal to 0',
            'always equal to 0',
            'the point where x = 0',
          ],
          correct: 1,
          explain: 'The zero is the x that makes the output 0.',
        },
        {
          kind: 'choice', n: 14,
          stem: 'If a line crosses the x-axis at (4, 0), then _______.',
          options: [
            'the zero is 4, and the x-intercept is the point (4, 0)',
            'the zero is the point (4, 0)',
            'the x-intercept is 4',
            'the zero is 0',
          ],
          correct: 0,
          explain: 'Zero = the x-value 4; x-intercept = the point (4, 0).',
        },
        {
          kind: 'choice', n: 15,
          stem: 'Given the table below, the zero is _______.',
          table: PART_I_TABLES[15],
          options: ['0', '3', '6', '−2'],
          correct: 1,
          explain: 'f(x) = 0 when x = 3.',
        },
        {
          kind: 'choice', n: 16,
          stem: 'Using the same table as item 15, the slope is _______.',
          table: PART_I_TABLES[15],
          options: ['2', '−2', '6', '−6'],
          correct: 1,
          explain: '(4 − 6)/(1 − 0) = −2.',
        },
        {
          kind: 'choice', n: 17,
          stem: 'The zero of f(x) = 2x − 8 is _______.',
          options: ['−8', '−4', '4', '8'],
          correct: 2,
          explain: '0 = 2x − 8 → 2x = 8 → x = 4.',
        },
        {
          kind: 'choice', n: 18,
          stem: 'Mika has ₱150 and spends ₱30 each day. After how many days will she have ₱0 left?',
          options: ['Day 3', 'Day 4', 'Day 5', 'Day 6'],
          correct: 2,
          explain: '150 ÷ 30 = 5, so Day 5.',
        },
        {
          kind: 'choice', n: 19,
          stem: "For Mika's situation, the slope of the function is _______.",
          options: ['30', '−30', '150', '−150'],
          correct: 1,
          explain: 'Money decreases by 30 per day → slope = −30.',
        },
        {
          kind: 'choice', n: 20,
          stem: 'Which equation is NOT a linear function?',
          options: ['y = 3x − 1', '2x + y = 7', 'y = x² + 2', 'y = −x'],
          correct: 2,
          explain: 'x² has degree 2, so it is not linear.',
        },
      ],
    },
    {
      id: 'part-ii',
      title: 'Part II. Problem Solving',
      pointsEach: 4,
      items: [
        {
          kind: 'numeric', n: 1,
          stem: 'Find the slope of the line passing through (2, 5) and (6, 13).',
          correct: '2',
          explain: 'rise = 13 − 5 = 8; run = 6 − 2 = 4; m = 8/4 = 2.',
        },
        {
          kind: 'numeric', n: 2,
          stem: 'Find the slope of the line passing through (−3, 4) and (1, −2). Express in lowest terms.',
          correct: '-3/2',
          explain: 'rise = −2 − 4 = −6; run = 1 − (−3) = 4; m = −6/4 = −3/2.',
        },
        {
          kind: 'numeric', n: 3,
          stem: 'From the table below, find the slope.',
          table: PART_II_TABLES[3],
          correct: '-3',
          explain: 'Δx = 2 each step, Δf(x) = −6 each step; m = −6/2 = −3.',
        },
        {
          kind: 'numeric', n: 4,
          stem: 'Find the slope of 3x − 6y = 12.',
          correct: '1/2',
          accept: ['0.5'],
          explain: 'A = 3, B = −6 → m = −A/B = −3/(−6) = 1/2. Check: −6y = −3x + 12 → y = ½x − 2.',
        },
        {
          kind: 'numeric', n: 5,
          stem: 'Find the zero of f(x) = 5x + 15.',
          correct: '-3',
          explain: '0 = 5x + 15 → 5x = −15 → x = −3.',
        },
        {
          kind: 'numeric', n: 6,
          stem: 'Find the zero of f(x) = −2x + 7.',
          correct: '7/2',
          accept: ['3.5'],
          explain: '0 = −2x + 7 → 2x = 7 → x = 7/2 (or 3.5).',
        },
        {
          kind: 'numeric', n: 7,
          stem: 'Using the table in item 3, the value f(x) = 0 does not appear. Find the zero anyway.',
          table: PART_II_TABLES[3],
          hint: 'Find the slope, use one point to solve for b, write the equation, then set f(x) = 0.',
          correct: '14/3',
          explain: 'From item 3, m = −3. Using (1, 11): 11 = −3(1) + b → b = 14. So f(x) = −3x + 14. Set to 0: 0 = −3x + 14 → 3x = 14 → x = 14/3. Check: −3(14/3) + 14 = 0 ✓.',
        },
        {
          kind: 'numeric', n: 8,
          stem: 'Is the table below linear? Explain using the change in f(x), and give the slope if it is.',
          table: PART_II_TABLES[8],
          correct: '3',
          explain: 'Changes are +3, +3, +3 — constant, so it is linear; slope = 3/1 = 3.',
        },
        {
          kind: 'numeric', n: 9,
          stem: 'A line has rise = 2 and run = −3. What is the slope?',
          correct: '-2/3',
          explain: 'm = rise/run = 2/(−3) = −2/3.',
        },
        {
          kind: 'numeric', n: 10,
          stem: 'A water tank holds 200 litres and drains at 25 litres per hour. After how many hours is the tank empty?',
          correct: '8',
          explain: 'f(x) = −25x + 200; 0 = −25x + 200 → 25x = 200 → x = 8 hours.',
        },
      ],
    },
  ],
  essays: [
    {
      n: 1,
      prompt: 'Explain what the slope of a line means. Then describe how to find it from (a) a graph, (b) a table of values, and (c) an equation.',
      guide: 'Slope measures steepness — the ratio of vertical change to horizontal change, denoted m. From a graph: pick two points on grid corners, count rise and run, divide. From a table: divide the change in f(x) by the change in x (or use (y₂ − y₁)/(x₂ − x₁)). From an equation: in slope-intercept form f(x) = mx + b the slope is m; in standard form Ax + By = C the slope is −A/B.',
    },
    {
      n: 2,
      prompt: 'Explain the difference between the zero of a function and the x-intercept. Use a concrete example such as a line crossing at (4, 0).',
      guide: 'The zero is an x-value; the x-intercept is a point. A line crossing the x-axis at (4, 0) has x-intercept (4, 0) and zero x = 4. The answer is "x = 4", not "(4, 0)".',
    },
    {
      n: 3,
      prompt: 'Explain why a constant rate of change means a function is linear. Show your explanation with one table that is linear and one that is not.',
      guide: 'A function is linear when equal changes in x always produce equal changes in f(x). Constant-change table (+2, +2, +2) is linear; changing-change table (+1, +2, +3) is not.',
    },
    {
      n: 4,
      prompt: 'Explain what standard form (Ax + By = C) is, and show how to find the slope from an equation written in that form. Use an example.',
      guide: 'Standard form is Ax + By = C, with x and y on the same side. Rearranging gives y = (−A/B)x + C/B, so the slope is −A/B. Example: 2x + 4y = 8 → m = −1/2.',
    },
    {
      n: 5,
      prompt: 'A table of values does not contain a row where f(x) = 0. Explain how you would still find the zero. Describe the steps clearly.',
      guide: '(1) Find the slope from two columns. (2) Substitute one point into f(x) = mx + b and solve for b. (3) Write the full equation. (4) Set f(x) = 0 and solve for x. The same zero can also be found by walking from a known row using the slope.',
    },
  ],
};

export function gradeExam(answers: Map<string, string>): ExamScore {
  let partI = 0;
  let partII = 0;
  const results: ExamResult[] = [];

  for (const part of MOCK_EXAM.parts) {
    for (const item of part.items) {
      const student = answers.get(`${part.id}-${item.n}`) ?? null;
      const answered = student !== null && student.trim() !== '';
      let ok = false;

      if (answered && item.kind === 'choice') {
        ok = student === item.options[item.correct]!;
      } else if (answered && item.kind === 'numeric') {
        const key = parseAnswer(item.correct);
        if (key !== null && key !== 'none') {
          ok = isCorrect(student, key);
        }
        if (!ok && item.accept) {
          const clean = student.replace(/\s+/g, '');
          ok = item.accept.some((s) => clean === s);
        }
      }

      if (ok) {
        if (part.id === 'part-i') partI += part.pointsEach;
        else partII += part.pointsEach;
      }
      results.push({ partId: part.id, item, student, ok, explain: item.explain });
    }
  }

  return { score: partI + partII, of: 60, partI, partII, results };
}
