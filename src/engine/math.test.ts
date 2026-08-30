import { describe, it, expect } from 'vitest';
import { slopeFromPoints, zeroFromEquation, zeroFromTable, yAt } from './math';
import { rat } from './rational';
import type { Point } from './types';

const p = (x: number, yN: number, yD = 1): Point => ({ x, y: rat(yN, yD) });

describe('slopeFromPoints', () => {
  it('finds a positive integer slope', () => expect(slopeFromPoints(p(0, 1), p(2, 5))).toEqual(rat(2)));
  it('finds a negative slope', () => expect(slopeFromPoints(p(0, 5), p(2, 1))).toEqual(rat(-2)));
  it('finds a fractional slope', () => expect(slopeFromPoints(p(0, 0), p(3, 2))).toEqual(rat(2, 3)));
  it('finds a zero slope', () => expect(slopeFromPoints(p(0, 3), p(4, 3))).toEqual(rat(0)));
  it('returns null for a vertical pair', () => expect(slopeFromPoints(p(2, 0), p(2, 5))).toBeNull());
  it('is direction independent', () =>
    expect(slopeFromPoints(p(2, 5), p(0, 1))).toEqual(slopeFromPoints(p(0, 1), p(2, 5))));
});

describe('zeroFromEquation', () => {
  it('solves y = 2x + 6', () => expect(zeroFromEquation(rat(2), rat(6))).toEqual(rat(-3)));
  it('solves a fractional result', () => expect(zeroFromEquation(rat(2), rat(3))).toEqual(rat(-3, 2)));
  it('solves y = -3x + 9', () => expect(zeroFromEquation(rat(-3), rat(9))).toEqual(rat(3)));
  it('solves y = 2x - 7', () => expect(zeroFromEquation(rat(2), rat(-7))).toEqual(rat(7, 2)));
  it('returns null for a horizontal line', () => expect(zeroFromEquation(rat(0), rat(5))).toBeNull());
  it('returns null for the x-axis', () => expect(zeroFromEquation(rat(0), rat(0))).toBeNull());
  it('returns zero for y = 2x', () => expect(zeroFromEquation(rat(2), rat(0))).toEqual(rat(0)));
});

describe('yAt', () => {
  it('evaluates the line at an integer x', () => expect(yAt(rat(2), rat(3), 4)).toEqual(rat(11)));
  it('evaluates at a negative x', () => expect(yAt(rat(2), rat(3), -2)).toEqual(rat(-1)));
  it('evaluates a fractional slope', () => expect(yAt(rat(2, 3), rat(1), 3)).toEqual(rat(3)));
});

describe('zeroFromTable', () => {
  it('reads the zero straight off a row that has one', () => {
    const table = [p(-1, 3), p(0, 2), p(1, 1), p(2, 0)];
    expect(zeroFromTable(table, rat(-1))).toEqual(rat(2));
  });
  it('extrapolates when no row has y = 0', () => {
    const table = [p(0, 3), p(1, 5), p(2, 7), p(3, 9)];
    expect(zeroFromTable(table, rat(2))).toEqual(rat(-3, 2));
  });
  it('returns null when the slope is zero', () => {
    const table = [p(0, 4), p(1, 4), p(2, 4), p(3, 4)];
    expect(zeroFromTable(table, rat(0))).toBeNull();
  });
  it('returns null for an empty table', () => expect(zeroFromTable([], rat(2))).toBeNull());
});
