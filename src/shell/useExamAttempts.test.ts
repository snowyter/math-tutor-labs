import { describe, it, expect } from 'vitest';
import { pushAttempt, capAttempts } from './useExamAttempts';
import type { ExamAttempt } from './useExamAttempts';

const a = (score: number, at: number): ExamAttempt => ({
  score,
  of: 60,
  partI: score,
  partII: 0,
  updatedAt: at,
});

describe('exam attempt list logic', () => {
  it('prepends the newest attempt', () => {
    const next = pushAttempt([], a(50, 1));
    expect(next).toHaveLength(1);
    expect(next[0]!.score).toBe(50);
  });

  it('caps history at 10, dropping the oldest', () => {
    // Stored newest-first: score 9 is the most recent, score 0 the oldest.
    const full = Array.from({ length: 10 }, (_, i) => a(9 - i, 9 - i));
    const next = pushAttempt(full, a(99, 100));
    expect(next).toHaveLength(10);
    expect(next[0]!.score).toBe(99);
    expect(next.some((x) => x.score === 0)).toBe(false);
  });

  it('capAttempts is a no-op under the cap', () => {
    expect(capAttempts([a(1, 1)])).toHaveLength(1);
  });
});
