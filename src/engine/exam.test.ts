import { describe, it, expect } from 'vitest';
import { MOCK_EXAM, gradeExam } from './exam';
import { isCorrect, parseAnswer } from './parse';

describe('mock exam data integrity', () => {
  it('has 20 + 10 auto-scored items and 5 essays', () => {
    const [i, ii] = MOCK_EXAM.parts;
    expect(i!.items).toHaveLength(20);
    expect(ii!.items).toHaveLength(10);
    expect(MOCK_EXAM.essays).toHaveLength(5);
  });

  it('auto-scored totals match the paper exam (60 points)', () => {
    const [i, ii] = MOCK_EXAM.parts;
    expect(i!.items.length * i!.pointsEach).toBe(20);
    expect(ii!.items.length * ii!.pointsEach).toBe(40);
  });

  it('numbers items uniquely within each part', () => {
    for (const part of MOCK_EXAM.parts) {
      const ns = part.items.map((x) => x.n);
      expect(new Set(ns).size).toBe(ns.length);
    }
  });

  it('keeps choice correct indexes in range', () => {
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'choice') {
          expect(item.correct).toBeGreaterThanOrEqual(0);
          expect(item.correct).toBeLessThan(item.options.length);
        }
      }
    }
  });

  it('numeric keys are well-formed: each key parses and grades as its own answer', () => {
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'numeric') {
          // the key itself must parse; isCorrect(key, parsedKey) proves the
          // key is well-formed and would grade a student who typed it exactly
          const parsed = parseAnswer(item.correct);
          expect(parsed).not.toBeNull();
          expect(isCorrect(item.correct, parsed!)).toBe(true);
        }
      }
    }
  });

  it('renders rectangular tables: every row has the same number of cells', () => {
    // A ragged table misaligns in the browser — a 4-cell letter header over a
    // 5-cell data grid puts each letter over the wrong table (found on item
    // part-i-1, where ['A','B','C','D'] sat above ['x', …, …, …, …]).
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (!item.table) continue;
        const lens = item.table.map((row) => row.length);
        expect(new Set(lens).size).toBe(1);
      }
    }
  });

  it('labels each exam table column with its choice letter', () => {
    // Item part-i-1's options are Table A..D, so its table's column headers
    // must read A, B, C, D over the four data columns — not over the row
    // labels.
    const item = MOCK_EXAM.parts[0]!.items.find((x) => x.n === 1)!;
    expect(item.kind).toBe('choice');
    if (item.kind === 'choice' && item.table) {
      expect(item.table[0]).toEqual(['', 'A', 'B', 'C', 'D']);
      expect(item.table[1]![0]).toBe('x');
      expect(item.table[2]![0]).toBe('f(x)');
    }
  });
});

describe('gradeExam', () => {
  function allCorrect(): Map<string, string> {
    const answers = new Map<string, string>();
    for (const part of MOCK_EXAM.parts) {
      for (const item of part.items) {
        if (item.kind === 'choice') answers.set(`${part.id}-${item.n}`, item.options[item.correct]!);
        else answers.set(`${part.id}-${item.n}`, item.correct);
      }
    }
    return answers;
  }

  it('gives a perfect paper 60/60', () => {
    const s = gradeExam(allCorrect());
    expect(s.score).toBe(60);
    expect(s.partI).toBe(20);
    expect(s.partII).toBe(40);
  });

  it('grades a blank paper 0/60 without crashing', () => {
    const s = gradeExam(new Map());
    expect(s.score).toBe(0);
    expect(s.results.every((r) => !r.ok)).toBe(true);
  });

  it('treats unanswered as wrong, not a crash', () => {
    const answers = allCorrect();
    answers.delete('part-i-5');
    const s = gradeExam(answers);
    expect(s.score).toBe(59);
  });

  it('does not let Part II answers collide with Part I item numbers', () => {
    // Part I item 1 and Part II item 1 are different questions; answering
    // Part I item 1's correct text must not mark Part II item 1.
    const answers = allCorrect();
    const partIItem1 = MOCK_EXAM.parts[0]!.items[0]!;
    answers.delete(`part-ii-1`);
    answers.set(`part-i-1`, partIItem1.kind === 'choice' ? partIItem1.options[partIItem1.correct]! : '');
    const s = gradeExam(answers);
    const ii1 = s.results.find((r) => r.partId === 'part-ii' && r.item.n === 1)!;
    expect(ii1.ok).toBe(false);
  });

  it('accepts the documented alternate forms', () => {
    const answers = allCorrect();
    // item II-4 accepts 0.5 for 1/2; item II-6 accepts 3.5 for 7/2
    answers.set('part-ii-4', '0.5');
    answers.set('part-ii-6', '3.5');
    const s = gradeExam(answers);
    expect(s.partII).toBe(40);
  });

  it('parses decimal and fraction forms of the same value as equal', () => {
    const answers = allCorrect();
    answers.set('part-ii-2', '-1.5');
    const s = gradeExam(answers);
    expect(s.partII).toBe(40);
  });
});
