import { describe, expect, it } from 'vitest';
import { splitPoints } from './ZeroLine';

describe('zero line split points', () => {
  it('splits the way from 0 to -b into m equal parts', () => {
    // 0 = 3x + 6  ->  -b = -6, m = 3, zero = -2
    expect(splitPoints(-6, 3, -2)).toEqual([-4]);
  });

  it('leaves out the point that the zero marker already covers', () => {
    // The first split point IS the zero, so drawing it would hide a tick
    // under the zero circle and make the count look wrong.
    for (const m of [2, 3, 4, 5]) {
      const negB = -6;
      const zero = negB / m;
      const points = splitPoints(negB, m, zero);
      expect(points).not.toContain(zero);
      expect(points).toHaveLength(Math.abs(m) - 2);
    }
  });

  it('keeps the interior points evenly spaced by the zero', () => {
    for (const m of [-4, -3, -2, 2, 3, 4]) {
      const negB = -12;
      const zero = negB / m;
      const points = splitPoints(negB, m, zero);
      for (const p of points) {
        const ratio = p / zero;
        expect(Number.isInteger(ratio)).toBe(true);
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(Math.abs(m) - 1);
      }
    }
  });

  it('draws nothing when there is only one part', () => {
    expect(splitPoints(-6, 1, -6)).toEqual([]);
    expect(splitPoints(-6, -1, 6)).toEqual([]);
  });
});
