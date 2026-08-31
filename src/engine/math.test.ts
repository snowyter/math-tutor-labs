import { describe, it, expect } from 'vitest';
import { slopeFromPoints, zeroFromEquation, zeroFromTable, yAt, walkToZero } from './math';
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

describe('walkToZero', () => {
  it('walks down from (x, 4) on a slope-2 line: 4 hops of -1/2, landing 2 left', () => {
    const w = walkToZero(rat(4), rat(2));
    expect(w).not.toBeNull();
    expect(w!.rise).toEqual(rat(-4));
    expect(w!.hops).toBe(4);
    expect(w!.hopSize).toEqual(rat(-1, 2));
    expect(w!.run).toEqual(rat(-2));
  });
  it('walks up from (x, -2) on a slope-2 line: 2 hops of 1/2, landing 1 right', () => {
    const w = walkToZero(rat(-2), rat(2));
    expect(w!.rise).toEqual(rat(2));
    expect(w!.hops).toBe(2);
    expect(w!.hopSize).toEqual(rat(1, 2));
    expect(w!.run).toEqual(rat(1));
  });
  it('moves right for a negative slope', () => {
    const w = walkToZero(rat(6), rat(-3));
    expect(w!.hops).toBe(6);
    expect(w!.hopSize).toEqual(rat(1, 3));
    expect(w!.run).toEqual(rat(2));
  });
  it('handles a fractional slope', () => {
    const w = walkToZero(rat(3), rat(1, 2));
    expect(w!.hops).toBe(3);
    expect(w!.hopSize).toEqual(rat(-2));
    expect(w!.run).toEqual(rat(-6));
  });
  it('gives no hops when the y-value is fractional', () => {
    const w = walkToZero(rat(3, 2), rat(2));
    expect(w).not.toBeNull();
    expect(w!.hops).toBeNull();
    expect(w!.rise).toEqual(rat(-3, 2));
    expect(w!.run).toEqual(rat(-3, 4));
  });
  it('handles y0 = 0 with no hops', () => {
    const w = walkToZero(rat(0), rat(2));
    expect(w!.hops).toBe(0);
    expect(w!.run).toEqual(rat(0));
  });
  it('returns null for a zero slope', () => expect(walkToZero(rat(4), rat(0))).toBeNull());
});
