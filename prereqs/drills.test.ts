import { describe, it, expect } from 'vitest';
import { DRILLS } from './drills';
import { PREREQS } from './index';
import { rat, equals, isInteger } from '../src/engine/rational';
import { parseAnswer } from '../src/engine/parse';
import { makeRand } from '../src/engine/generate';

const IDS = Object.keys(DRILLS);

describe('coverage', () => {
  it('gives every prerequisite lesson a drill', () => {
    for (const lesson of PREREQS) {
      expect(DRILLS[lesson.id], `no drill for ${lesson.id}`).toBeDefined();
    }
  });

  it('has no drills for lessons that do not exist', () => {
    const lessonIds = new Set(PREREQS.map((l) => l.id));
    for (const id of IDS) expect(lessonIds.has(id), `orphan drill ${id}`).toBe(true);
  });
});

describe('structure', () => {
  for (const id of IDS) {
    for (let seed = 1; seed <= 60; seed++) {
      it(`${id} seed=${seed} is well formed`, () => {
        const q = DRILLS[id]!.make(makeRand(seed));

        if (q.kind === 'choice') {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.correct).toBeGreaterThanOrEqual(0);
          expect(q.correct).toBeLessThan(q.options.length);

          for (const m of q.mistakes ?? []) {
            const hit = q.options.find(
              (o) => o.trim().toLowerCase() === m.match.trim().toLowerCase(),
            );
            expect(hit, `mistake "${m.match}" is not an option`).toBeDefined();
            // A mistake must never describe the correct answer.
            expect(hit).not.toBe(q.options[q.correct]);
          }
        } else {
          // Answers must be stored already reduced, so display never shows 4/6.
          if (q.correct !== 'none') {
            expect(rat(q.correct.n, q.correct.d)).toEqual(q.correct);
          }

          for (const m of q.mistakes ?? []) {
            const parsed = parseAnswer(m.match);
            expect(parsed, `mistake "${m.match}" does not parse`).not.toBeNull();
            if (q.correct !== 'none' && parsed !== null && parsed !== 'none') {
              if (q.exact) {
                // In exact mode the mistake is the same VALUE written the wrong
                // way, so it must equal the answer as a value.
                expect(equals(parsed, q.correct)).toBe(true);
              } else {
                expect(equals(parsed, q.correct)).toBe(false);
              }
            }
          }
        }
      });
    }
  }
});

// These read the numbers back out of the prompt string and redo the
// arithmetic, so a wrong `correct` cannot slip through.
describe('arithmetic', () => {
  it('rise and run gives rise over run', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['rise-and-run-counting']!.make(makeRand(seed));
      const m = /rise (-?\d+), run (-?\d+)/.exec(q.kind === 'numeric' ? q.prompt : '');
      expect(m).not.toBeNull();
      const expected = rat(Number(m![1]), Number(m![2]));
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
    }
  });

  it('subtracting a positive moves left', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['subtracting-negatives']!.make(makeRand(seed));
      const m = /^(-?\d+) - (\d+) =/.exec(q.kind === 'numeric' ? q.prompt : '');
      expect(m).not.toBeNull();
      const expected = rat(Number(m![1]) - Number(m![2]));
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
    }
  });

  it('a division becomes a fraction', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['fractions-as-division']!.make(makeRand(seed));
      const m = /Write (\d+) ÷ (\d+)/.exec(q.kind === 'numeric' ? q.prompt : '');
      expect(m).not.toBeNull();
      const expected = rat(Number(m![1]), Number(m![2]));
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
    }
  });

  it('simplifying reduces the fraction', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['simplifying-fractions']!.make(makeRand(seed));
      const m = /Simplify (\d+)\/(\d+)/.exec(q.kind === 'numeric' ? q.prompt : '');
      expect(m).not.toBeNull();
      const expected = rat(Number(m![1]), Number(m![2]));
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
      // and the answer really is simpler than the question
      expect(q.kind === 'numeric' && q.correct !== 'none' && q.correct.d).toBeLessThan(Number(m![2]));
    }
  });

  it('solving 0 = mx + b gives -b/m', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['solving-two-step-equations']!.make(makeRand(seed));
      const m = /Solve 0 = (\d+)x ([+-]) (\d+)/.exec(q.kind === 'numeric' ? q.prompt : '');
      expect(m).not.toBeNull();
      const slope = Number(m![1]);
      const b = (m![2] === '-' ? -1 : 1) * Number(m![3]);
      const expected = rat(-b, slope);
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
      // the answer is always a whole number, so the student is not fighting fractions
      expect(q.kind === 'numeric' && q.correct !== 'none' && isInteger(q.correct)).toBe(true);
    }
  });

  it('substituting gives y = mx + b', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const q = DRILLS['substituting-to-check']!.make(makeRand(seed));
      const m = /y = (\d+)x ([+-]) (\d+), what is y when x = (-?\d+)/.exec(
        q.kind === 'numeric' ? q.prompt : '',
      );
      expect(m).not.toBeNull();
      const slope = Number(m![1]);
      const b = (m![2] === '-' ? -1 : 1) * Number(m![3]);
      const x = Number(m![4]);
      const expected = rat(slope * x + b);
      expect(q.kind === 'numeric' && q.correct !== 'none' && equals(q.correct, expected)).toBe(true);
    }
  });
});
