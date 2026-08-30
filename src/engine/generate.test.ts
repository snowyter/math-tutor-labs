import { describe, it, expect } from 'vitest';
import { generate, exampleFrom } from './generate';
import { rat, isInteger, isZero, toNumber } from './rational';
import { yAt, zeroFromEquation } from './math';
import type { Level, TableKind } from './types';

const LEVELS: Level[] = ['gentle', 'standard', 'challenging'];
const KINDS: TableKind[] = ['includes-zero', 'excludes-zero'];

describe('generate invariants', () => {
  for (const level of LEVELS) {
    for (const kind of KINDS) {
      for (let seed = 1; seed <= 200; seed++) {
        it(`level=${level} kind=${kind} seed=${seed}`, () => {
          const ex = generate(seed, level, kind);

          // the zero matches the equation
          expect(ex.zero).toEqual(zeroFromEquation(ex.m, ex.b));

          // every table row lies on the line
          for (const row of ex.table) {
            expect(row.y).toEqual(yAt(ex.m, ex.b, row.x));
          }

          // both points lie on the line
          for (const pt of ex.points) {
            expect(pt.y).toEqual(yAt(ex.m, ex.b, pt.x));
          }

          // table rows are distinct and there are four of them
          const xs = ex.table.map((r) => r.x);
          expect(new Set(xs).size).toBe(xs.length);
          expect(ex.table.length).toBe(4);

          // the table kind is honoured
          const hasZeroRow = ex.table.some((r) => isZero(r.y));
          if (kind === 'includes-zero') expect(hasZeroRow).toBe(true);
          else expect(hasZeroRow).toBe(false);

          // gentle never produces a negative slope or a fractional zero
          if (level === 'gentle') {
            expect(toNumber(ex.m)).toBeGreaterThan(0);
            expect(ex.zero).not.toBeNull();
            expect(isInteger(ex.zero!)).toBe(true);
          }

          // includes-zero always has a whole-number zero
          if (kind === 'includes-zero') {
            expect(ex.zero).not.toBeNull();
            expect(isInteger(ex.zero!)).toBe(true);
          }

          // the zero is never trivially zero
          expect(isZero(ex.zero!)).toBe(false);
        });
      }
    }
  }
});

describe('generate determinism', () => {
  it('returns the same example for the same seed', () => {
    expect(generate(42, 'standard', 'excludes-zero')).toEqual(generate(42, 'standard', 'excludes-zero'));
  });
  it('returns different examples for different seeds', () => {
    expect(generate(1, 'standard', 'excludes-zero')).not.toEqual(generate(2, 'standard', 'excludes-zero'));
  });
});

describe('exampleFrom', () => {
  it('derives the zero for y = 2x + 6', () => {
    expect(exampleFrom(rat(2), rat(6), 'excludes-zero').zero).toEqual(rat(-3));
  });
  it('reports no zero for a horizontal line', () => {
    const ex = exampleFrom(rat(0), rat(4), 'excludes-zero');
    expect(ex.zero).toBeNull();
    expect(ex.zeroNote).toMatch(/no zero/i);
  });
  it('reports every x for the x-axis', () => {
    const ex = exampleFrom(rat(0), rat(0), 'excludes-zero');
    expect(ex.zero).toBeNull();
    expect(ex.zeroNote).toMatch(/every x/i);
  });
  it('gives two distinct points', () => {
    const ex = exampleFrom(rat(2, 3), rat(1), 'excludes-zero');
    expect(ex.points[0]!.x).not.toBe(ex.points[1]!.x);
  });
  it('keeps point coordinates integral', () => {
    const ex = exampleFrom(rat(2, 3), rat(1), 'excludes-zero');
    for (const pt of ex.points) expect(isInteger(pt.y)).toBe(true);
  });
  it('puts a zero row in the table when asked', () => {
    const ex = exampleFrom(rat(2), rat(6), 'includes-zero');
    expect(ex.table.some((r) => isZero(r.y))).toBe(true);
  });
  it('leaves the zero out of the table when asked', () => {
    const ex = exampleFrom(rat(2), rat(6), 'excludes-zero');
    expect(ex.table.some((r) => isZero(r.y))).toBe(false);
  });
});
